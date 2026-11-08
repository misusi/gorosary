#!/usr/bin/env python3
"""Scrape the USCCB daily-readings pages, solving the Obolus proof-of-work."""
import hashlib
import html
import http.cookiejar
import json
import os
import re
import sys
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
JAR = http.cookiejar.CookieJar()
OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(JAR))
OPENER.addheaders = [
    ("User-Agent", UA),
    ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    ("Accept-Language", "en-US,en;q=0.9"),
]


def get(url):
    req = urllib.request.Request(url)
    try:
        with OPENER.open(req, timeout=60) as r:
            return r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.read().decode("utf-8", "replace")


def leading_zero_bits(digest):
    bits = 0
    for byte in digest:
        if byte == 0:
            bits += 8
            continue
        bits += 8 - byte.bit_length()
        break
    return bits


def solve(page):
    cfg = dict(re.findall(r"(\w+):\s*'?([\w:-]+)'?", page))
    nonce = cfg["nonce"]
    token = cfg["challengeToken"]
    stamp = cfg["challengeTimestamp"]
    difficulty = int(cfg.get("difficulty", "12"))
    for i in range(1 << 22):
        h = hashlib.sha256(f"{nonce}:mine:{i}".encode()).digest()
        if leading_zero_bits(h) >= difficulty:
            proof = f"{stamp}:{nonce}:{token}:120:{i}"
            return proof
    return None


def fetch_readings(date_str):
    """date_str like '011424' -> (url, page)."""
    url = f"https://bible.usccb.org/bible/readings/{date_str}.cfm"
    page = get(url)
    if "Obolus" in page or "Checking connection" in page:
        proof = solve(page)
        if proof is None:
            raise RuntimeError("proof of work failed")
        OPENER.addheaders.append(("Cookie", f"X_Obolus_Proof={proof}"))
        page = get(url)
    if "Checking connection" in page:
        raise RuntimeError("still challenged")
    return page


def parse(page):
    result = {}
    m = re.search(r"<h2[^>]*>(.*?)</h2>", page, re.S)
    if m:
        result["title"] = html.unescape(re.sub(r"<[^>]+>", " ", m.group(1))).strip()
    for block in re.split(r'<div class="content-header">', page)[1:]:
        nm = re.search(r'<h3 class="name">(.*?)</h3>', block, re.S)
        addr = re.search(r'<div class="address">(.*?)</div>', block, re.S)
        if not nm or not addr:
            continue
        name = html.unescape(re.sub(r"<[^>]+>", " ", nm.group(1))).strip()
        cites = [html.unescape(re.sub(r"<[^>]+>", " ", c)).strip()
                 for c in re.findall(r"<a[^>]*>(.*?)</a>", addr.group(1), re.S)]
        cites = [c for c in cites if c and not c.lower().startswith("or")]
        if cites:
            result.setdefault(name, []).append(cites)
    return result


def main():
    out = {}
    for d in sys.argv[1:]:
        mm, dd, yy = d.split("/")
        key = f"{mm}{dd}{yy}"
        try:
            r = parse(fetch_readings(key))
        except Exception as exc:  # noqa: BLE001
            print(f"### {d} :: ERROR {exc}", file=sys.stderr)
            continue
        out[d] = r
        print(f"### {d}  ::  {r.get('title', '??')}")
        for k, v in r.items():
            if k == "title":
                continue
            print(f"    {k}: {' | '.join(' + '.join(c) for c in v)}")
        print()
        sys.stdout.flush()
    with open(os.path.join(os.path.dirname(__file__), "tmp_readings.json"), "w",
              encoding="utf-8") as fh:
        json.dump(out, fh, indent=1)


if __name__ == "__main__":
    main()
