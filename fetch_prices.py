#!/usr/bin/env python3
"""Fetch hourly OHLC candles from Yahoo Finance for every symbol we've
traded or currently hold, cache each ticker to `site/data/prices/<TICKER>.json`
so the dashboard can lazy-load them on demand.

Symbols are collected from data/metrics.json (so analytics.py must run first).
Options are mapped to their underlying. Cash is skipped.

Yahoo endpoint:
  https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1h&range=2y

Standard library only.
"""

import argparse
import glob
import json
import os
import sys
import time
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

YAHOO_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
USER_AGENT = "Mozilla/5.0 (compatible; ibkr-dashboard/1.0; +local)"
PRICES_SUBDIR = os.path.join("site", "data", "prices")

# 默认两 pass：粗粒度兜底 + 短窗口高分辨率。前端按交易范围自适应选用。
# 文件名规则：suffix="" → <TICKER>.json；suffix=".5m" → <TICKER>.5m.json
DEFAULT_PASSES = [
    {"interval": "1h", "range_": "2y",  "suffix": ""},
    {"interval": "5m", "range_": "60d", "suffix": ".5m"},
]


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_one(ticker, interval, range_, timeout=30):
    """Hit Yahoo's chart endpoint. Return (candles, error).
       candles = [{t: ms-epoch, o, h, l, c, v}, ...]"""
    url = "%s?interval=%s&range=%s" % (
        YAHOO_URL.format(ticker=ticker), interval, range_)
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
    except HTTPError as e:
        return None, "HTTP %s" % e.code
    except URLError as e:
        return None, "URL %s" % e.reason
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return None, "non-JSON response"

    chart = data.get("chart") or {}
    if chart.get("error"):
        return None, "yahoo: %s" % chart["error"]
    result = chart.get("result") or []
    if not result:
        return None, "no result"
    r = result[0]
    timestamps = r.get("timestamp") or []
    quote = ((r.get("indicators") or {}).get("quote") or [{}])[0]
    opens = quote.get("open") or []
    highs = quote.get("high") or []
    lows = quote.get("low") or []
    closes = quote.get("close") or []
    vols = quote.get("volume") or []

    candles = []
    for i, ts in enumerate(timestamps):
        if i >= len(closes) or closes[i] is None:
            continue                              # 跳过盘外 null
        candles.append({
            "t": int(ts) * 1000,                  # ms-epoch（JS Date 直接用）
            "o": opens[i], "h": highs[i], "l": lows[i], "c": closes[i],
            "v": vols[i] if i < len(vols) else None,
        })
    return candles, None


def unique(seq):
    seen = set()
    out = []
    for item in seq:
        if item and item not in seen:
            seen.add(item)
            out.append(item)
    return out


def yahoo_ticker_candidates(sym):
    """Return Yahoo ticker candidates for an IBKR symbol.

    IBKR often reports Hong Kong tickers as plain numeric symbols (e.g. 7709),
    while Yahoo needs the market suffix (7709.HK). Keep the cache filename as
    the IBKR symbol; only the outbound Yahoo request uses candidates.
    """
    candidates = [sym]
    if sym and "." not in sym and sym.isdigit():
        candidates.extend(["%s.HK" % sym, "%s.T" % sym])
    return unique(candidates)


def range_candidates(interval, range_):
    """Fallback shorter intraday ranges for newly listed tickers."""
    candidates = [range_]
    if interval == "5m":
        candidates.extend(["30d", "5d"])
    return unique(candidates)


def fetch_with_fallbacks(sym, interval, range_):
    errors = []
    for yahoo_sym in yahoo_ticker_candidates(sym):
        for candidate_range in range_candidates(interval, range_):
            candles, err = fetch_one(yahoo_sym, interval, candidate_range)
            if candles and not err:
                return candles, None, yahoo_sym, candidate_range
            errors.append("%s/%s: %s" % (yahoo_sym, candidate_range, err or "空"))
    return None, "; ".join(errors), None, None


def collect_symbols(data_dir):
    """从 metrics.json 抽出所有需要拉的标的（持仓 + 全部成交，去重）。
       期权按 underlyingSymbol 归一；cash 跳过。"""
    metrics_path = os.path.join(data_dir, "metrics.json")
    if not os.path.exists(metrics_path):
        print("找不到 %s — 先跑 analytics.py" % metrics_path, file=sys.stderr)
        return []
    with open(metrics_path, encoding="utf-8") as f:
        m = json.load(f)

    def underlying(sym):
        if not sym:
            return ""
        # OCC option symbol 形如 "ASTS  260618C00090000" -> "ASTS"
        if " " in sym:
            return sym.split()[0]
        return sym

    seen = set()
    for p in (m.get("positions") or []):
        if (p.get("assetCategory") or "") in ("CASH", ""):
            continue
        s = underlying(p.get("symbol"))
        if s:
            seen.add(s)
    for t in (m.get("recentTrades") or []):
        if (t.get("assetCategory") or "") in ("CASH", ""):
            continue
        s = underlying(t.get("symbol"))
        if s:
            seen.add(s)
    return sorted(seen)


