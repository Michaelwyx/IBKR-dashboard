#!/usr/bin/env python3
"""极简 dashboard 静态服务器：和 `python3 -m http.server` 同理，但每个响应都带

    Cache-Control: no-store, must-revalidate

这样改完 site/ 下任何文件，浏览器普通刷新（F5）就能拿到新版，不用 Cmd+Shift+R。
绑定 127.0.0.1，只本机访问。serve.sh 会调用本文件。
"""
import argparse
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    ap = argparse.ArgumentParser(description="本地 dashboard 服务器（带 no-cache 头）")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--bind", default="127.0.0.1")
    ap.add_argument("--directory", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "site"))
    args = ap.parse_args()

    # Python 3.7+ SimpleHTTPRequestHandler 支持 directory 参数；通过 functools.partial 注入
    from functools import partial
    handler = partial(NoCacheHandler, directory=args.directory)
    addr = (args.bind, args.port)
    with http.server.ThreadingHTTPServer(addr, handler) as srv:
        print(f"Serving {args.directory} on http://{args.bind}:{args.port}/  (no-cache)")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\nbye")


if __name__ == "__main__":
    sys.exit(main() or 0)
