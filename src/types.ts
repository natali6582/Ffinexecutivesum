export interface Holding {
  id: string;
  name: string;
  isin: string;
  ticker: string;
  weight: string; // e.g. "25%" or "15"
  sector?: string;
  assetClass?: string;
  region?: string;
  securityNumber?: string;
}

export interface FieldUpdate {
  identifier: string;         // מזהה השדה (אייזן או מספר נייר)
  identifier_type: number;    // סוג המזהה: 1 לאייזן, 2 למספר נייר/טיקר
  sources: string[];          // מערך קישורי מקורות (URLs)
  title: string;              // כותרת העדכון (טקסט פשוט)
  summary: string;            // תקציר העדכון (טקסט פשוט)
  category: string;           // תגית קטגוריזציה
  source_url?: string | null;
  retrieved_at?: string;
  relevance_reason?: string;
}

export interface AICardChip {
  label: string;
  type: "info" | "good" | "warn";
}

export interface AICardNewsItem {
  tag: string;
  title: string;
  body: string;
  sources: string[];
}

export interface AICard {
  lead: string;
  toc_chips: AICardChip[];
  news_items: AICardNewsItem[];
}

export interface PortfolioReport {
  portfolio_label: string;
  report_title: string;
  report_subtitle: string;
  executive_summary: string;
  quick_summary: string;
  field_updates_summary: string;
  key_findings: string;
  allocation_summary: string;
  top_holdings_analysis: string;
  action_principles: string;
  compliance_note: string;
}

export interface SearchedHoldingSummary {
  name: string;
  isin: string;
  query: string;
  sourcesCount: number;
}

export interface InputEcho {
  holdings_count: number;
  weight_sum: number;
  identifiers: string[];
  fingerprint: string;
  from_cache: boolean;
  generated_at: string;
}

export interface AnalysisResponse {
  report: PortfolioReport;
  topHoldingsSkipped: number;
  searchedHoldings: SearchedHoldingSummary[];
  field_updates: FieldUpdate[];
  ai_card: AICard;
  input_echo?: InputEcho;
  isFallbackActive?: boolean;
  fallbackReason?: string;
}