def write_index(out_dir, passes):
    """写 _index.json 列出每个 ticker 已缓存的 interval（前端探活用）。"""
    by_ticker = {}
    for p in glob.glob(os.path.join(out_dir, "*.json")):
        name = os.path.basename(p)
        if name == "_index.json":
            continue
        stem = name[:-5]  # 去掉 .json
        # 解析 <TICKER>[.<intvl>]
        if "." in stem:
            # 注意 "285A.T" 这种本身就有点的 ticker：约定后缀是 ".<interval>"
            # 而 interval 总是字母+数字（如 "5m", "1h"），ticker 后缀通常是地区代码字母（如 "T", "HK"）
            base, last = stem.rsplit(".", 1)
            if any(c.isdigit() for c in last):  # 含数字 → 当作 interval 后缀
                ticker, intvl = base, last
            else:
                ticker, intvl = stem, ""        # ticker 自带点，无 interval 后缀
        else:
            ticker, intvl = stem, ""
        by_ticker.setdefault(ticker, set()).add(intvl)
    intervals_default = [p["interval"] if p["suffix"] else "default" for p in passes]
    idx = {
        "updatedAt": now_iso(),
        "intervals": intervals_default,
        "tickers": {k: sorted(v) for k, v in sorted(by_ticker.items())},
    }
    with open(os.path.join(out_dir, "_index.json"), "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, indent=2)


def main():
    ap = argparse.ArgumentParser(description="Fetch Yahoo 1h candles for traded symbols")
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("-c", "--config", default=os.path.join(here, "config.json"))
    ap.add_argument("--interval", default=None,
                    help="单次拉取指定 interval（如 1m / 5m / 1h / 1d）；不指定则跑默认多 pass")
    ap.add_argument("--range", default=None, dest="range_",
                    help="搭配 --interval 用：指定 range（如 7d / 60d / 2y / max）")
    ap.add_argument("--delay", type=float, default=0.7,
                    help="秒，请求之间的礼貌间隔，避免 Yahoo 限流")
    ap.add_argument("--cache-hours", type=float, default=4.0,
                    help="缓存文件比这个新就跳过（默认 4h）")
    ap.add_argument("--symbols", nargs="*",
                    help="只拉指定 ticker（用空格分隔）；默认自动从 metrics.json 收集")
    ap.add_argument("--force", action="store_true", help="忽略缓存全部重拉")
    args = ap.parse_args()

    # 解析 data_dir
    with open(args.config, encoding="utf-8") as f:
        cfg = json.load(f)
    data_dir = os.path.expanduser(cfg.get("output_dir", "./data"))
    cfg_dir = os.path.dirname(os.path.abspath(args.config))
    if not os.path.isabs(data_dir):
        data_dir = os.path.join(cfg_dir, data_dir)

    out_dir = os.path.join(cfg_dir, PRICES_SUBDIR)
    os.makedirs(out_dir, exist_ok=True)

    symbols = args.symbols or collect_symbols(data_dir)
    if not symbols:
        print("没有可拉的标的")
        return 0

    # 决定要跑哪些 pass。显式指定 --interval → 单 pass；否则默认双 pass。
    if args.interval:
        passes = [{"interval": args.interval,
                   "range_": args.range_ or "2y",
                   "suffix": "" if args.interval == "1h" else "." + args.interval}]
    else:
        passes = DEFAULT_PASSES

    print("准备拉 %d 个 ticker × %d 个 interval → %s"
          % (len(symbols), len(passes), out_dir))

    ok, skipped, failed = 0, 0, 0
    for sym in symbols:
        for p in passes:
            interval, range_, suffix = p["interval"], p["range_"], p["suffix"]
            cache_path = os.path.join(out_dir, "%s%s.json" % (sym, suffix))
            tag = "%s [%s]" % (sym, interval)
            if (not args.force) and os.path.exists(cache_path):
                age_h = (time.time() - os.path.getmtime(cache_path)) / 3600
                if age_h < args.cache_hours:
                    print("  %s: 缓存 %.1fh，跳过" % (tag, age_h))
                    skipped += 1
                    continue
            candles, err, yahoo_sym, used_range = fetch_with_fallbacks(sym, interval, range_)
            if err or not candles:
                print("  %s: ✗ %s" % (tag, err or "空"), file=sys.stderr)
                failed += 1
                time.sleep(args.delay)
                continue
            payload = {
                "ticker": sym,
                "yahooTicker": yahoo_sym,
                "interval": interval,
                "range": used_range,
                "fetchedAt": now_iso(),
                "candles": candles,
            }
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)
            first = datetime.fromtimestamp(candles[0]["t"] / 1000, tz=timezone.utc).date()
            last = datetime.fromtimestamp(candles[-1]["t"] / 1000, tz=timezone.utc).date()
            source = ""
            if yahoo_sym != sym or used_range != range_:
                source = " via %s/%s" % (yahoo_sym, used_range)
            print("  %s: ✓ %d 根 (%s → %s)%s" % (tag, len(candles), first, last, source))
            ok += 1
            time.sleep(args.delay)

    write_index(out_dir, passes)
    print("\n完成。新增 %d / 跳过 %d / 失败 %d。" % (ok, skipped, failed))
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
