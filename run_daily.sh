#!/usr/bin/env bash
# 每日更新流水线: 拉取 IBKR -> 计算指标 -> 构建 dashboard。
# 网站常驻服务器自己长跑就行（./serve.sh start），这个脚本只刷新数据。
#
# 用法:
#   ./run_daily.sh                 # 用同目录 config.json
#   ./run_daily.sh -c /path/config.json
#   ./run_daily.sh --no-pull       # 跳过拉取（只重算 + 重建网站，调试用）

set -euo pipefail

cd "$(dirname "$0")"

CONFIG="$PWD/config.json"
NO_PULL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--config) CONFIG="$2"; shift 2 ;;
    --no-pull)   NO_PULL=1; shift ;;
    -h|--help)
      sed -n '2,11p' "$0"
      exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 2 ;;
  esac
done

if [[ ! -f "$CONFIG" ]]; then
  echo "找不到配置: $CONFIG" >&2
  exit 1
fi

LOG_DIR="$PWD/logs"
mkdir -p "$LOG_DIR"
STAMP=$(date -u +"%Y%m%dT%H%M%SZ")
LOG="$LOG_DIR/daily_${STAMP}.log"

# 同时打到屏幕和日志
exec > >(tee -a "$LOG") 2>&1

echo "==================================================="
echo "IBKR 每日更新  $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "config: $CONFIG"
echo "==================================================="

if [[ $NO_PULL -eq 1 ]]; then
  echo "[1/4] 跳过拉取 (--no-pull)"
else
  echo "[1/4] 从 IBKR Flex 拉取报表 ..."
  python3 ibkr_flex_pull.py -c "$CONFIG"
fi

echo
echo "[2/4] 计算指标 ..."
python3 analytics.py -c "$CONFIG"

echo
echo "[3/4] 拉 Yahoo 1h 行情（Symbol Detail 候选）..."
python3 fetch_prices.py -c "$CONFIG" || echo "  (注：部分 ticker Yahoo 不收录，可忽略)"

echo
echo "[4/4] 构建 dashboard ..."
python3 build_site.py -c "$CONFIG"

echo
echo "✓ 全部完成。"
if [[ -f "$PWD/.serve.pid" ]] && kill -0 "$(cat "$PWD/.serve.pid")" 2>/dev/null; then
  echo "  网站已在运行 -> http://localhost:8765/ （刷新页面即可看到新数据）"
else
  echo "  网站没在跑。运行 ./serve.sh start 启动它（端口 8765，自动打开浏览器）。"
fi
echo "  日志: $LOG"
