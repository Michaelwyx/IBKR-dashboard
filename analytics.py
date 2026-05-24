#!/usr/bin/env python3
"""
可选的风险/绩效指标计算（标准库 only）。

读取 ibkr_flex_pull.py 累积出来的文件：
  - trades_cumulative.csv               逐笔成交（用于已实现盈亏/胜率/按标的分解）
  - equity_summary_in_base_cumulative.csv  每日 NAV 序列（用于权益曲线/回撤/夏普）
  - change_in_nav_cumulative.csv        若没有上面那个，退而用它派生每日盈亏

输出 metrics.json，供你网站直接消费。所有指标都附带口径说明，
没有的源数据会自动跳过并在 "notes" 里说明。

用法：
  python3 analytics.py --data-dir ~/ibkr-data
  python3 analytics.py -c config.json          # 从 config.json 读 output_dir
"""

import argparse
import csv
import glob
import json
import math
import os
import statistics
from datetime import datetime, timezone


def to_float(x):
    if x is None:
        return None
    s = str(x).strip().replace(",", "")
    if s == "" or s.lower() in ("nan", "null"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def read_csv(path):
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def first_field(row, candidates):
    for c in candidates:
        if c in row and str(row[c]).strip() != "":
            return row[c]
    return None


def note(code, zh, en):
    """结构化 note，前端按当前语言显示。"""
    return {"code": code, "zh": zh, "en": en}


# --------------------------------------------------------------------------- #
# 基于逐笔成交的指标（多币种用 fxRateToBase 折算到基础货币）
# --------------------------------------------------------------------------- #
def trade_metrics(trades):
    notes = []
    if not trades:
        return {}, [], [note("TRADES_MISSING",
            "未找到 trades_cumulative.csv，跳过成交类指标。",
            "trades_cumulative.csv not found — trade metrics skipped.")]

    realized_field = None
    for cand in ("fifoPnlRealized", "realizedPnl", "fifoPnl"):
        if any(cand in t for t in trades):
            realized_field = cand
            break

    total_realized_base = 0.0
    total_commission_base = 0.0
    closing_pnls_base = []     # 已实现盈亏（折算到基础货币），用于胜率/盈亏比/平均盈亏
    by_symbol = {}
    currencies_seen = set()
    missing_fx_count = 0

    for t in trades:
        sym = first_field(t, ["symbol", "underlyingSymbol", "description"]) or "UNKNOWN"
        asset = first_field(t, ["assetCategory", "assetClass"]) or ""
        ccy = first_field(t, ["currency"]) or ""
        currencies_seen.add(ccy)

        # fxRateToBase: 把本币换成基础货币（USD 是 1.0；JPY 是 ≈0.006383 等）。
        # 没有 fxRateToBase 字段时退回 1.0 并计数提示。
        fx = to_float(t.get("fxRateToBase"))
        if fx is None:
            fx = 1.0
            missing_fx_count += 1

        comm = to_float(first_field(t, ["ibCommission", "commission"])) or 0.0
        comm_base = comm * fx
        total_commission_base += comm_base

        rp = to_float(t.get(realized_field)) if realized_field else None
        rp_base = (rp * fx) if rp is not None else None
        if rp_base is not None:
            total_realized_base += rp_base
            if rp_base != 0.0:
                closing_pnls_base.append(rp_base)

        b = by_symbol.setdefault(sym, {
            "symbol": sym, "assetCategory": asset, "currency": ccy,
            "realizedPnl": 0.0,        # 本币口径（同一标的通常单一币种）
            "realizedPnlInBase": 0.0,  # 基础货币口径
            "commission": 0.0,
            "commissionInBase": 0.0,
            "tradeCount": 0,
        })
        b["tradeCount"] += 1
        b["commission"] += comm
        b["commissionInBase"] += comm_base
        if rp is not None:
            b["realizedPnl"] += rp
        if rp_base is not None:
            b["realizedPnlInBase"] += rp_base
        if not b.get("currency") and ccy:
            b["currency"] = ccy

    if realized_field is None:
        notes.append(note("TRADES_NO_REALIZED_FIELD",
            "trades 里没有 fifoPnlRealized 字段——请在 Flex Query 的 Trades 里勾选 'Realized P/L'。",
            "Trades missing fifoPnlRealized — check 'Realized P/L' in your Flex Query → Trades section."))

    currencies_seen.discard("")
    if len(currencies_seen) > 1:
        notes.append(note("MULTI_CCY_NORMALIZED",
            "检测到多币种成交（%s）。已通过每笔成交的 fxRateToBase 把已实现盈亏和佣金折算到基础货币后求和；"
            "按标的的明细表里同时保留了本币口径。" % ", ".join(sorted(currencies_seen)),
            "Multi-currency trades detected (%s). Realized P&L and commissions are normalized to base "
            "currency via each trade's fxRateToBase before summing; the by-symbol table also keeps the "
            "native-currency values." % ", ".join(sorted(currencies_seen))))
    if missing_fx_count:
        notes.append(note("TRADES_MISSING_FX",
            "%d 笔成交缺 fxRateToBase 字段，按 1.0 处理；非基础货币交易的盈亏可能不准。"
            "请在 Flex Query → Trades 勾选 'FX Rate To Base'。" % missing_fx_count,
            "%d trades missing fxRateToBase, treated as 1.0; non-base-currency P&L may be inaccurate. "
            "Add 'FX Rate To Base' to your Flex Query → Trades fields." % missing_fx_count))

    wins = [p for p in closing_pnls_base if p > 0]
    losses = [p for p in closing_pnls_base if p < 0]
    win_rate = (len(wins) / len(closing_pnls_base)) if closing_pnls_base else None
    avg_win = (sum(wins) / len(wins)) if wins else None
    avg_loss = (sum(losses) / len(losses)) if losses else None
    gross_profit = sum(wins) if wins else 0.0
    gross_loss = abs(sum(losses)) if losses else 0.0
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else None

    overall = {
        "tradeCount": len(trades),
        "closingTradeCount": len(closing_pnls_base),
        "realizedPnl": round(total_realized_base, 2),                                # 已是基础货币
        "totalCommission": round(total_commission_base, 2),
        "netRealizedAfterCommission": round(total_realized_base + total_commission_base, 2),
        "winRate": round(win_rate, 4) if win_rate is not None else None,
        "avgWin": round(avg_win, 2) if avg_win is not None else None,                # 基础货币
        "avgLoss": round(avg_loss, 2) if avg_loss is not None else None,
        "profitFactor": round(profit_factor, 3) if profit_factor is not None else None,
        "currenciesTraded": sorted(currencies_seen),
    }

    by_symbol_list = sorted(
        ({**v,
          "realizedPnl": round(v["realizedPnl"], 2),
          "realizedPnlInBase": round(v["realizedPnlInBase"], 2),
          "commission": round(v["commission"], 2),
          "commissionInBase": round(v["commissionInBase"], 2)}
         for v in by_symbol.values()),
        key=lambda r: r["realizedPnlInBase"], reverse=True,        # 跨币种比较用基础口径
    )
    notes.append(note("TRADES_PNL_CONVENTION",
        "已实现盈亏 = 各笔 fifoPnlRealized 折算到基础货币后求和（IB 口径，未扣本笔佣金）；"
        "扣佣净额 = realizedPnl + 佣金（佣金为负）。胜率/盈亏比基于「有已实现盈亏的平仓成交」，"
        "非严格回合 (round-trip) 配对。",
        "Realized P&L = sum of each trade's fifoPnlRealized converted to base currency (IBKR's "
        "convention, before deducting that trade's own commission). Net after commission = "
        "realized + commission (commission is negative). Win rate / profit factor are based on "
        "closing trades that carry a realized P&L, not strict round-trip pairing."))
    return overall, by_symbol_list, notes


# --------------------------------------------------------------------------- #
# 基于每日 NAV 的指标（权益曲线 / 回撤 / 夏普）
# --------------------------------------------------------------------------- #
def equity_metrics(equity_rows, nav_rows):
    notes = []
    series = []       # [(date, accountId, total)] —— 保留 accountId 以便跨账户汇总

    if equity_rows:
        for r in equity_rows:
            d = first_field(r, ["reportDate", "date"])
            tot = to_float(first_field(r, ["total", "totalLong", "endingValue"]))
            acc = first_field(r, ["accountId"]) or "UNKNOWN"
            if d and tot is not None:
                series.append((d, acc, tot))
        source = "equity_summary_in_base_cumulative.csv (total NAV)"
    elif nav_rows:
        # ChangeInNAV：用每段 endingValue 作为权益点
        for r in nav_rows:
            d = first_field(r, ["toDate", "reportDate", "date"])
            tot = to_float(first_field(r, ["endingValue", "endingValueSecurities"]))
            acc = first_field(r, ["accountId"]) or "UNKNOWN"
            if d and tot is not None:
                series.append((d, acc, tot))
        source = "change_in_nav_cumulative.csv (endingValue)"
        notes.append(note("EQUITY_USING_NAV_FALLBACK",
            "未找到每日 Equity Summary，使用 ChangeInNAV 的 endingValue 作为权益点；"
            "建议在 Flex Query 里启用 'Cash Report / Equity Summary by Report Date' 获得更细的每日序列。",
            "Daily Equity Summary not found; falling back to ChangeInNAV.endingValue. "
            "Enable 'Cash Report / Equity Summary by Report Date' in your Flex Query for finer-grained series."))
    else:
        return {}, [], [], [note("NO_NAV_SERIES",
            "未找到每日 NAV 序列（Equity Summary 或 ChangeInNAV），跳过回撤/夏普。",
            "No daily NAV series found (Equity Summary or ChangeInNAV) — drawdown/Sharpe skipped.")]

    # 按 (date, account) 去重（避免同一天同账户出现两行时重复计入），
    # 再按日期把所有账户的 NAV **求和**——这是「两个账户加起来」的关键。
    by_date_acc = {}                       # (date, account) -> total（去重）
    for d, acc, tot in series:
        by_date_acc[(d, acc)] = tot

    sums = {}                              # date -> 当日所有账户 NAV 之和
    by_account = {}                        # accountId -> { date: total }
    for (d, acc), tot in by_date_acc.items():
        sums[d] = sums.get(d, 0.0) + tot
        by_account.setdefault(acc, {})[d] = tot

    dates = sorted(sums.keys())
    totals = [sums[d] for d in dates]

    if len(by_account) > 1:
        n_acc = len(by_account)
        notes.append(note("MULTI_ACCOUNT_AGGREGATED",
            "检测到 %d 个账户，NAV / 每日盈亏 / 回撤已按日期跨账户求和。" % n_acc,
            "Detected %d accounts; NAV / daily P&L / drawdown are summed across accounts by date." % n_acc))

    # 每账户日级序列（不参与汇总指标，仅用于网站展示和后续分账户分析）
    by_account_series = [
        {
            "accountId": acc,
            "series": [
                {"date": d, "total": round(rows[d], 2)}
                for d in sorted(rows.keys())
            ],
        }
        for acc, rows in sorted(by_account.items())
    ]

    if len(totals) < 2:
        return {}, [], by_account_series, [note("NAV_SERIES_TOO_SHORT",
            "每日 NAV 序列不足 2 个点，无法计算回撤/夏普（多跑几天后即可）。",
            "Daily NAV series has <2 points — drawdown/Sharpe not computed (need more days).")]

    # 每日盈亏与收益率
    daily = []
    returns = []
    for i in range(len(dates)):
        if i == 0:
            day_pnl = None
            ret = None
        else:
            day_pnl = totals[i] - totals[i - 1]
            ret = (totals[i] / totals[i - 1] - 1.0) if totals[i - 1] else None
            if ret is not None:
                returns.append(ret)
        daily.append({
            "date": dates[i],
            "total": round(totals[i], 2),
            "dayPnl": round(day_pnl, 2) if day_pnl is not None else None,
            "dayReturnPct": round(ret * 100, 4) if ret is not None else None,
        })

    # 最大回撤（基于权益曲线）
    peak = totals[0]
    max_dd = 0.0
    max_dd_pct = 0.0
    for v in totals:
        peak = max(peak, v)
        dd = v - peak
        if dd < max_dd:
            max_dd = dd
        if peak > 0:
            ddp = dd / peak
            if ddp < max_dd_pct:
                max_dd_pct = ddp

    # 年化夏普（rf=0），基于日收益
    sharpe = None
    if len(returns) >= 2:
        mean_r = statistics.fmean(returns)
        std_r = statistics.pstdev(returns)
        if std_r > 0:
            sharpe = (mean_r / std_r) * math.sqrt(252)

    overall = {
        "navStart": round(totals[0], 2),
        "navEnd": round(totals[-1], 2),
        "cumulativePnlFromEquity": round(totals[-1] - totals[0], 2),
        "maxDrawdown": round(max_dd, 2),
        "maxDrawdownPct": round(max_dd_pct * 100, 3),
        "sharpeAnnualized": round(sharpe, 3) if sharpe is not None else None,
        "tradingDays": len(dates),
        "navSource": source,
    }
    notes.append(note("METRICS_NAV_CAVEAT",
        "回撤/收益率/夏普基于 NAV 总值，包含出入金影响。若有大额转账，请改用 ChangeInNAV "
        "中分解出的交易盈亏，或在网站侧扣除 depositsWithdrawals。",
        "Drawdown / return / Sharpe are based on total NAV, which includes deposits & withdrawals. "
        "For large transfers, prefer the trading P&L decomposition from ChangeInNAV, or subtract "
        "depositsWithdrawals on the analysis side."))
    return overall, daily, by_account_series, notes


# --------------------------------------------------------------------------- #
# 持仓快照 + 最近成交（从 *_latest.json 读 OpenPositions / 从 trades CSV 取最近 N 笔）
# --------------------------------------------------------------------------- #
def load_latest_pull(data_dir):
    """读取最近一次拉取的合并 JSON（含 OpenPositions 等 sections）。"""
    candidates = sorted(glob.glob(os.path.join(data_dir, "json", "*_latest.json")))
    if not candidates:
        return None, None
    # 取 mtime 最新的那个
    latest = max(candidates, key=os.path.getmtime)
    try:
        with open(latest, encoding="utf-8") as f:
            return latest, json.load(f)
    except (OSError, json.JSONDecodeError):
        return latest, None


def load_sectors(config_dir):
    """读取 sectors.json，返回 {symbol: sector} 映射。文件缺失时返回空 dict。"""
    path = os.path.join(config_dir, "sectors.json")
    if not os.path.exists(path):
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return data.get("sectors", {}) or {}
    except (OSError, json.JSONDecodeError):
        return {}


def resolve_sector(row, sector_map):
    """先按完整 symbol 匹配；找不到再按 underlyingSymbol（覆盖期权场景）；
    最后兜底 '其他'。"""
    sym = row.get("symbol") or ""
    if sym in sector_map:
        return sector_map[sym]
    # 期权 OCC symbol 如 "ASTS  260618C00090000"，按前缀 underlying 匹配
    underlying = (row.get("symbol") or "").split()[0] if " " in (row.get("symbol") or "") else ""
    if underlying and underlying in sector_map:
        return sector_map[underlying]
    return "其他"


def sector_breakdown(positions):
    """汇总每个 sector 的市值 (base) + 持仓数。positions 已带 sector 字段。"""
    agg = {}
    for p in positions:
        s = p.get("sector") or "其他"
        v = p.get("positionValueInBase")
        if v is None:
            continue
        b = agg.setdefault(s, {"sector": s, "valueInBase": 0.0, "count": 0, "symbols": []})
        b["valueInBase"] += v
        b["count"] += 1
        if p.get("symbol"):
            b["symbols"].append(p["symbol"])
    rows = sorted(agg.values(), key=lambda r: -r["valueInBase"])
    for r in rows:
        r["valueInBase"] = round(r["valueInBase"], 2)
    return rows


def account_summary_by_date(equity_rows):
    """每个 reportDate 的账户总览，跨账户求和。
       结构：{YYYYMMDD: {totalNlv, totalCash, totalMarketValue, positionPctOfNav,
                          cashPctOfNav, asOf}}"""
    if not equity_rows:
        return {}
    by_date = {}     # date -> {acc: row}
    for r in equity_rows:
        acc = r.get("accountId", "")
        rd = r.get("reportDate", "")
        if not acc or not rd:
            continue
        by_date.setdefault(rd, {})[acc] = r

    out = {}
    for rd, by_acc in by_date.items():
        nlv = 0.0
        cash = 0.0
        for acc, r in by_acc.items():
            nlv += to_float(r.get("total")) or 0.0
            cash += to_float(r.get("cash")) or 0.0
        mv = nlv - cash
        out[rd] = {
            "totalNlv": round(nlv, 2),
            "totalCash": round(cash, 2),
            "totalMarketValue": round(mv, 2),
            "positionPctOfNav": round(mv / nlv * 100, 2) if nlv else None,
            "cashPctOfNav": round(cash / nlv * 100, 2) if nlv else None,
            "asOf": rd,
        }
    return out


def account_summary(equity_rows):
    """从 EquitySummaryInBase 最新一天的快照算账户总览。
    每行已经是 base currency；多账户取各账户的最新 reportDate 后跨账户求和。"""
    if not equity_rows:
        return None
    # 每个账户最新的 reportDate
    latest_by_acc = {}
    rows_by = {}
    for r in equity_rows:
        acc = r.get("accountId", "")
        rd = r.get("reportDate", "")
        if not acc or not rd:
            continue
        if rd > latest_by_acc.get(acc, ""):
            latest_by_acc[acc] = rd
        rows_by[(acc, rd)] = r

    total_nlv = 0.0
    total_cash = 0.0
    dates = []
    for acc, rd in latest_by_acc.items():
        r = rows_by[(acc, rd)]
        total_nlv += to_float(r.get("total")) or 0.0
        total_cash += to_float(r.get("cash")) or 0.0
        dates.append(rd)

    total_mv = total_nlv - total_cash
    pos_pct = (total_mv / total_nlv * 100) if total_nlv else None
    cash_pct = (total_cash / total_nlv * 100) if total_nlv else None
    return {
        "totalNlv": round(total_nlv, 2),
        "totalCash": round(total_cash, 2),
        "totalMarketValue": round(total_mv, 2),
        "positionPctOfNav": round(pos_pct, 2) if pos_pct is not None else None,
        "cashPctOfNav": round(cash_pct, 2) if cash_pct is not None else None,
        "asOf": max(dates) if dates else None,
    }


def open_positions(latest):
    """从最近一次拉取的 sections 里抽 OpenPositions。

    日期窗口 > 1 天时 Flex 会按 reportDate 给出**每天**的持仓快照，叠在一起就重复了。
    这里按 (accountId) 取该账户最新的 reportDate，得到「当前持仓」。
    多币种持仓（如日股 285A.T 单位是 JPY）通过 fxRateToBase 折算到基础货币用于汇总。"""
    if not latest or "sections" not in latest:
        return [], {}, [note("POSITIONS_NO_LATEST_JSON",
            "未找到最新拉取 JSON（json/*_latest.json），跳过持仓快照。",
            "Latest pull JSON (json/*_latest.json) not found — positions skipped.")]
    secs = latest["sections"]
    for tag in ("OpenPositions", "OpenPosition", "Positions", "Position"):
        if tag in secs and secs[tag]:
            raw = []
            for r in secs[tag]:
                fx = to_float(r.get("fxRateToBase"))
                if fx is None:
                    fx = 1.0
                pv = to_float(first_field(r, ["positionValue", "value", "marketValue"]))
                upnl = to_float(first_field(r, ["fifoPnlUnrealized", "unrealizedPnl", "fifoUnrealizedPnl"]))
                raw.append({
                    "accountId": first_field(r, ["accountId"]) or "",
                    "conid": first_field(r, ["conid"]) or "",
                    "symbol": first_field(r, ["symbol", "underlyingSymbol", "description"]) or "",
                    "assetCategory": first_field(r, ["assetCategory", "assetClass"]) or "",
                    "reportDate": first_field(r, ["reportDate"]) or "",
                    "position": to_float(first_field(r, ["position", "quantity"])),
                    "markPrice": to_float(first_field(r, ["markPrice", "closePrice", "price"])),
                    "costBasisPrice": to_float(first_field(r, ["costBasisPrice", "costPrice"])),
                    "positionValue": pv,
                    "positionValueInBase": (pv * fx) if pv is not None else None,
                    "unrealizedPnl": upnl,
                    "unrealizedPnlInBase": (upnl * fx) if upnl is not None else None,
                    "currency": first_field(r, ["currency"]) or "",
                    "fxRateToBase": fx,
                    "percentOfNAV": to_float(first_field(r, ["percentOfNAV"])),
                })

            # 找每个账户自己的最新 reportDate（不同账户最新日期可能不同），
            # 只保留该日期的持仓 —— 这才是「当前持仓」。
            max_date_per_acc = {}
            for r in raw:
                acc = r["accountId"]
                rd = r["reportDate"]
                if rd and rd > max_date_per_acc.get(acc, ""):
                    max_date_per_acc[acc] = rd

            # 为「当天 PnL」做准备：把所有 raw 按 (account, conid) 分组、按日期排序，
            # 这样可以为最新一天的每个持仓找到上一个交易日的同一持仓快照。
            by_key = {}
            for r in raw:
                k = (r["accountId"], r["conid"] or r["symbol"])
                by_key.setdefault(k, []).append(r)
            for k in by_key:
                by_key[k].sort(key=lambda x: x["reportDate"])
            prev_lookup = {}     # (account, conid_or_symbol, reportDate) -> 上一天那条
            for k, snaps in by_key.items():
                for i in range(1, len(snaps)):
                    prev_lookup[(k[0], k[1], snaps[i]["reportDate"])] = snaps[i - 1]

            rows = []
            for r in raw:
                if r["reportDate"] != max_date_per_acc.get(r["accountId"], ""):
                    continue
                # 用前一日快照算「当日单价变化」与「当日 PnL」（mark-to-market）
                key = (r["accountId"], r["conid"] or r["symbol"], r["reportDate"])
                prev = prev_lookup.get(key)
                day_change = None        # 单价绝对变化（本币）
                day_change_pct = None    # 单价百分比变化
                day_pnl_native = None
                day_pnl_base = None
                if (prev and prev["markPrice"] is not None
                        and r["markPrice"] is not None and r["position"] is not None):
                    day_change = r["markPrice"] - prev["markPrice"]
                    if prev["markPrice"]:
                        day_change_pct = (r["markPrice"] / prev["markPrice"] - 1) * 100
                    day_pnl_native = day_change * r["position"]
                    day_pnl_base = day_pnl_native * (r.get("fxRateToBase") or 1.0)
                r["dayChange"] = day_change
                r["dayChangePct"] = day_change_pct
                r["dayPnl"] = day_pnl_native
                r["dayPnlInBase"] = day_pnl_base
                rows.append(r)

            # 同一账户同一标的还可能因 multi-leg / put-call 出现多行——这是合理的，不做合并。
            rows.sort(key=lambda x: (x["positionValueInBase"] is None, -(x["positionValueInBase"] or 0)))

            # 同一份原始 raw 也按 reportDate 分组——这样 dashboard 可以在 Daily P&L tab
            # 点击某一天后秒级查到当日持仓快照（无需后端再算）。
            by_date = {}
            for r in raw:
                d = r.get("reportDate")
                if not d:
                    continue
                by_date.setdefault(d, []).append(r)
            for d in by_date:
                by_date[d].sort(key=lambda x: (x.get("positionValueInBase") is None,
                                               -(x.get("positionValueInBase") or 0)))

            n_notes = []
            if len(raw) > len(rows):
                n_notes.append(note("POSITIONS_DEDUPED",
                    "OpenPositions 原始有 %d 行（多日快照），按账户取最新 reportDate 后保留 %d 行作为当前持仓。"
                    % (len(raw), len(rows)),
                    "OpenPositions had %d raw rows (multi-day snapshots); kept %d rows (each account's "
                    "latest reportDate) as the current snapshot." % (len(raw), len(rows))))
            currencies = sorted({r["currency"] for r in rows if r["currency"]})
            if len(currencies) > 1:
                n_notes.append(note("POSITIONS_MULTI_CCY",
                    "持仓含多币种（%s）。positionValue / unrealizedPnl 显示本币原始值；"
                    "positionValueInBase / unrealizedPnlInBase 已通过 fxRateToBase 折算到基础货币。"
                    % ", ".join(currencies),
                    "Positions span multiple currencies (%s). positionValue / unrealizedPnl show "
                    "native values; *InBase fields are normalized via fxRateToBase."
                    % ", ".join(currencies)))
            return rows, by_date, n_notes
    return [], {}, [note("POSITIONS_MISSING_SECTION",
        "最近一次拉取里没有 OpenPositions section——请在 Flex Query 里勾选 'Open Positions'。",
        "Latest pull has no OpenPositions section — check 'Open Positions' in your Flex Query.")]


def recent_trades(trades, n=0):
    """按 trade 时间倒序导出（默认 n=0 = 不截断，前端再做时间窗口过滤）。
    trade 时间字段在 Flex 里可能叫 dateTime / tradeDate+tradeTime。"""
    if not trades:
        return []
    def trade_ts(t):
        # 优先 dateTime；否则拼 tradeDate + tradeTime
        s = first_field(t, ["dateTime", "tradeDateTime"])
        if s:
            return s
        d = first_field(t, ["tradeDate", "date"]) or ""
        tm = first_field(t, ["tradeTime", "time"]) or ""
        return ("%s%s" % (d, tm)).strip() or ""
    sorted_trades = sorted(trades, key=trade_ts, reverse=True)
    if n > 0:
        sorted_trades = sorted_trades[:n]
    out = []
    for t in sorted_trades:
        fx = to_float(t.get("fxRateToBase")) or 1.0
        rp = to_float(first_field(t, ["fifoPnlRealized", "realizedPnl", "fifoPnl"]))
        comm = to_float(first_field(t, ["ibCommission", "commission"]))
        out.append({
            "dateTime": first_field(t, ["dateTime", "tradeDateTime"]) or
                        (first_field(t, ["tradeDate"]) or "") + " " + (first_field(t, ["tradeTime"]) or ""),
            "symbol": first_field(t, ["symbol", "underlyingSymbol", "description"]) or "",
            "assetCategory": first_field(t, ["assetCategory", "assetClass"]) or "",
            "currency": first_field(t, ["currency"]) or "",
            "buySell": first_field(t, ["buySell", "side"]) or "",
            "quantity": to_float(first_field(t, ["quantity"])),
            "tradePrice": to_float(first_field(t, ["tradePrice", "price"])),
            "ibCommission": comm,
            "ibCommissionInBase": (comm * fx) if comm is not None else None,
            "realizedPnl": rp,
            "realizedPnlInBase": (rp * fx) if rp is not None else None,
            "netCash": to_float(first_field(t, ["netCash"])),
        })
    return out


def main():
    ap = argparse.ArgumentParser(description="IBKR Flex 数据的风险/绩效指标计算")
    ap.add_argument("--data-dir", help="数据目录（ibkr_flex_pull.py 的 output_dir）")
    ap.add_argument("-c", "--config", help="从 config.json 读取 output_dir")
    ap.add_argument("--recent-n", type=int, default=0,
                    help="按时间倒序导出多少笔成交进 metrics.json（默认 0 = 全部；前端再做时间窗口过滤）")
    args = ap.parse_args()

    data_dir = args.data_dir
    if not data_dir and args.config:
        with open(args.config, encoding="utf-8") as f:
            data_dir = json.load(f).get("output_dir")
    if not data_dir:
        ap.error("请用 --data-dir 或 -c config.json 指定数据目录。")
    data_dir = os.path.abspath(os.path.expanduser(data_dir))

    trades = read_csv(os.path.join(data_dir, "trades_cumulative.csv"))
    equity = read_csv(os.path.join(data_dir, "equity_summary_in_base_cumulative.csv"))
    nav = read_csv(os.path.join(data_dir, "change_in_nav_cumulative.csv"))
    latest_path, latest_json = load_latest_pull(data_dir)

    t_overall, by_symbol, t_notes = trade_metrics(trades)
    e_overall, daily, by_account, e_notes = equity_metrics(equity, nav)
    positions, positions_by_date, p_notes = open_positions(latest_json)
    rt = recent_trades(trades, n=args.recent_n)
    acct_summary = account_summary(equity)
    acct_summary_by_date = account_summary_by_date(equity)

    # Sector 标签：从仓库根目录的 sectors.json 读。给当前持仓和所有历史快照都贴一下。
    sector_map = load_sectors(os.path.dirname(os.path.abspath(args.config))
                              if args.config else os.path.dirname(os.path.abspath(__file__)))
    for p in positions:
        p["sector"] = resolve_sector(p, sector_map)
    for d in positions_by_date:
        for p in positions_by_date[d]:
            p["sector"] = resolve_sector(p, sector_map)
    sec_break = sector_breakdown(positions)

    metrics = {
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "dataDir": data_dir,
        "latestPullFile": latest_path,
        "latestPulledAt": (latest_json or {}).get("pulledAt"),
        "accountIds": (latest_json or {}).get("accountIds", []),
        "overall": {**t_overall, **e_overall},
        "accountSummary": acct_summary,
        "accountSummaryByDate": acct_summary_by_date,
        "sectorBreakdown": sec_break,
        "bySymbol": by_symbol,
        "daily": daily,
        "byAccount": by_account,
        "positions": positions,
        "positionsByDate": positions_by_date,
        "recentTrades": rt,
        "notes": t_notes + e_notes + p_notes,
    }

    out_path = os.path.join(data_dir, "metrics.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)
    print("写出指标: %s" % out_path)
    print(json.dumps(metrics["overall"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
