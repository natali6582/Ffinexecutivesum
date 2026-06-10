#!/usr/bin/env python3
"""
portfolio_input_parser.py
=========================
Faithful parser for the Plan-T portfolio input schema (the JSON shape seen in
תיק_5 / תיק_6). Converts each raw security object into a flat holding dict that
**preserves every source value** and keeps source data strictly separated from
any enriched/derived data.

Core principle (see .claude/rules/input-fidelity.md):
  - Every value from the input is stored under a `*_input` key, verbatim.
  - Every derived/enriched value is stored under a `*_enriched` key and is left
    EMPTY here — enrichment is a separate stage, never silent inside parsing.
  - Nothing is inferred, normalized, aggregated, or "cleaned" away. The only
    transformation is a conservative, reversible display-name cleanup, and the
    original name is always retained.

Design notes:
  - Pure functions, no network, fully unit-testable (matches portfolio_extractor.py style).
  - The full raw allocationGroups are retained under `allocation_groups_raw` so
    nothing is ever lost, even dimensions this parser doesn't promote to top level.
  - Truncated-file tolerant loader (`load_portfolio_text`) salvages complete
    holdings from partially-downloaded files.
"""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Tuple

# --- Identifiers -------------------------------------------------------------

ISIN_RE = re.compile(r"^[A-Z]{2}[A-Z0-9]{9}\d$")
# Broker internal IDs (Plan-T / Enricher finding): 70xxxxxx / 72xxxxxx / 90xxxxxx
BROKER_ID_RE = re.compile(r"^(70|72|90)\d{6}$")

# Conservative display-name cleanup: short bracketed system markers such as
# "(!)", "(0B)", "(00)", "(4B)", "(40)". Word order is NEVER reordered (too risky).
NAME_ARTIFACT_RE = re.compile(r"\s*\((?:!|[0-9]{1,2}|[0-9][A-Za-z]|[A-Za-z][0-9])\)\s*")

# Static Hebrew security-type map (source of truth; no inference). Output is
# stored as ENRICHED — security_type_input always keeps the verbatim source string.
SECURITY_TYPE_CODE = {
    'אג"ח ממשלתיות': "GOV_BOND",
    'אג"ח קונצרניות': "CORP_BOND",
    "מניות": "EQUITY",
    "ETF מניות": "ETF_EQUITY",
    "קרנות סל מניות": "ETF_EQUITY",
    'קרנות נאמנות מניות': "MUTUAL_FUND_EQUITY",
    'קרנות נאמנות אג"ח': "MUTUAL_FUND_BOND",
}

# allocationGroups group names we promote to top-level *_input fields.
G_BASIC = "אלוקציה בסיסית"
G_SECTOR = "סקטורים"
G_GEO = "גיאוגרפי"
G_CURRENCY = "מטבע"

EMPTY_SOURCE_SECTORS = {None, "", "אחר", "שונות"}


def _is_valid_isin(isin: Optional[str]) -> bool:
    if not isin:
        return False
    return bool(ISIN_RE.match(isin.strip().upper()))


def _group_rows(raw: Dict[str, Any], group_name: str) -> List[Dict[str, Any]]:
    for g in raw.get("allocationGroups", []) or []:
        if g.get("groupName") == group_name:
            return g.get("rows", []) or []
    return []


def _single_or_none(rows: List[Dict[str, Any]]) -> Optional[str]:
    """Return the single row name, or None when the dimension is split/empty."""
    if len(rows) == 1:
        return rows[0].get("name")
    return None


