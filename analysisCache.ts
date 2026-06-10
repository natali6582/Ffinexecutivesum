/**
 * analysisCache.ts
 * ================
 * Content-addressed cache for /api/analyze — the cache key is a SHA-256
 * fingerprint of the *actual holdings in the request*, so a cached report can
 * only ever be served back to the exact same portfolio. This makes the
 * "phantom report" bug class (portfolio 1 receiving portfolio 4's report)
 * structurally impossible: different input => different key => cache miss.
 *
 * Design decisions (read before changing):
 *  - Key = canonical JSON of holdings (stable field order, holdings sorted by
 *    identifier). Whitespace, field order, and array order don't affect the key.
 *  - TTL is SHORT by default (30 min): field_updates contain live market news,
 *    so a stale hit is a correctness issue, not just a freshness issue.
 *  - Fallback results (isFallbackActive) are NEVER cached — they contain
 *    simulated content and must not outlive the outage that produced them.
 *  - Every response (hit or miss) carries an `input_echo` block so QA can
 *    verify, automatically, that the report matches the submitted portfolio.
 */

import { createHash } from "crypto";

// ---------------------------------------------------------------------------
// Fingerprint
// ---------------------------------------------------------------------------

export interface HoldingLike {
  name?: string;
  isin?: string | null;
  ticker?: string | null;
  weight?: string | number | null;
  [k: string]: unknown;
}

/** Stable identifier for sorting: ISIN, else security number/ticker, else name. */
function holdingIdentity(h: HoldingLike): string {
  return String(h.isin ?? h.ticker ?? h.name ?? "").trim().toUpperCase();
}

/** Canonical serialization: fixed field order, holdings sorted, values trimmed. */
export function canonicalizeHoldings(holdings: HoldingLike[]): string {
  const canon = holdings
    .map((h) => ({
      name: String(h.name ?? "").trim(),
      isin: h.isin == null ? null : String(h.isin).trim().toUpperCase(),
      ticker: h.ticker == null ? null : String(h.ticker).trim().toUpperCase(),
      weight: String(h.weight ?? "").replace("%", "").trim(),
    }))
    .sort((a, b) => holdingIdentity(a).localeCompare(holdingIdentity(b)));
  return JSON.stringify(canon);
}

export function portfolioFingerprint(holdings: HoldingLike[]): string {
  return createHash("sha256").update(canonicalizeHoldings(holdings)).digest("hex");
}

// ---------------------------------------------------------------------------
// Input echo — attach to EVERY response, cached or fresh
// ---------------------------------------------------------------------------

export interface InputEcho {
  holdings_count: number;
  weight_sum: number;            // raw sum of input weights — NOT normalized
  identifiers: string[];         // ISINs / fallback identities, sorted
  fingerprint: string;           // first 16 hex chars are enough for eyeballing
  from_cache: boolean;
  generated_at: string;          // ISO timestamp of original analysis
}

export function buildInputEcho(
  holdings: HoldingLike[],
  fingerprint: string,
  fromCache: boolean,
  generatedAt: string,
): InputEcho {
  const weightSum = holdings.reduce((acc, h) => {
    const w = parseFloat(String(h.weight ?? "").replace("%", "").trim());
    return acc + (Number.isFinite(w) ? w : 0);
  }, 0);
  return {
    holdings_count: holdings.length,
    weight_sum: Math.round(weightSum * 100) / 100,
    identifiers: holdings.map(holdingIdentity).filter(Boolean).sort(),
    fingerprint: fingerprint.slice(0, 16),
    from_cache: fromCache,
    generated_at: generatedAt,
  };
}

// ---------------------------------------------------------------------------
// Cache (in-memory, TTL + LRU cap). Swap for Redis later without changing callers.
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  payload: T;
  createdAt: number; // epoch ms
}

export class AnalysisCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(
    private ttlMs: number = 30 * 60 * 1000, // 30 min — news goes stale fast
    private maxEntries: number = 200,
  ) {}

  get(key: string): { payload: T; createdAt: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    // LRU touch: re-insert to move to the end of Map iteration order
    this.store.delete(key);
    this.store.set(key, entry);
    return entry;
  }

  set(key: string, payload: T): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest (first key in insertion order)
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { payload, createdAt: Date.now() });
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
