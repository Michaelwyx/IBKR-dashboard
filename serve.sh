#!/usr/bin/env bash
# 本地 dashboard 服务器（常驻后台）。
# 用法:
#   ./serve.sh start [port]    后台启动（默认端口 8765），并打开浏览器
#   ./serve.sh stop            停止
#   ./serve.sh restart [port]  重启
#   ./serve.sh status          查看状态
#   ./serve.sh fg [port]       前台跑（Ctrl+C 退出）
# 不带参数 = start。

set -euo pipefail

cd "$(dirname "$0")"

PORT="${2:-8765}"
SITE_DIR="$PWD/site"
PID_FILE="$PWD/.serve.pid"
LOG_FILE="$PWD/serve.log"

is_running() {
  [[ -f "$PID_FILE" ]] || return 1
  local pid
  pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

cmd_start() {
  if is_running; then
    echo "已在运行 (pid=$(cat "$PID_FILE"))。访问: http://localhost:${PORT}/"
    exit 0
  fi
  if [[ ! -f "$SITE_DIR/index.html" ]]; then
    echo "找不到 $SITE_DIR/index.html —— 先确认仓库完整。" >&2
    exit 1
  fi
  # 后台启动自带 no-cache 头的小服务器（绑定 127.0.0.1，外网访问不到）
  nohup python3 "$PWD/serve.py" --port "$PORT" --bind 127.0.0.1 --directory "$SITE_DIR" \
      > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  sleep 0.4
  if is_running; then
    echo "✓ dashboard 服务器已启动 (pid=$(cat "$PID_FILE"))"
    echo "  访问: http://localhost:${PORT}/"
    echo "  日志: $LOG_FILE"
    # macOS 下尝试打开浏览器
    if command -v open >/dev/null 2>&1; then
      open "http://localhost:${PORT}/" >/dev/null 2>&1 || true
    fi
  else
    echo "启动失败，请看 $LOG_FILE" >&2
    rm -f "$PID_FILE"
    exit 1
  fi
}

cmd_stop() {
  if ! is_running; then
    echo "未在运行。"
    rm -f "$PID_FILE"
    return 0
  fi
  local pid; pid=$(cat "$PID_FILE")
  kill "$pid" 2>/dev/null || true
  sleep 0.2
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  echo "✓ 已停止 (pid=$pid)"
}

cmd_status() {
  if is_running; then
    echo "运行中 (pid=$(cat "$PID_FILE"))，端口 ${PORT}"
    echo "URL:   http://localhost:${PORT}/"
    echo "日志:  $LOG_FILE"
  else
    echo "未在运行。"
  fi
}

cmd_fg() {
  exec python3 "$PWD/serve.py" --port "$PORT" --bind 127.0.0.1 --directory "$SITE_DIR"
}

case "${1:-start}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status)  cmd_status ;;
  fg)      cmd_fg ;;
  *)       echo "用法: $0 {start|stop|restart|status|fg} [port]"; exit 2 ;;
esac
