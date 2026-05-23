#!/usr/bin/env python3
"""
构建本地静态 dashboard。

读取：
  <data_dir>/metrics.json  ← analytics.py 产物

输出：
  site/data/dashboard.json  ← 给前端 fetch 的合并 JSON（不会泄露原始 CSV）
  site/data/built_at.txt    ← 构建时间戳，前端用来显示 "数据更新于..."

site/index.html + site/assets/* 是事先写好的，不会被覆盖。

用法：
  python3 build_site.py                  # 用同目录 config.json 找数据
  python3 build_site.py -c config.json
  python3 build_site.py --data-dir ./data --site-dir ./site
"""

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timezone


def load_metrics(data_dir):
    path = os.path.join(data_dir, "metrics.json")
    if not os.path.exists(path):
        return None, path
    with open(path, encoding="utf-8") as f:
        return json.load(f), path


def build(data_dir, site_dir):
    data_dir = os.path.abspath(os.path.expanduser(data_dir))
    site_dir = os.path.abspath(os.path.expanduser(site_dir))
    out_dir = os.path.join(site_dir, "data")
    os.makedirs(out_dir, exist_ok=True)

    metrics, mpath = load_metrics(data_dir)
    if metrics is None:
        print("⚠  没找到 %s —— 写一个占位 dashboard.json，先把网站立起来。" % mpath, file=sys.stderr)
        metrics = {
            "generatedAt": None,
            "overall": {},
            "bySymbol": [],
            "daily": [],
            "positions": [],
            "recentTrades": [],
            "notes": ["还没有数据。请先运行 ibkr_flex_pull.py 拉取，再运行 analytics.py 生成 metrics.json。"],
        }

    dashboard = {
        "builtAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "metrics": metrics,
    }

    out_path = os.path.join(out_dir, "dashboard.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(dashboard, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "built_at.txt"), "w", encoding="utf-8") as f:
        f.write(dashboard["builtAt"])

    print("✓ dashboard.json 写出: %s" % out_path)
    print("  metrics 来源: %s" % mpath)
    if metrics.get("latestPulledAt"):
        print("  最近拉取时间: %s" % metrics["latestPulledAt"])
    n_daily = len(metrics.get("daily", []))
    n_pos = len(metrics.get("positions", []))
    n_trades = len((metrics.get("overall") or {}).get("tradeCount", 0) and metrics.get("recentTrades", []) or [])
    print("  daily NAV 点数: %d，持仓: %d，最近成交: %d" % (n_daily, n_pos, n_trades))


def main():
    ap = argparse.ArgumentParser(description="构建本地 IBKR dashboard")
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("-c", "--config", default=os.path.join(here, "config.json"),
                    help="config.json 路径（用来读 output_dir）")
    ap.add_argument("--data-dir", help="数据目录；不指定则从 config.json 读")
    ap.add_argument("--site-dir", default=os.path.join(here, "site"),
                    help="站点目录（默认 ./site）")
    args = ap.parse_args()

    data_dir = args.data_dir
    if not data_dir:
        if not os.path.exists(args.config):
            ap.error("config.json 不存在，请用 --data-dir 指定数据目录。")
        with open(args.config, encoding="utf-8") as f:
            data_dir = json.load(f).get("output_dir")
        if not data_dir:
            ap.error("config.json 缺少 output_dir，请用 --data-dir 指定。")
        # 相对路径以 config 所在目录为基准
        if not os.path.isabs(os.path.expanduser(data_dir)):
            data_dir = os.path.join(os.path.dirname(os.path.abspath(args.config)), data_dir)

    build(data_dir, args.site_dir)


if __name__ == "__main__":
    main()
