export interface Holding {
  id: string;
  name: string;
  isin: string;
  ticker: string;
  weight: string; // e.g. "25%" or "15"
  sector?: string;
  assetClass?: string;
  region?: string;
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

export interface AnalysisResponse {
  report: PortfolioReport;
  topHoldingsSkipped: number;
  searchedHoldings: SearchedHoldingSummary[];
}
