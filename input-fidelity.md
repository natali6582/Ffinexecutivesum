# Input Fidelity Rules: Israeli / Plan-T Portfolios (Hebrew)

This document mandates absolute fidelity to raw user/system investment input datasets during extraction and parsing into internal models. It forbids assumptions, premature normalizations, and lossy aggregations.

## Strict Guidance

1. **Never Silently Clean or Coerce Fields**
   - Every input variable must be preserved verbatim in a `*_input` field.
   - Any cleaned, parsed, aggregated, or look-through values must go in modern separate `*_enriched` fields, initialized to `null`/empty during parsing.

2. **Name Normalization (Display vs Original)**
   - The user's typed name should be preserved verbatim in `security_name_original`.
   - A cleaned display-friendly name matches `security_name_display` using conservative regex rules to remove short brackets (like `(!)` or `(0B)`), but must NOT reorder words or guess intent.

3. **No Dynamic Ticker Invention**
   - A `securityNumber` of 7-8 numeric digits (broker internal IDs) is NOT a public stock exchange ticker. Moving it into a `.ticker` field without an `_input` prefix is a fidelity violation.
   - Keep `ticker_input` explicitly `null` unless provided under ticker/symbol columns.

4. **Preserve Splits & Look-Through (Look-First)**
   - When an index fund or allocation asset specifies multiple splits in `allocationGroups` / "אלוקציה בסיסית" (such as 86% bond + 14% equity), do not collapse it into a single asset type string.
   - Preserving the look-through map in `allocation_basic` avoids miscategorization in analytical visual charts.

5. **Fault-Tolerant Truncation Handling**
   - Users or internal crawl queues may paste incomplete, truncated JSON blocks.
   - The parser must be resilient and salvage all complete structural elements up to the cutoff index, instead of throwing generic parse errors.
