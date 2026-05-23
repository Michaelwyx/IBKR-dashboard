#!/usr/bin/env bash
# 清掉累积 CSV，强制下次 run_daily.sh 从头重建。
# 用法：
#   ./reset_cumulative.sh            # 提示确认后清理
#   ./reset_cumulative.sh -y         # 直接清理
#
# 适用场景：
#   - 早期版本的去重 bug 把多账户行覆盖成单账户（需要重拉修复）
#   - 你在 IBKR Client Portal 改了 Flex Query 的日期范围（如改成 Year to Date），
#     想把整段历史重灌一次
#
# 原始 XML 归档 (data/raw/*.xml) 不会被清掉，留作排查。

set -euo pipefail

cd "$(dirname "$0")"

DATA_DIR="./data"
if [[ -f config.json ]]; then
  DD=$(python3 -c "import json; print(json.load(open('config.json')).get('output_dir','./data'))" 2>/dev/null || echo "./data")
  DATA_DIR="$DD"
fi
# 展开 ~
DATA_DIR="${DATA_DIR/#\~/$HOME}"

if [[ ! -d "$DATA_DIR" ]]; then
  echo "数据目录不存在: $DATA_DIR（没有可清的东西）"
  exit 0
fi

FILES=(
  "$DATA_DIR/trades_cumulative.csv"
  "$DATA_DIR/equity_summary_in_base_cumulative.csv"
  "$DATA_DIR/change_in_nav_cumulative.csv"
)

echo "将删除（如果存在）："
for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    echo "  ✓ $f ($(wc -l < "$f") 行)"
  else
    echo "  - $f (不存在)"
  fi
done
echo
echo "不会动的："
echo "  data/raw/*.xml   (原始报表归档)"
echo "  data/sections/   (每节快照)"
echo "  data/json/       (最新合并 JSON)"
echo

if [[ "${1:-}" != "-y" ]]; then
  read -r -p "确认清理? [y/N] " ans
  case "$ans" in
    y|Y|yes) ;;
    *) echo "已取消。"; exit 0 ;;
  esac
fi

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] && rm -f "$f" && echo "✓ 删除 $f"
done

echo "完成。下一步："
echo "  1. 如果你想拉历史，先去 IBKR Client Portal 把 Flex Query 的 Date Period"
echo "     从 'Last Business Day' 改成 'Year to Date' 或 'Last 30 Days'（看 README 第六节）。"
echo "  2. 跑 ./run_daily.sh，累积 CSV 会按新数据重建。"