def _clean_display_name(name: str) -> str:
    """Conservative, reversible cleanup: strip bracketed system markers and
    collapse whitespace. Does NOT reorder words or change tokens."""
    cleaned = NAME_ARTIFACT_RE.sub(" ", name)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def parse_holding(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Map one raw Plan-T security object to a faithful holding dict."""
    notes: List[str] = []

    # --- name: original + conservative display, original always kept ---
    name_original = raw.get("securityName", "")
    name_display = _clean_display_name(name_original)
    normalization_applied = name_display != name_original
    if normalization_applied:
        notes.append("נוקו סימוני מערכת מהשם לתצוגה; השם המקורי נשמר")

    # --- ISIN (may be null) ---
    isin = raw.get("ISIN")
    isin_valid = _is_valid_isin(isin)
    if not isin:
        notes.append("ISIN חסר במקור")

    # --- security number; NEVER promoted to a ticker ---
    sec_num = raw.get("securityNumber")
    if sec_num and BROKER_ID_RE.match(str(sec_num)):
        notes.append("securityNumber בתבנית מזהה ברוקר פנימי — לא ניתן לפתרון חיצוני לפי ISIN")

    # --- asset class / look-through from "אלוקציה בסיסית" ---
    basic_rows = _group_rows(raw, G_BASIC)
    allocation_basic = [
        {"name": r.get("name"), "percents": r.get("percents")} for r in basic_rows
    ]
    asset_class_input = _single_or_none(basic_rows)
    if len(basic_rows) > 1:
        notes.append("פיצול נכסים (look-through) — ראה allocation_basic; אין סוג נכס יחיד")

    # --- sector / geography / currency from allocationGroups ---
    sector_rows = _group_rows(raw, G_SECTOR)
    sector_input = _single_or_none(sector_rows)
    if sector_input in EMPTY_SOURCE_SECTORS:
        notes.append("סקטור-מקור הוא 'אחר'/'שונות' — כל סקטור ספציפי בדוח הוא העשרה")

    geography_input = _single_or_none(_group_rows(raw, G_GEO))
    currency_input = _single_or_none(_group_rows(raw, G_CURRENCY))

    return {
        # ---- source (input) — verbatim ----
        "security_name_original": name_original,
        "security_name_display": name_display,
        "normalization_applied": normalization_applied,
        "security_type_input": raw.get("securityType"),
        "isin_input": isin,                 # may be None
        "isin_valid": isin_valid,
        "security_number_input": sec_num,
        "ticker_input": None,               # source has NO ticker field — never fabricate
        "holding_percent_input": raw.get("holdingPercent"),  # number, not normalized
        "asset_class_input": asset_class_input,
        "allocation_basic": allocation_basic,            # full look-through, preserved
        "sector_input": sector_input,
        "geography_input": geography_input,
        "currency_input": currency_input,
        "allocation_groups_raw": raw.get("allocationGroups", []),  # nothing lost
        # ---- enriched — left EMPTY; filled only by a separate, marked stage ----
        "security_type_code_enriched": None,
        "sector_enriched": None,
        "ticker_enriched": None,
        # ---- quality ----
        "data_quality_notes": notes,
    }


def parse_portfolio(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not isinstance(data, list):
        raise TypeError("portfolio data must be a list of security objects.")
    return [parse_holding(h) for h in data if isinstance(h, dict)]


def load_portfolio_text(text: str) -> Tuple[List[Dict[str, Any]], bool]:
    """Tolerant loader. Returns (holdings, was_truncated).

    Salvages every complete top-level object, so a partially downloaded file
    (no closing ']') still yields all the holdings that did arrive intact.
    """
    start = text.find("[")
    if start == -1:
        raise ValueError("No JSON array found in input text.")
    body = text[start + 1:]
    decoder = json.JSONDecoder()
    objs: List[Dict[str, Any]] = []
    idx, n = 0, len(body)
    truncated = False
    while idx < n:
        while idx < n and body[idx] in " \t\r\n,":
            idx += 1
        if idx >= n:
            break
        try:
            obj, end = decoder.raw_decode(body, idx)
            objs.append(obj)
            idx = end
        except json.JSONDecodeError:
            truncated = True   # ran into an incomplete trailing object
            break
    return parse_portfolio(objs), truncated


def input_summary(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Lightweight, faithful summary for the QA section — counts only, no derived
    percentages or normalization."""
    total = sum(float(h["holding_percent_input"] or 0) for h in holdings)
    return {
        "count": len(holdings),
        "holding_percent_sum_input": round(total, 2),  # may be < 100; do NOT normalize
        "missing_isin": [h["security_name_original"] for h in holdings if not h["isin_input"]],
        "broker_internal_ids": [
            (h["security_name_original"], h["security_number_input"])
            for h in holdings
            if h["security_number_input"] and BROKER_ID_RE.match(str(h["security_number_input"]))
        ],
        "source_sector_other": sum(
            1 for h in holdings if h["sector_input"] in EMPTY_SOURCE_SECTORS
        ),
        "look_through_splits": [
            h["security_name_original"] for h in holdings if len(h["allocation_basic"]) > 1
        ],
    }


if __name__ == "__main__":
    import sys
    text = open(sys.argv[1], encoding="utf-8").read()
    holdings, truncated = load_portfolio_text(text)
    print(json.dumps(input_summary(holdings), ensure_ascii=False, indent=2))
    if truncated:
        print("\n[warn] הקובץ נקטע — חולצו רק האחזקות השלמות.")
