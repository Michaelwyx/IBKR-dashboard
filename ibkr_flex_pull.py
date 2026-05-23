#!/usr/bin/env python3
"""
IBKR Flex Web Service puller (standard library only).

无需 TWS / IB Gateway 在线：通过 IBKR 的 Flex Web Service 用 token 拉取
Activity Flex 报表，归档原始 XML，并把每个 section 解析成结构化数据
(每节 CSV + 合并 JSON)。trades 与每日 P&L 序列会跨多次运行去重累积，
方便你做日更/周更分析或喂给自己的网站。

流程：
  SendRequest (token + queryId)  ->  ReferenceCode
  GetStatement (token + ReferenceCode)  ->  报表 XML  (1019 = 生成中，自动重试)

用法：
  python3 ibkr_flex_pull.py                 # 用同目录下 config.json
  python3 ibkr_flex_pull.py -c /path/config.json
  python3 ibkr_flex_pull.py --query activity # 只跑某个命名 query

退出码：0 全部成功；非 0 表示有 query 失败（方便 cron 判断）。
"""

import argparse
import csv
import json
import os
import sys
import time
import logging
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import xml.etree.ElementTree as ET

SEND_REQUEST_URL = "https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/SendRequest"
GET_STATEMENT_URL = "https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/GetStatement"
FLEX_VERSION = "3"

# IBKR 要求程序化访问设置 User-Agent，否则可能被拒。
DEFAULT_USER_AGENT = "ibkr-flex-puller/1.0 (+python-stdlib)"

# 这些 section 跨运行做累积去重；其余 section 每次只存当次快照。
# key   = section 标签（FlexStatement 下的子元素 tag）
# keys  = 去重的「键 spec」列表，每个 spec 是一组字段（复合键）。按顺序尝试，
#         第一个所有字段都非空的 spec 作为唯一键。都不命中时用整行内容。
#         多账户场景下日期一定要配 accountId，否则两个账户同一天会互相覆盖。
# file  = 累积文件名（与 analytics.py 读取的文件名一致）
CUMULATIVE_SECTIONS = {
    "Trades": {"keys": [["tradeID"], ["transactionID"], ["ibExecID"], ["execID"]],
               "file": "trades_cumulative.csv"},
    "EquitySummaryInBase": {"keys": [["accountId", "reportDate"], ["reportDate"]],  # 每日 NAV 序列（派生每日盈亏）
                            "file": "equity_summary_in_base_cumulative.csv"},
    "ChangeInNAV": {"keys": [["accountId", "toDate"], ["toDate"]],                  # 整段 P&L（period=Last Business Day 即单日）
                    "file": "change_in_nav_cumulative.csv"},
}

log = logging.getLogger("ibkr_flex")


# --------------------------------------------------------------------------- #
# HTTP
# --------------------------------------------------------------------------- #
def _http_get(url, params, user_agent, timeout=60):
    """GET 请求，返回 (status_code, body_text)。带必需的 User-Agent。"""
    query = "&".join("%s=%s" % (k, v) for k, v in params.items())
    full = "%s?%s" % (url, query)
    req = Request(full, headers={"User-Agent": user_agent})
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.getcode(), resp.read().decode("utf-8", errors="replace")
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        return e.code, body
    except URLError as e:
        raise RuntimeError("网络错误，无法连接 IBKR Flex 服务: %s" % e.reason)


def _parse_flex_response(xml_text):
    """解析 SendRequest / GetStatement 返回的 FlexStatementResponse 控制信息。
    返回 (status, dict)。非控制响应（即真正的报表）返回 status=None。"""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        raise RuntimeError("无法解析 Flex 响应 XML: %s\n前 500 字:\n%s" % (e, xml_text[:500]))

    if root.tag == "FlexStatementResponse":
        info = {child.tag: (child.text or "").strip() for child in root}
        return info.get("Status", ""), info
    # 真正的报表（FlexQueryResponse）—— 不是控制响应
    return None, {"root_tag": root.tag}


# --------------------------------------------------------------------------- #
# Flex 两步请求
# --------------------------------------------------------------------------- #
def request_reference_code(token, query_id, user_agent):
    code, body = _http_get(SEND_REQUEST_URL,
                           {"t": token, "q": query_id, "v": FLEX_VERSION},
                           user_agent)
    status, info = _parse_flex_response(body)
    if status != "Success":
        raise RuntimeError(
            "SendRequest 失败: Status=%s ErrorCode=%s ErrorMessage=%s"
            % (status, info.get("ErrorCode"), info.get("ErrorMessage")))
    ref = info.get("ReferenceCode")
    url = info.get("Url") or GET_STATEMENT_URL  # 优先用响应里给的 Url
    if not ref:
        raise RuntimeError("SendRequest 成功但未返回 ReferenceCode: %s" % info)
    log.info("已获取 ReferenceCode=%s", ref)
    return ref, url


