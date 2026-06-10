#!/usr/bin/env python3
"""Tests for portfolio_input_parser — verifies input fidelity guarantees."""

from portfolio_input_parser import parse_holding, parse_portfolio, load_portfolio_text


def _sample_il_bond():
    return {
        "securityName": "ווסטדייל אגח ג",
        "securityType": 'אג"ח קונצרניות',
        "ISIN": None,
        "securityNumber": "1208511",
        "holdingPercent": 2.57,
        "allocationGroups": [
            {"groupName": "אלוקציה בסיסית", "rows": [{"code": "994703", "name": 'אג"ח קונצרניות', "percents": 100.0}]},
            {"groupName": "סקטורים", "rows": [{"code": "-1", "name": "אחר", "percents": 100.0}]},
            {"groupName": "גיאוגרפי", "rows": [{"code": "101", "name": "ישראל", "percents": 100.0}]},
            {"groupName": "מטבע", "rows": [{"code": "1", "name": "שקל", "percents": 100.0}]},
        ],
    }


def _sample_split_fund():
    return {
        "securityName": "אלטשולר שחם (!) אגח חברות ללא",
        "securityType": 'קרנות נאמנות אג"ח',
        "ISIN": "IL0051056971",
        "securityNumber": "5105697",
        "holdingPercent": 13.02,
        "allocationGroups": [
            {"groupName": "אלוקציה בסיסית", "rows": [
                {"code": "994703", "name": 'אג"ח קונצרניות', "percents": 50.0},
                {"code": "994701", "name": 'אג"ח ממשלתיות', "percents": 50.0},
            ]},
            {"groupName": "סקטורים", "rows": [{"code": "304", "name": "שונות", "percents": 100.0}]},
        ],
    }


def _sample_foreign_etf():
    return {
        "securityName": "XLK - Technology ETF",
        "securityType": "ETF מניות",
        "ISIN": "US81369Y8030",
        "securityNumber": "70487475",
        "holdingPercent": 1.79,
        "allocationGroups": [
            {"groupName": "אלוקציה בסיסית", "rows": [{"code": "994705", "name": "מניות", "percents": 100.0}]},
            {"groupName": "סקטורים", "rows": [{"code": "-1", "name": "אחר", "percents": 100.0}]},
            {"groupName": "גיאוגרפי", "rows": [{"code": "102", "name": 'ארה"ב', "percents": 100.0}]},
        ],
    }


def test_original_name_preserved_and_display_cleaned():
    h = parse_holding(_sample_split_fund())
    assert h["security_name_original"] == "אלטשולר שחם (!) אגח חברות ללא"
    assert "(!)" not in h["security_name_display"]
    assert h["normalization_applied"] is True


def test_ticker_never_taken_from_security_number():
    # The single most important fidelity rule: securityNumber is NOT a ticker.
    h = parse_holding(_sample_il_bond())
    assert h["ticker_input"] is None
    assert h["security_number_input"] == "1208511"


def test_null_isin_kept_not_fabricated():
    h = parse_holding(_sample_il_bond())
    assert h["isin_input"] is None
    assert h["isin_valid"] is False
    assert any("ISIN חסר" in n for n in h["data_quality_notes"])


def test_sector_read_from_allocation_groups_and_flagged_when_other():
    h = parse_holding(_sample_il_bond())
    assert h["sector_input"] == "אחר"
    assert h["geography_input"] == "ישראל"
    assert any("העשרה" in n for n in h["data_quality_notes"])
    # enriched fields stay empty — separation is explicit
    assert h["sector_enriched"] is None


def test_look_through_split_preserved_not_collapsed():
    h = parse_holding(_sample_split_fund())
    assert h["asset_class_input"] is None  # not collapsed to a single class
    names = {r["name"] for r in h["allocation_basic"]}
    assert names == {'אג"ח קונצרניות', 'אג"ח ממשלתיות'}
    assert any("look-through" in n for n in h["data_quality_notes"])


def test_broker_internal_id_flagged():
    h = parse_holding(_sample_foreign_etf())
    assert any("ברוקר" in n for n in h["data_quality_notes"])


def test_holding_percent_not_normalized():
    hs = parse_portfolio([_sample_il_bond(), _sample_split_fund()])
    assert hs[0]["holding_percent_input"] == 2.57
    assert hs[1]["holding_percent_input"] == 13.02  # left as-is, no scaling


def test_truncated_file_salvages_complete_objects():
    import json
    good = json.dumps([_sample_il_bond(), _sample_split_fund()], ensure_ascii=False)
    truncated_text = good[:-25]  # chop the tail mid-object
    holdings, was_truncated = load_portfolio_text(truncated_text)
    assert was_truncated is True
    assert len(holdings) >= 1  # at least the first complete object survives


if __name__ == "__main__":
    import sys, traceback
    passed = failed = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn(); passed += 1; print(f"PASS {name}")
            except Exception:
                failed += 1; print(f"FAIL {name}"); traceback.print_exc()
    print(f"\n{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)