def fetch_statement(token, reference_code, get_url, user_agent,
                    poll_interval, poll_max_attempts):
    """轮询 GetStatement，直到拿到报表或确定失败。返回报表 XML 文本。"""
    for attempt in range(1, poll_max_attempts + 1):
        code, body = _http_get(get_url,
                               {"t": token, "q": reference_code, "v": FLEX_VERSION},
                               user_agent)
        status, info = _parse_flex_response(body)
        if status is None:
            log.info("报表已就绪（第 %d 次尝试）", attempt)
            return body
        # status 不为 None => 仍是控制响应（一般是 1019 生成中）
        err_code = info.get("ErrorCode", "")
        err_msg = info.get("ErrorMessage", "")
        if err_code == "1019" or "generation in progress" in err_msg.lower():
            log.info("报表生成中（%s/%s），%ss 后重试…", attempt, poll_max_attempts, poll_interval)
            time.sleep(poll_interval)
            continue
        raise RuntimeError("GetStatement 失败: ErrorCode=%s ErrorMessage=%s" % (err_code, err_msg))
    raise RuntimeError("报表在 %d 次尝试后仍未就绪，放弃。" % poll_max_attempts)


# --------------------------------------------------------------------------- #
# 解析报表 XML -> 结构化 sections
# --------------------------------------------------------------------------- #
def parse_statement(xml_text):
    """把 FlexQueryResponse 解析成：
       { "meta": {...}, "sections": { sectionTag: [ {row attrib}, ... ] } }
    通用做法：FlexStatement 下每个子元素是一个 section。
      - 若该 section 有子元素，则每个子元素的 attrib 作为一行；
      - 若没有子元素，则该 section 自身的 attrib 作为单行。
    这样无论你在 Flex Query 里勾选了哪些字段都能被捕获。"""
    root = ET.fromstring(xml_text)
    result = {"meta": {"queryName": root.get("queryName"), "type": root.get("type")},
              "statements": []}

    for stmt in root.iter("FlexStatement"):
        stmt_attrib = dict(stmt.attrib)
        # 同一个 token 覆盖多账户时，FlexStatement 的 accountId 区分账户。
        # Flex 的多数 section 行会自带 accountId，但有些不带——这里兜底注入，
        # 让下游的去重/聚合都能按账户区分。
        account_id = stmt_attrib.get("accountId")
        stmt_obj = {"attrib": stmt_attrib, "sections": {}}
        for section in list(stmt):
            tag = section.tag
            children = list(section)
            if children:
                rows = [dict(c.attrib) for c in children]
            else:
                rows = [dict(section.attrib)] if section.attrib else []
            if account_id:
                for r in rows:
                    r.setdefault("accountId", account_id)
            if rows:
                stmt_obj["sections"].setdefault(tag, []).extend(rows)
        result["statements"].append(stmt_obj)
    return result


# --------------------------------------------------------------------------- #
# 输出
# --------------------------------------------------------------------------- #
def _ordered_fieldnames(rows):
    """保持首次出现顺序的列名并集。"""
    seen = []
    seen_set = set()
    for r in rows:
        for k in r.keys():
            if k not in seen_set:
                seen.append(k)
                seen_set.add(k)
    return seen


def write_csv(path, rows):
    if not rows:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fieldnames = _ordered_fieldnames(rows)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)


def _row_key(row, key_specs):
    """key_specs 是 [[字段1, 字段2], [字段A], ...] 形式的复合键候选列表。
    取第一个「全部字段都有值」的 spec 拼成 tuple 作为唯一键；
    都不命中时退回到整行内容（极端兜底）。"""
    for spec in (key_specs or []):
        if isinstance(spec, str):       # 兼容旧的单字段字符串写法
            spec = [spec]
        vals = [row.get(f, "") for f in spec]
        if all(vals):
            return ("k",) + tuple(vals)
    return ("h", tuple(sorted(row.items())))


def upsert_cumulative(path, new_rows, key_fields):
    """把 new_rows 合并进累积 CSV，按 key 去重（新值覆盖旧值），写回。"""
    existing = []
    if os.path.exists(path):
        with open(path, newline="", encoding="utf-8") as f:
            existing = list(csv.DictReader(f))

    merged = {}
    order = []
    for r in existing + new_rows:
        k = _row_key(r, key_fields or [])
        if k not in merged:
            order.append(k)
        merged[k] = r  # 后写入者覆盖（new_rows 在后，确保用最新数据）

    rows = [merged[k] for k in order]
    write_csv(path, rows)
    return len(rows), len(new_rows)


def save_outputs(parsed, output_dir, query_name, stamp):
    sections_dir = os.path.join(output_dir, "sections")
    raw_json_dir = os.path.join(output_dir, "json")
    os.makedirs(sections_dir, exist_ok=True)
    os.makedirs(raw_json_dir, exist_ok=True)

    # 合并所有 statement 的 sections（一般只有一个 statement）
    combined = {}
    account_ids = []
    for stmt in parsed["statements"]:
        acc = stmt["attrib"].get("accountId")
        if acc and acc not in account_ids:
            account_ids.append(acc)
        for tag, rows in stmt["sections"].items():
            combined.setdefault(tag, []).extend(rows)

    # 1) 合并 JSON（最新一次拉取的全量结构化数据，供网站消费）
    latest_json = {
        "pulledAt": stamp,
        "queryName": query_name,
        "accountIds": account_ids,
        "meta": parsed["meta"],
        "sections": combined,
    }
    latest_path = os.path.join(raw_json_dir, "%s_latest.json" % query_name)
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(latest_json, f, ensure_ascii=False, indent=2)
    log.info("写出 JSON: %s", latest_path)

    # 2) 每节快照 CSV（带时间戳）
    for tag, rows in combined.items():
        snap = os.path.join(sections_dir, "%s_%s_%s.csv" % (query_name, tag, stamp))
        write_csv(snap, rows)

    # 3) 累积去重文件（trades / 每日序列等）
    for tag, spec in CUMULATIVE_SECTIONS.items():
        if tag not in combined:
            continue
        cum_path = os.path.join(output_dir, spec["file"])
        total, added = upsert_cumulative(cum_path, combined[tag], spec["keys"])
        log.info("累积 %s -> %s（本次 %d 行，去重后共 %d 行）", tag, cum_path, added, total)

    return latest_path


# --------------------------------------------------------------------------- #
# 主流程
# --------------------------------------------------------------------------- #
def run_query(token, query_name, query_id, cfg):
    user_agent = cfg.get("user_agent", DEFAULT_USER_AGENT)
    output_dir = os.path.abspath(os.path.expanduser(cfg.get("output_dir", "./data")))
    raw_dir = os.path.join(output_dir, "raw")
    os.makedirs(raw_dir, exist_ok=True)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log.info("=== 拉取 query '%s' (id=%s) ===", query_name, query_id)

    ref, get_url = request_reference_code(token, query_id, user_agent)
    xml_text = fetch_statement(
        token, ref, get_url, user_agent,
        poll_interval=int(cfg.get("poll_interval_seconds", 5)),
        poll_max_attempts=int(cfg.get("poll_max_attempts", 12)),
    )

    # 归档原始 XML
    raw_path = os.path.join(raw_dir, "%s_%s.xml" % (query_name, stamp))
    with open(raw_path, "w", encoding="utf-8") as f:
        f.write(xml_text)
    log.info("归档原始 XML: %s", raw_path)

    parsed = parse_statement(xml_text)
    save_outputs(parsed, output_dir, query_name, stamp)
    log.info("query '%s' 完成。", query_name)


def load_config(path):
    if not os.path.exists(path):
        raise SystemExit("找不到配置文件: %s （可复制 config.example.json）" % path)
    with open(path, encoding="utf-8") as f:
        cfg = json.load(f)
    # 允许 token 来自环境变量，避免明文写进文件
    if cfg.get("token", "").startswith("env:"):
        var = cfg["token"][4:]
        cfg["token"] = os.environ.get(var, "")
    if not cfg.get("token"):
        raise SystemExit("配置缺少 token（或环境变量未设置）。")
    if not cfg.get("queries"):
        raise SystemExit("配置缺少 queries（命名 -> Flex Query ID 的映射）。")
    return cfg


def main(argv=None):
    parser = argparse.ArgumentParser(description="IBKR Flex Web Service 拉取器")
    here = os.path.dirname(os.path.abspath(__file__))
    parser.add_argument("-c", "--config", default=os.path.join(here, "config.json"),
                        help="配置文件路径（默认同目录 config.json）")
    parser.add_argument("--query", help="只运行某个命名 query")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    cfg = load_config(args.config)
    queries = cfg["queries"]
    if args.query:
        if args.query not in queries:
            raise SystemExit("配置里没有名为 '%s' 的 query。" % args.query)
        queries = {args.query: queries[args.query]}

    failures = 0
    for name, qid in queries.items():
        try:
            run_query(cfg["token"], name, str(qid), cfg)
        except Exception as e:  # noqa: BLE001 - 单个 query 失败不影响其他
            failures += 1
            log.error("query '%s' 失败: %s", name, e)

    if failures:
        log.error("完成，但有 %d 个 query 失败。", failures)
        return 1
    log.info("全部 query 成功。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
