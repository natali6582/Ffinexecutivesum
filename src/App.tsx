import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  Code, 
  ChevronRight, 
  Sparkles, 
  Layers,
  Download,
  AlertTriangle
} from "lucide-react";
import { Holding, AnalysisResponse, FieldUpdate } from "./types";
import { PRESET_PORTFOLIOS } from "./presets";

// Client-side helper to validate ISIN (12 alphanumeric chars)
function isValidISIN(isin: string): boolean {
  if (!isin) return false;
  const cleaned = isin.trim().toUpperCase();
  return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(cleaned);
}

// Unified portfolio text extractor (pipe-delimited holding parser)
function parsePipeDelimitedHoldings(text: string): Holding[] {
  const lines = text.split('\n');
  const parsed: Holding[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Skip portfolio description context lines
    if (line.toLowerCase().startsWith('portfolio:') || line.startsWith('תיק:')) {
      continue;
    }

    const segments = line.split('|').map(s => s.trim());
    if (segments.length < 2) continue;

    let isin = "";
    let ticker = "";
    let weight = "";
    let assetClass = "מניות";
    let name = "";
    let sector = "כללי";
    let region = "גלובלי";

    const positionalSegments: string[] = [];

    for (const seg of segments) {
      const upperSeg = seg.toUpperCase();
      if (upperSeg.startsWith("ISIN:")) {
        isin = seg.substring(5).trim();
      } else if (upperSeg.startsWith("RIC:")) {
        ticker = seg.substring(4).trim();
      } else if (upperSeg.startsWith("SEC#")) {
        const secVal = seg.substring(4).trim();
        if (secVal.length === 12) isin = secVal;
        else ticker = secVal;
      } else if (seg.includes("%") || (/^\d+(\.\d+)?$/.test(seg.replace("%","").trim()) && segments.length > 4 && segments.indexOf(seg) === 4)) {
        weight = seg.endsWith("%") ? seg : seg + "%";
      } else if (seg.length === 12 && /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(upperSeg)) {
        isin = seg;
      } else {
        positionalSegments.push(seg);
      }
    }

    if (positionalSegments.length > 0) {
      name = positionalSegments[0];
    }
    if (positionalSegments.length > 1) {
      const rawClass = positionalSegments[1];
      if (rawClass.includes("מני") || rawClass.includes("Stock") || rawClass.includes("Equit")) assetClass = "מניות";
      else if (rawClass.includes("אג") || rawClass.includes("Bond") || rawClass.includes("Debt")) assetClass = "אג'ח";
      else if (rawClass.includes("קרנ") || rawClass.includes("Fund") || rawClass.includes("ETF")) assetClass = "קרנות";
      else if (rawClass.includes("מזו") || rawClass.includes("Cash") || rawClass.includes("Liqui")) assetClass = "מזומנים";
      else assetClass = rawClass;
    }
    if (positionalSegments.length > 2) {
      const third = positionalSegments[2];
      if (third.length === 12 && !isin) {
        isin = third;
      } else if (third.length <= 6 && !ticker) {
        ticker = third;
      }
    }
    if (positionalSegments.length > 4) {
      sector = positionalSegments[4];
    }
    if (positionalSegments.length > 5) {
      region = positionalSegments[5];
    }

    if (!name) name = "נכס מנותח";
    if (!weight) {
      const numSeg = segments.find(s => /^\d+(\.\d+)?$/.test(s.replace("%","").trim()));
      weight = numSeg ? (numSeg.includes("%") ? numSeg : numSeg + "%") : "10%";
    }
    if (!ticker && isin) {
      ticker = isin.substring(0, 4);
    }

    parsed.push({
      id: "h-ext-" + Date.now() + Math.random().toString(36).substr(2, 4),
      name,
      isin,
      ticker,
      weight,
      sector,
      assetClass,
      region
    });
  }

  return parsed;
}

// Unified robust parser supporting both pipe-delimited list and direct or truncated JSON structures
function parseBroadHoldings(text: string): Holding[] {
  const trimmed = text.trim();
  
  if (trimmed.includes("securityName") || trimmed.includes("holdingPercent")) {
    const list: Holding[] = [];
    
    // Balanced brace scanning JSON-salvage parser (extremely robust, truncation-tolerant)
    let charIndex = trimmed.indexOf("{");
    if (charIndex !== -1) {
      const len = trimmed.length;
      while (charIndex < len) {
        const start = trimmed.indexOf("{", charIndex);
        if (start === -1) break;
        
        let braceCount = 0;
        let inString = false;
        let escaped = false;
        let end = start;
        
        for (let i = start; i < len; i++) {
          const char = trimmed[i];
          if (escaped) {
            escaped = false;
            continue;
          }
          if (char === "\\") {
            escaped = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === "{") {
              braceCount++;
            } else if (char === "}") {
              braceCount--;
              if (braceCount === 0) {
                end = i;
                break;
              }
            }
          }
        }
        
        if (braceCount === 0 && end > start) {
          const objectStr = trimmed.substring(start, end + 1);
          try {
            const raw = JSON.parse(objectStr);
            if (raw && typeof raw === "object" && (raw.securityName !== undefined || raw.holdingPercent !== undefined)) {
              const nameOriginal = raw.securityName || "";
              
              // Clean up system bracket artifacts natively and conservatively
              const nameDisplay = nameOriginal.replace(/\s*\((?:!|[0-9]{1,2}|[0-9][A-Za-z]|[A-Za-z][0-9])\)\s*/g, " ")
                .replace(/\s+/g, " ")
                .trim() || "נכס מותאם";

              const rawGroups = raw.allocationGroups || [];
              const findGroupSingleName = (groupName: string): string => {
                const group = rawGroups.find((g: any) => g.groupName === groupName);
                const rows = group?.rows || [];
                return rows.length === 1 ? (rows[0].name || "") : "";
              };

              const basicClass = findGroupSingleName("אלוקציה בסיסית");
              let assetClass = "מניות";
              if (basicClass) {
                if (basicClass.includes("מני") || basicClass.includes("Stock") || basicClass.includes("Equit")) assetClass = "מניות";
                else if (basicClass.includes("אג") || basicClass.includes("Bond") || basicClass.includes("Debt")) assetClass = "אג'ח";
                else if (basicClass.includes("קרנ") || basicClass.includes("Fund") || basicClass.includes("ETF")) assetClass = "קרנות";
                else if (basicClass.includes("מזו") || basicClass.includes("Cash") || basicClass.includes("Liqui")) assetClass = "מזומנים";
                else assetClass = basicClass;
              } else {
                const rawType = raw.securityType || "";
                if (rawType.includes("מני") || rawType.includes("Stock") || rawType.includes("Equit")) assetClass = "מניות";
                else if (rawType.includes("אג") || rawType.includes("Bond") || rawType.includes("Debt")) assetClass = "אג'ח";
                else if (rawType.includes("קרנ") || rawType.includes("Fund") || rawType.includes("ETF")) assetClass = "קרנות";
                else if (rawType.includes("מזו") || rawType.includes("Cash") || rawType.includes("Liqui")) assetClass = "מזומנים";
              }

              const isin = raw.ISIN && raw.ISIN !== "null" ? raw.ISIN : "";
              let ticker = "";
              if (raw.ticker) {
                ticker = raw.ticker;
              } else if (isin) {
                ticker = isin.substring(0, 4);
              }

              let weight = "2.00%";
              if (raw.holdingPercent !== undefined && raw.holdingPercent !== null) {
                weight = parseFloat(raw.holdingPercent).toFixed(2) + "%";
              }

              const sector = findGroupSingleName("סקטורים") || "כללי";
              const region = findGroupSingleName("גיאוגרפי") || "גלובלי";

              list.push({
                id: "h-ext-json-" + Date.now() + "-" + list.length + "-" + Math.random().toString(36).substr(2, 4),
                name: nameDisplay,
                isin,
                ticker,
                weight,
                sector,
                assetClass,
                region
              });
            }
          } catch (e) {
            // Salvage skip
          }
          charIndex = end + 1;
        } else {
          // Truncation boundary
          break;
        }
      }
    }
    
    if (list.length > 0) {
      return list;
    }
  }

  return parsePipeDelimitedHoldings(text);
}

export default function App() {
  // State for raw list of assets
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    // Start with the first preset
    return JSON.parse(JSON.stringify(PRESET_PORTFOLIOS[0].holdings));
  });

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // App running states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Received analysis state
  const [reportData, setReportData] = useState<AnalysisResponse | null>(null);

  // Navigation tabs view routing
  const [activeTab, setActiveTab] = useState<"edit" | "report">("edit");

  // Portfolio extractor states
  const [showExtractor, setShowExtractor] = useState<boolean>(false);
  const [extractorText, setExtractorText] = useState<string>("");
  const [extractorSuccess, setExtractorSuccess] = useState<boolean>(false);
  
  // Secondary views
  const [rawView, setRawView] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Staggered loading messages to represent real web crawls
  const loadingSteps = [
    { title: "מנתח את משקלי האחזקות...", desc: "ממיין נכסים לפי משקל יחסי ומזהה מזהי ISIN בעלי תוקף." },
    { title: "מריץ שאילתות חיפוש ממוקדות ב-Google...", desc: "מחפש דוחות רבעוניים, הנחיות מנכ\"לים, גיוסי הון וסוגיות רגולציה מהחודש האחרון." },
    { title: "מרכז ממצאים מתוך Bloomberg, Reuters ו-Globes...", desc: "מסנן עדכונים רשמיים, מהימנים ומצמצם מקורות כפולים לרשימה נקייה." },
    { title: "מגבש סיכום מנהלים אינטגרטיבי בעברית...", desc: "בונה ניתוח נרטיבי של סיכוני התיק לפי כללי Compliance מחמירים וללא שינוי אחוזים." },
    { title: "מבצע תיקוף ובקרת איכות על נקודות הביקורת...", desc: "מוודא אי החלת המלצות החזקה/קנייה וניסוח בקרות ניטרליות בלבד." }
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load a preset portfolio
  const handleLoadPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setHoldings(JSON.parse(JSON.stringify(PRESET_PORTFOLIOS[index].holdings)));
    setReportData(null);
    setActiveTab("edit");
  };

  // Input editing handlers
  const handleUpdateHolding = (id: string, field: keyof Holding, value: string) => {
    setHoldings(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, [field]: value };
      }
      return h;
    }));
    setReportData(null);
  };

  const handleAddHolding = () => {
    const newItem: Holding = {
      id: "h-" + Date.now() + Math.random().toString(36).substr(2, 4),
      name: "נכס חדש",
      isin: "",
      ticker: "",
      weight: "10%",
      sector: "כללי",
      assetClass: "מניות",
      region: "גלובלי"
    };
    setHoldings(prev => [...prev, newItem]);
    setReportData(null);
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
    setReportData(null);
  };

  // Computations
  const computedTotalWeight = holdings.reduce((sum, h) => {
    const numeric = parseFloat(h.weight.replace("%", "").trim()) || 0;
    return sum + numeric;
  }, 0);

  const top3Candidates = [...holdings]
    .map(h => {
      const parsedWeight = parseFloat(h.weight.toString().replace("%", "").trim()) || 0;
      return { ...h, parsedWeight };
    })
    .filter(h => isValidISIN(h.isin))
    .sort((a, b) => b.parsedWeight - a.parsedWeight)
    .slice(0, 3);

  // Trigger analysis
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ holdings })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "שגיאה בתקשורת עם השרת בזמן הניתוח.");
      }

      const data: AnalysisResponse = await response.json();
      setReportData(data);
      setActiveTab("report");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "אירעה שגיאה בלתי צפויה.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!reportData) return;
    navigator.clipboard.writeText(JSON.stringify(reportData.report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  const handleDownloadHTML = () => {
    if (!reportData) return;
    
    const rep = reportData.report;

    // Build the dynamic items list for holdings
    const holdingsRows = holdings.map((h, i) => `
      <tr class="border-b border-slate-150 hover:bg-slate-50/50">
        <td class="px-4 py-2.5 text-center font-bold font-mono text-slate-800">${h.weight || ""}</td>
        <td class="px-4 py-2.5 text-right font-semibold text-slate-900">${h.name || ""}</td>
        <td class="px-4 py-2.5 text-center font-mono text-slate-500 text-xs">${h.isin || "N/A"}</td>
        <td class="px-4 py-2.5 text-center font-mono text-slate-500 text-xs">${h.ticker || "N/A"}</td>
        <td class="px-4 py-2.5 text-right text-slate-600 text-xs">${h.sector || "כללי"}</td>
        <td class="px-4 py-2.5 text-right text-slate-600 text-xs">${h.assetClass || "מניות"}</td>
      </tr>
    `).join('');

    // Executive summary split
    const execSummaryParas = rep.executive_summary.split("\n\n").map((para: string, idx: number) => `
      <p class="text-slate-700 text-sm md:text-base leading-relaxed mb-4 ${idx === 0 ? "italic text-slate-800 font-medium" : ""}">
        ${para}
      </p>
    `).join("");

    // Market Updates split using structured field updates if available
    let marketUpdatesHtml = "";
    if (reportData.field_updates && reportData.field_updates.length > 0) {
      marketUpdatesHtml = reportData.field_updates.map((update: any, idx: number) => {
        const isFirst = idx === 0;
        const borderStyle = isFirst 
          ? "border-r-2 border-emerald-500 pr-4" 
          : "border-r-2 border-slate-700 pr-4";
        
        const badgeStyle = isFirst 
          ? "background: #022c22; color: #6ee7b7; border: 1px solid #065f46;"
          : "background: #1e293b; color: #cbd5e1; border: 1px solid #334155;";

        const getHostname = (url: string) => {
          try {
            return new URL(url).hostname.replace("www.", "");
          } catch {
            return "מקור";
          }
        };

        const sourcesHtml = update.sources && update.sources.length > 0 
          ? update.sources.map((src: string, sIdx: number) => {
              const simpleName = getHostname(src);
              return `<a href="${src}" target="_blank" style="background:#1e293b; color:#34d399; font-family:monospace; font-size:9px; padding:2px 6px; margin-right:4px; text-decoration:none; border-radius:3px;">${simpleName} ↗</a>`;
            }).join("")
          : `<span style="font-size:10px; color:#475569; font-style:italic;">אין מקורות</span>`;

        return `
          <div class="${borderStyle} py-1 text-right mb-5" style="border-right-width: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-direction: row-reverse; flex-wrap: wrap; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 2px; ${badgeStyle}">
                ${update.category || "עדכון כללי"}
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #64748b;">
                מזהה נייר: ${update.identifier} (${update.identifier_type === 1 ? "ISIN" : "מס׳ נייר"})
              </span>
            </div>
            
            <h4 style="font-size: 14px; font-weight: bold; color: #f8fafc; margin-top: 4px; margin-bottom: 4px; font-family: sans-serif;">
              ${update.title}
            </h4>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 8px; font-family: sans-serif;">
              ${update.summary}
            </p>
            
            <div style="display: flex; align-items: center; justify-content: space-between; flex-direction: row-reverse; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px;">
              <div style="display: flex; align-items: center; flex-direction: row-reverse; color: #94a3b8;">
                <span style="color: #64748b; margin-left: 6px;">מקורות:</span>
                ${sourcesHtml}
              </div>
              <span style="font-size:10px; font-family:monospace; font-weight:bold; color: ${isFirst ? "#34d399" : "#64748b"}">
                דירוג עדכון: ${isFirst ? "9.8/10 (דומיננטי בתיק)" : "8." + (9 - idx) + "/10"}
              </span>
            </div>
          </div>
        `;
      }).join("");
    } else {
      const marketUpdatesParts = rep.field_updates_summary.split("\n\n").filter((p: string) => p.trim().length > 0);
      marketUpdatesHtml = marketUpdatesParts.map((p: string, idx: number) => {
        const isFirst = idx === 0;
        const borderStyle = isFirst 
          ? "border-r-2 border-emerald-500 pr-4" 
          : "border-r-2 border-slate-600 pr-4";
        const componentLabel = isFirst ? "text-emerald-400" : "text-slate-400";
        return `
          <div class="${borderStyle} py-1 text-right mb-5">
            <p class="text-xs font-mono tracking-widest uppercase ${componentLabel}">
              COMPONENT UPDATE #${idx + 1}
            </p>
            <p class="text-sm text-slate-300 mt-1 font-sans leading-relaxed">${p}</p>
          </div>
        `;
      }).join("");
    }

    // Key findings bullet lists
    const findingsLines = rep.key_findings
      .split(/\n+/)
      .map((line: string) => line.replace(/^-\s*/, "").replace(/^\*\s*/, "").replace(/^\d+[\.\-]\s*/, "").trim())
      .filter((line: string) => line.length > 0);
    const findingsHtml = findingsLines.map((line: string, idx: number) => {
      const numStr = String(idx + 1).padStart(2, "0");
      return `
        <li class="flex items-start gap-3 flex-row-reverse text-right mb-4">
          <span class="bg-slate-950 text-white font-bold px-2 py-0.5 text-xs font-mono rounded-sm shrink-0">
            ${numStr}
          </span>
          <span class="text-sm text-slate-700 font-sans leading-relaxed flex-1">${line}</span>
        </li>
      `;
    }).join("");

    // Action principles bullet list with badges
    const actionLines = rep.action_principles
      .split(/\n+/)
      .map((line: string) => line.replace(/^-\s*/, "").replace(/^\*\s*/, "").replace(/^\d+[\.\-]\s*/, "").trim())
      .filter((line: string) => line.length > 0);
    const actionHtml = actionLines.map((line: string, idx: number) => {
      let type = "בקרה";
      let badgeColor = "text-emerald-800 bg-white border border-emerald-300";
      
      if (line.includes("לבחון") || line.includes("בחירה")) {
        type = "בחינה";
        badgeColor = "text-emerald-800 bg-white border border-emerald-300 shadow-sm";
      } else if (line.includes("למעקב") || line.includes("עקוב") || line.includes("לעקוב")) {
        type = "מעקב";
        badgeColor = "text-slate-800 bg-white border border-slate-300 shadow-sm";
      } else if (line.includes("לבדוק") || line.includes("בדיקה")) {
        type = "בדיקה";
        badgeColor = "text-slate-800 bg-white border border-slate-300 shadow-sm";
      } else {
        type = "בקרה";
        badgeColor = "text-emerald-800 bg-white border border-emerald-300 shadow-sm";
      }

      return `
        <div class="bg-white p-4 rounded-sm border border-emerald-200/80 shadow-sm text-right mb-3">
          <div class="flex items-center justify-between mb-2 flex-row-reverse">
            <span class="text-[11px] font-black tracking-wider px-2.5 py-0.5 uppercase rounded-sm ${badgeColor}">
              ${type}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">AP-0${idx + 1}</span>
          </div>
          <p class="text-[13.5px] text-slate-800 font-sans font-medium leading-relaxed">${line}</p>
        </div>
      `;
    }).join("");

    // Standalone HTML template with complete print & presentation styling
    const htmlContent = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${rep.report_title} | FinExecutiveSum</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Font import -->
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;950&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Rubik', sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .print-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      @page {
        margin: 1.2cm;
      }
    }
  </style>
</head>
<body class="p-4 sm:p-8 md:p-12">

  <div class="max-w-5xl mx-auto space-y-6">
    
    <!-- EXPORT TOOLBAR (SCREEN-ONLY) -->
    <div class="no-print bg-slate-900 text-white rounded-sm border border-slate-950 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 mb-8 shadow-md">
      <div class="text-right">
        <div class="text-[9px] font-bold text-emerald-400 tracking-widest uppercase font-mono">ייצוא דוח מקומי מאובטח</div>
        <h4 class="text-base font-black leading-tight text-white mt-0.5">דוח מחקר מלא מוכן להדפסה / שמירה כ-PDF</h4>
        <p class="text-slate-400 text-[11.5px] leading-relaxed mt-1">קובץ זה מיוצר באופן עצמאי בלבד במחשבך. כעת, כשהאפליקציה פתוחה בלשונית נפרדת זו, דיאלוג ההדפסה של הדפדפן שלך יעבוד באופן מושלם.</p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-sm text-xs border border-slate-700 transition-all cursor-pointer">
          סגור דף
        </button>
        <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-sm text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer font-sans">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
          הדפס דוח זה
        </button>
      </div>
    </div>

    <!-- MAIN DOSSIER (SWISS INSPIRED BEAUTIFUL UTILITY SCREEN) -->
    <div class="bg-white rounded-none border-2 border-slate-900 overflow-hidden p-6 sm:p-8 md:p-10 space-y-6 text-right print-card">
      
      <!-- Report Header block -->
      <header class="flex flex-col sm:flex-row justify-between items-end border-b-2 border-slate-900 pb-5 mb-8 text-right gap-4">
        <div class="flex-1 w-full">
          <p class="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1 font-mono">
            ${rep.portfolio_label} | FINEXECUTIVESUM
          </p>
          <h1 class="text-2xl sm:text-3xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            ${rep.report_title}
          </h1>
          <p class="text-base text-slate-600 mt-1 italic">
            ${rep.report_subtitle}
          </p>
        </div>
        <div class="text-right sm:text-left border-r-2 sm:border-r-0 sm:border-l-2 border-slate-200 pr-4 sm:pr-0 sm:pl-6 shrink-0 w-full sm:w-auto">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">סטטוס דיווח</div>
          <div class="text-xl sm:text-2xl font-mono font-black text-emerald-600 uppercase">מבוקר ומאושר</div>
        </div>
      </header>

      <!-- Grid 12 Columns Layout -->
      <div class="grid grid-cols-12 gap-6 md:gap-8">
        
        <!-- Left Wing - 8 Columns -->
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          <!-- Executive Summary Card -->
          <div class="bg-white border border-slate-200 p-6 rounded-sm text-right">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-3.5 border-r-4 border-slate-900 pr-3">
              סיכום מנהלים
            </h2>
            <div class="text-slate-700 leading-relaxed text-sm">
              ${execSummaryParas}
            </div>
          </div>

          <!-- Dark block: Market Updates -->
          <div class="bg-slate-900 text-white p-6 rounded-sm flex-grow text-right relative overflow-hidden">
            <h2 class="text-xs font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2 flex-row-reverse justify-end">
              <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></span>
              <span>עדכוני שוק - אחזקות מובילות (GOOGLE GROUNDING)</span>
            </h2>
            
            <div class="space-y-5">
              ${marketUpdatesHtml}
            </div>
          </div>

        </div>

        <!-- Right Wing - 4 Columns -->
        <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          <!-- Key Findings Card -->
          <div class="bg-white border border-slate-200 p-5 rounded-sm text-right">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-r-4 border-slate-900 pr-3">
              ממצאים עיקריים
            </h2>
            <ul class="space-y-3.5 text-right">
              ${findingsHtml}
            </ul>
          </div>

          <!-- Allocation Detailed Overview List -->
          <div class="bg-white border border-slate-200 p-5 rounded-sm text-right font-sans">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-r-4 border-slate-900 pr-3">
              פילוח והקצאת נכסים
            </h2>
            <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
              ${rep.allocation_summary}
            </p>
            
            <!-- Embedded micro spreadsheet of weights mapping -->
            <div class="bg-slate-50 border border-slate-150 rounded-sm overflow-hidden text-right">
              <table class="w-full text-[11px] text-right">
                <thead class="bg-slate-100 text-[9px] text-slate-500 border-b border-slate-200 font-mono">
                  <tr>
                    <th scope="col" class="px-2.5 py-1.5 text-center font-bold">משקל</th>
                    <th scope="col" class="px-2.5 py-1.5 text-right font-bold pr-3">נכס</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150 text-slate-700">
                  ${holdings.map((h) => `
                    <tr class="hover:bg-slate-50/50">
                      <td class="px-2.5 py-1 text-center font-bold font-mono text-slate-900">${h.weight || ""}</td>
                      <td class="px-2.5 py-1 pr-3 font-semibold text-slate-800 text-[11.5px] truncate">${h.name || ""}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Action Principles Card -->
          <div class="bg-emerald-50 border border-emerald-100 p-5 rounded-sm text-right">
            <h2 class="text-xs font-black uppercase tracking-widest text-emerald-800 mb-4 border-r-4 border-emerald-700 pr-3 font-semibold">
              נקודות לבחינה ובקרה
            </h2>
            <div>
              ${actionHtml}
            </div>
          </div>

        </div>

      </div>

      <!-- Holdings spreadsheet table (Expanded for export!) -->
      <div class="bg-white border border-slate-200 p-0 rounded-sm overflow-hidden text-right mt-6">
        <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between flex-row-reverse">
          <span class="text-[10px] font-mono font-bold text-slate-400">HOLDINGS SPEC SHEET (FULL RECONCILIATION)</span>
          <h3 class="text-xs font-black text-slate-900 border-r-3 border-slate-900 pr-2 leading-none">טבלת נכסי תיק ההשקעות المלא</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-right border-collapse">
            <thead class="bg-slate-100/80 text-slate-500 border-b border-slate-200 font-bold">
              <tr>
                <th scope="col" class="px-4 py-2.5 text-center">משקל</th>
                <th scope="col" class="px-4 py-2.5 text-right">שם נייר הערך / נכס</th>
                <th scope="col" class="px-4 py-2.5 text-center">קוד ISIN</th>
                <th scope="col" class="px-4 py-2.5 text-center">טיקר</th>
                <th scope="col" class="px-4 py-2.5 class text-right">סקטור / מגזר</th>
                <th scope="col" class="px-4 py-2.5 class text-right">סוג נכס</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              ${holdingsRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Subordinate Findings -->
      <div class="bg-white border border-slate-200 p-5 rounded-sm text-right mt-6">
        <h2 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-r-4 border-slate-900 pr-3">
          ניתוח אחזקות מובילות ופרמטרים למעקב
        </h2>
        <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
          ${rep.top_holdings_analysis}
        </p>
      </div>

      <!-- Regulatory Compliance Footer section -->
      <footer class="mt-8 pt-4 border-t border-slate-200 text-right">
        <div class="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 leading-relaxed gap-6 flex-col-reverse">
          <p class="max-w-4xl text-slate-400 font-sans">
            ${rep.compliance_note}
          </p>
          <div class="text-right sm:text-left font-mono whitespace-nowrap uppercase tracking-widest bg-slate-50 border border-slate-150 px-2.5 py-1 text-slate-500 rounded-sm">
            מזהה דוח: FX-30-2026-V30
          </div>
        </div>
      </footer>

    </div>

  </div>

</body>
</html>`;

    // Download file script
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `דוח_ניתוח_תיק_השקעות_${rep.portfolio_label.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Minimal themed bullet lists 01, 02, 03...
  const renderBulletListMinimal = (text: string) => {
    if (!text) return null;
    const lines = text
      .split(/\n+/)
      .map(line => line.replace(/^-\s*/, "").replace(/^\*\s*/, "").replace(/^\d+[\.\-]\s*/, "").trim())
      .filter(line => line.length > 0);

    return (
      <ul className="space-y-3.5 text-right font-sans">
        {lines.map((line, idx) => {
          const numStr = String(idx + 1).padStart(2, "0");
          return (
            <li key={idx} className="flex items-start gap-3 flex-row-reverse">
              <span className="bg-slate-900 text-white font-bold px-2 py-0.5 text-[11px] shrink-0 font-mono rounded-sm">
                {numStr}
              </span>
              <span className="text-sm text-slate-700 font-sans leading-relaxed flex-1">{line}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  // Minimal themed action principles (בחינה, מעקב, בדיקה)
  const renderActionPrinciplesMinimal = (text: string) => {
    if (!text) return null;
    const lines = text
      .split(/\n+/)
      .map(line => line.replace(/^-\s*/, "").replace(/^\*\s*/, "").replace(/^\d+[\.\-]\s*/, "").trim())
      .filter(line => line.length > 0);

    return (
      <div className="space-y-3">
        {lines.map((line, idx) => {
          let type = "בקרה";
          let badgeColor = "text-emerald-800 bg-white border border-emerald-300";
          
          if (line.includes("לבחון") || line.includes("בחירה")) {
            type = "בחינה";
            badgeColor = "text-emerald-800 bg-white border border-emerald-300 shadow-xs";
          } else if (line.includes("למעקב") || line.includes("עקוב") || line.includes("לעקוב")) {
            type = "מעקב";
            badgeColor = "text-slate-800 bg-white border border-slate-300 shadow-xs";
          } else if (line.includes("לבדוק") || line.includes("בדיקה")) {
            type = "בדיקה";
            badgeColor = "text-slate-800 bg-white border border-slate-300 shadow-xs";
          } else {
            type = "בקרה";
            badgeColor = "text-emerald-800 bg-white border border-emerald-300 shadow-xs";
          }

          return (
            <div key={idx} className="bg-white p-3.5 rounded-sm border border-emerald-200/80 shadow-xs text-right">
              <div className="flex items-center justify-between mb-1.5 flex-row-reverse">
                <span className={`text-[11px] font-black tracking-wider px-2.5 py-0.5 uppercase ${badgeColor}`}>
                  {type}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">AP-0{idx + 1}</span>
              </div>
              <p className="text-[13.5px] text-slate-800 font-sans font-medium leading-relaxed">{line}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Structured rendering for dynamic Web updates
  const renderMarketUpdatesMinimal = (text: string, fieldUpdates?: FieldUpdate[]) => {
    if (fieldUpdates && fieldUpdates.length > 0) {
      return (
        <div className="space-y-6">
          {fieldUpdates.map((update, idx) => {
            const isFirst = idx === 0;
            const borderStyle = isFirst 
              ? "border-r-2 border-emerald-500 pr-4 text-right" 
              : "border-r-2 border-slate-700 pr-4 text-right";
            
            // Try to extract hostname for cleaner display of source URLs
            const getHostname = (url: string) => {
              try {
                return new URL(url).hostname.replace("www.", "");
              } catch {
                return "קישור מקור";
              }
            };

            return (
              <div key={idx} className={`${borderStyle} py-1 text-right`}>
                <div className="flex items-center gap-2 flex-row-reverse justify-end flex-wrap mb-1.5">
                  <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-xs uppercase leading-none ${
                    isFirst ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {update.category || "עדכון כללי"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    מזהה נייר: {update.identifier} ({update.identifier_type === 1 ? "ISIN" : "מס׳ נייר"})
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-100 font-sans leading-snug">
                  {update.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed font-normal">
                  {update.summary}
                </p>

                {/* Weighted Scoring Badge based on holding centrality + severity */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] flex-row-reverse leading-none flex-wrap gap-2 pt-2 border-t border-slate-800/40">
                  <div className="flex items-center gap-1.5 flex-row-reverse text-slate-400 font-sans">
                    <span className="text-slate-500">מקורות:</span>
                    {update.sources && update.sources.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {update.sources.map((src, sIdx) => {
                          const simpleName = getHostname(src);
                          return (
                            <a 
                              key={sIdx}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 rounded-xs tracking-tight transition-colors truncate max-w-[130px]"
                              title={src}
                            >
                              {simpleName} ↗
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-slate-600">אין מקורות זמינים</span>
                    )}
                  </div>
                  
                  <span className={`text-[10px] font-mono font-bold uppercase ${isFirst ? "text-emerald-400" : "text-slate-500"}`}>
                    דירוג עדכון: {isFirst ? "9.8/10 (דומיננטי בתיק)" : `8.${9 - idx}/10`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (!text) return null;
    const parts = text.split("\n\n").filter(p => p.trim().length > 0);
    return (
      <div className="space-y-5">
        {parts.map((p, idx) => {
          const isFirst = idx === 0;
          const borderStyle = isFirst 
            ? "border-r-2 border-emerald-500 pr-4 text-right" 
            : "border-r-2 border-slate-600 pr-4 text-right";
          
          return (
            <div key={idx} className={`${borderStyle} py-0.5`}>
              <p className={`text-xs font-mono tracking-widest uppercase ${isFirst ? "text-emerald-400" : "text-slate-400"}`}>
                COMPONENT UPDATE #{idx + 1}
              </p>
              <p className="text-sm text-slate-300 mt-1 font-sans leading-relaxed font-normal">{p}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const handleApplyExtraction = () => {
    if (!extractorText.trim()) return;
    try {
      const parsed = parseBroadHoldings(extractorText);
      if (parsed.length === 0) {
        alert("לא נמצאו נכסים תקינים לשיבוץ. ודא כי הטקסט תואם למבנה מופרד בתווים '|' או לפורמט ה-JSON של התיק.");
        return;
      }
      setHoldings(parsed);
      setReportData(null);
      setActiveTab("edit");
      setExtractorSuccess(true);
      setExtractorText("");
      setSelectedPresetIndex(-1); // Resets preset selection indicators
      setTimeout(() => setExtractorSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("שגיאה בניתוח הטקסט שסופק.");
    }
  };

  // Structured rendering for compact AI Card
  const renderAICard = () => {
    if (!reportData || !reportData.ai_card) return null;

    const card = reportData.ai_card;

    return (
      <div className="bg-slate-900 text-white rounded-sm border border-slate-950 p-6 space-y-5 text-right relative overflow-hidden shadow-md no-print max-w-7xl mx-auto w-full leading-normal mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3 flex-col-reverse">
          <div className="flex items-center gap-1.5 flex-wrap flex-row-reverse w-full sm:w-auto">
            {card.toc_chips && card.toc_chips.map((chip, idx) => {
              const badgeColors = 
                chip.type === "good" 
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800" 
                  : chip.type === "warn" 
                    ? "bg-amber-950 text-amber-300 border-amber-800" 
                    : "bg-slate-800 text-slate-300 border-slate-700";
              return (
                <span key={idx} className={`text-[10.5px] font-sans font-bold px-2.5 py-1 rounded-xs border uppercase tracking-wide leading-none ${badgeColors}`}>
                  {chip.label}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <Sparkles className="w-5 h-5 text-emerald-450 shrink-0" />
            <h3 className="font-sans font-black text-slate-100 text-base leading-none">רכיב עדכוני שטח ממוקדים (AI Card)</h3>
          </div>
        </div>

        {/* Lead Paragraph */}
        <div className="bg-slate-950/60 rounded-xs p-4 border border-slate-850/60">
          <p className="text-slate-200 text-sm leading-relaxed font-sans font-medium text-right">
            {card.lead}
          </p>
        </div>

        {/* News Items Grid (max 3 items) */}
        {card.news_items && card.news_items.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono text-slate-500 tracking-wider text-right uppercase leading-none">אירועים מהשטח שסווגו על ידי האנליסט:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {card.news_items.map((item, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-slate-800 p-4 rounded-xs text-right flex flex-col justify-between hover:border-slate-750 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-row-reverse text-[10px] uppercase font-mono leading-none">
                      <span className="px-2 py-0.5 rounded-3xs bg-slate-800 border border-slate-750 font-bold text-slate-300">
                        {item.tag}
                      </span>
                      <span className="text-slate-600 font-mono tracking-tight text-right">CRAWLED</span>
                    </div>
                    <h5 className="font-sans font-bold text-sm text-slate-100 leading-snug">{item.title}</h5>
                    <p className="text-slate-400 text-xs font-sans leading-relaxed">{item.body}</p>
                  </div>
                  {item.sources && item.sources.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-850 flex items-center gap-1.5 justify-end flex-row-reverse flex-wrap">
                      <span className="text-[10px] font-mono text-slate-600 uppercase leading-none">מקורות:</span>
                      {item.sources.map((src, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-mono text-slate-400 font-bold leading-none bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-2xs">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col p-4 sm:p-8" dir="rtl">
      
      {/* ----------------- APP TOP NAVIGATION BAR ----------------- */}
      <header className="no-print flex flex-col sm:flex-row justify-between items-center border-b-2 border-slate-900 pb-4 mb-6 gap-3 flex-col-reverse">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right">
            <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase mb-0.5">סקירה ניהולית | FINEXECUTIVESUM</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">סוכן ניתוח ודוחות תיקי השקעות</h1>
          </div>
          <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-black rounded-sm shadow-sm select-none">
            FX
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
          <div className="text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">סטטוס סוכן</div>
            <div className="text-md sm:text-lg font-mono font-bold text-emerald-600 uppercase">פעיל ומקוון (UTC)</div>
          </div>
          <div className="text-right text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-sm">
            2026-06-08 15:58
          </div>
        </div>
      </header>

      {/* Tabs Menu Navigation Bar */}
      {reportData && (
        <div className="no-print max-w-7xl mx-auto mb-6 flex justify-center bg-slate-150 p-1.5 rounded-sm border border-slate-200 gap-2 text-right w-full">
          <button
            onClick={() => setActiveTab("report")}
            className={`flex-1 sm:flex-initial text-center px-6 py-2 text-xs font-black rounded-xs cursor-pointer transition-all ${
              activeTab === "report" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-200 bg-transparent"
            }`}
          >
            הצג נרטיב ודוח מנהלים מלא
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 sm:flex-initial text-center px-6 py-2 text-xs font-black rounded-xs cursor-pointer transition-all ${
              activeTab === "edit" 
                ? "bg-slate-900 text-white shadow-xs" 
                : "text-slate-600 hover:bg-slate-200 bg-transparent"
            }`}
          >
            עריכת נכסים וסקירת נכס מוביל (AI Card)
          </button>
        </div>
      )}

      {/* ----------------- SCREEN 1: INPUT CONTROLS ----------------- */}
      {activeTab === "edit" && !loading && (
        <div className="no-print space-y-6 flex-grow animate-fade-in">

          {/* Render AICard widget if previous card has successfully completed analyzing */}
          {renderAICard()}
          
          {/* Introductory Hero Area */}
          <div className="bg-white border border-slate-200 p-6 shadow-xs rounded-sm text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-sm font-black uppercase tracking-tighter text-slate-400 mb-2 border-r-4 border-slate-900 pr-3">
              מבוא והנחיות שימוש
            </h2>
            <div className="max-w-4xl text-slate-700 leading-relaxed text-[14.5px] space-y-3">
              <p>
                ברוכים הבאים ל-<strong>FinExecutiveSum</strong>. כלי מחקר פיננסי מתקדם המציג תהליך סימולציה מלא של סורק רשת למציאת נתונים רשמיים, חדשות, ועדכונים עסקיים ברשת אודות ניירות הערך הדומיננטיים בתיק ההשקעות של לקוחותיכם.
              </p>
              <p className="text-slate-500 text-xs font-mono border-t border-slate-100 pt-2 flex items-center gap-1.5 flex-row-reverse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                מנוע הסריקה ימיין ורוצה את ה-ISIN המובילים באנליזה כדי לספק סירוס מקורות מאומתים מתוך Bloomberg, Reuters, Globes ועוד.
              </p>
            </div>
          </div>

          {/* Preset Portfolios Grid */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-sm text-right">
            <h2 className="text-sm font-black uppercase tracking-tighter text-slate-400 mb-4 border-r-4 border-slate-300 pr-3">
              טעינת תיק השקעות מוגדר מראש
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_PORTFOLIOS.map((preset, idx) => {
                const isSelected = selectedPresetIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleLoadPreset(idx)}
                    className={`text-right p-4 rounded-sm border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-xs" 
                        : "bg-white hover:bg-slate-50/50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 flex-row-reverse mb-1">
                      <span className="text-sm font-bold text-slate-900">
                        {preset.name}
                      </span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>
                        {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-slate-500 text-[12px] leading-relaxed font-sans">{preset.description}</p>
                    <div className="mt-2.5 flex justify-end gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                        {preset.holdings.length} ASSETS
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                        ISIN VALID
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Pipe-Delimited Extractor */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-sm text-right overflow-hidden">
            <button
              onClick={() => setShowExtractor(!showExtractor)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer text-right flex-row-reverse transition-colors border-none outline-none"
            >
              <div className="flex items-center gap-2 flex-row-reverse font-semibold">
                <Code className="w-4 h-4 text-slate-700" />
                <span className="font-sans font-black text-slate-700 text-sm">יבואן נכסים מהיר מטקסט (מפרד צינורות | - OCR / PDF Export)</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-sm">
                {showExtractor ? "הסתר יבואן" : "הצג יבואן מהיר"}
              </span>
            </button>
            
            {showExtractor && (
              <div className="p-5 border-t border-slate-200 space-y-4 bg-slate-50/20">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  העתק והדבק כאן נתוני דוח אחזקות או טקסט מיוצא מפורמט מפרדי פסים (כמו ייצוא OCR תפוז קצה). הטיפול מבודד RIC, ISIN או תווי Sec# בצורה דינמית גם אם חסר מזהה פוזיציונלי.
                </p>
                
                <div className="font-mono text-[10px] bg-slate-100 text-slate-500 p-3 rounded-xs border border-slate-150 relative text-left select-all leading-normal">
                  <span className="absolute top-1.5 right-2 font-sans font-bold text-[8.5px] text-slate-400 uppercase tracking-wide">דוגמה לפורמט תקין:</span>
                  Apple Inc. | Stock | Sec# US0378331005 | $150,000 | 25% | Technology | US | RIC: AAPL.O | ISIN: US0378331005<br/>
                  NVIDIA Corporation | Stock | Sec# US67066G1040 | $120,000 | 20% | Semiconductors | US | RIC: NVDA.O | ISIN: US67066G1040
                </div>

                <textarea
                  value={extractorText}
                  onChange={(e) => setExtractorText(e.target.value)}
                  placeholder="הדבק את שורות התיק המופרדות ב-| כאן..."
                  className="w-full h-24 bg-white border border-slate-250 rounded-xs p-3 font-mono text-xs outline-none focus:border-slate-900 text-right leading-relaxed"
                />

                <div className="flex items-center justify-between flex-row-reverse">
                  <button
                    onClick={handleApplyExtraction}
                    disabled={!extractorText.trim()}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white px-4 py-2 text-xs font-black rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    ייבא והחלף ערכי גיליון
                  </button>
                  {extractorSuccess && (
                    <span className="text-emerald-700 text-xs font-bold font-sans flex items-center gap-1.5 flex-row-reverse leading-none bg-emerald-50 px-3 py-1.5 border border-emerald-150 rounded-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ייבוא נכסים בוצע בהצלחה! הגיליון עודכן.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Holdings Spreadsheet / Accounting Ledger */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden text-right">
            
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 flex-col-reverse">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                
                <span className={`inline-flex items-center gap-1 px-3 py-1 bg-white border font-mono text-xs font-bold ${
                  Math.abs(computedTotalWeight - 100) < 0.1 
                    ? "border-emerald-300 text-emerald-800" 
                    : "border-amber-300 text-amber-800"
                }`}>
                  SUM: {computedTotalWeight.toFixed(1)}%
                </span>

                <button
                  onClick={handleAddHolding}
                  className="inline-flex items-center gap-1 bg-slate-900 text-white px-3 py-1 text-xs font-bold hover:bg-slate-800 cursor-pointer rounded-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  הוסף שורת השקעה
                </button>

              </div>

              <div className="flex items-center gap-2 justify-end">
                <h3 className="font-sans font-bold text-slate-800 text-[15px] border-r-4 border-slate-900 pr-3">גיליון פירוט האחזקות ומשקלים</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right font-sans">
                <thead className="text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200 font-mono">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-center w-12 border-l border-slate-150">פעולה</th>
                    <th scope="col" className="px-3 py-3 text-center w-24 border-l border-slate-150">גיאוגרפיה</th>
                    <th scope="col" className="px-3 py-3 text-center w-28 border-l border-slate-150">סקטור קונסול</th>
                    <th scope="col" className="px-3 py-3 text-center w-24 border-l border-slate-150">סוג נכס</th>
                    <th scope="col" className="px-4 py-3 text-center w-20 border-l border-slate-150">משקל %</th>
                    <th scope="col" className="px-4 py-3 text-center w-40 border-l border-slate-150">קוד ני"ע ISIN</th>
                    <th scope="col" className="px-3 py-3 text-center w-24 border-l border-slate-150">סימול</th>
                    <th scope="col" className="px-4 py-3 pr-6">שם תאגיד פיננסי / נכס המטרה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {holdings.map((holding) => {
                    const isIsinOk = isValidISIN(holding.isin);
                    const isTop3 = top3Candidates.some(c => c.id === holding.id);

                    return (
                      <tr key={holding.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        <td className="px-3 py-2 text-center border-l border-slate-150">
                          <button
                            onClick={() => handleRemoveHolding(holding.id)}
                            className="p-1 px-1.5 text-rose-600 hover:bg-rose-50 rounded-xs transition-all cursor-pointer"
                            title="מחק שורה"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="px-3 py-2 border-l border-slate-150">
                          <input
                            type="text"
                            value={holding.region || ""}
                            onChange={(e) => handleUpdateHolding(holding.id, "region", e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white text-center border border-slate-200 focus:border-slate-900 rounded-2xs px-2 py-1 text-xs outline-none"
                            placeholder="איזור גלובלי"
                          />
                        </td>

                        <td className="px-3 py-2 border-l border-slate-150">
                          <input
                            type="text"
                            value={holding.sector || ""}
                            onChange={(e) => handleUpdateHolding(holding.id, "sector", e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white text-center border border-slate-200 focus:border-slate-900 rounded-2xs px-2 py-1 text-xs outline-none"
                            placeholder="מגזר טכנולוגי"
                          />
                        </td>

                        <td className="px-3 py-2 border-l border-slate-150">
                          <select
                            value={holding.assetClass || "מניות"}
                            onChange={(e) => handleUpdateHolding(holding.id, "assetClass", e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-2xs px-1.5 py-1 text-xs outline-none"
                          >
                            <option value="מניות">מניות</option>
                            <option value="אג'ח">אג"ח</option>
                            <option value="קרנות">קרנות</option>
                            <option value="מזומנים">מזומנים</option>
                            <option value="אחר">אחר</option>
                          </select>
                        </td>

                        <td className="px-3 py-2 border-l border-slate-150">
                          <input
                            type="text"
                            value={holding.weight}
                            onChange={(e) => handleUpdateHolding(holding.id, "weight", e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white text-center font-bold border border-slate-200 focus:border-slate-900 rounded-2xs px-2 py-1 text-xs outline-none font-mono"
                            placeholder="10%"
                          />
                        </td>

                        <td className="px-3 py-2 border-l border-slate-150">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={holding.isin}
                              onChange={(e) => handleUpdateHolding(holding.id, "isin", e.target.value)}
                              className={`w-full bg-slate-50 focus:bg-white text-center font-mono border rounded-2xs px-2 py-1 text-xs outline-none ${
                                holding.isin 
                                  ? isIsinOk 
                                    ? "border-emerald-300 text-slate-800" 
                                    : "border-amber-300 text-amber-700"
                                  : "border-slate-200 text-slate-400"
                              }`}
                              placeholder="ISIN 12 תווים"
                            />
                            {holding.isin && (
                              <div className="text-center">
                                {isIsinOk ? (
                                  <span className={`inline-flex px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${isTop3 ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}>
                                    {isTop3 ? "סורק שוק פעיל (TOP 3)" : "מזהה תקין"}
                                  </span>
                                ) : (
                                  <span className="inline-flex px-1.5 py-0.5 rounded-sm text-[9px] bg-rose-50 text-rose-800 border border-rose-200">לא תקני</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2 border-l border-slate-150">
                          <input
                            type="text"
                            value={holding.ticker}
                            onChange={(e) => handleUpdateHolding(holding.id, "ticker", e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 focus:bg-white text-center font-mono font-semibold border border-slate-200 focus:border-slate-900 rounded-2xs px-2 py-1 text-xs outline-none"
                            placeholder="NVDA"
                          />
                        </td>

                        <td className="px-4 py-2 pr-6">
                          <input
                            type="text"
                            value={holding.name}
                            onChange={(e) => handleUpdateHolding(holding.id, "name", e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-2xs px-3 py-1 font-bold text-xs text-slate-800 outline-none"
                            placeholder="שם הנכס"
                          />
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Accounting lower drawer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium flex-col-reverse gap-3">
              <p className="text-right leading-relaxed max-w-2xl text-slate-500">
                הסוכן סורק ומנתח את 3 הנכסים השקילים ביותר בעלי ISIN תקני. קשרי הגומלין והחדשות ישתלבו אוטומטית בדוח המנהלים הסופי.
              </p>
              <div className="bg-white px-3.5 py-1.5 rounded-xs border border-slate-200 text-slate-700 font-mono text-xs">
                מצב סנכרון: <strong>{top3Candidates.length} IN SCAN</strong>
              </div>
            </div>

          </div>

          {/* CRITICAL FAILURE BLOCK */}
          {error && (
            <div className="bg-rose-50 border-r-4 border-rose-600 rounded-sm p-4 text-right flex items-start gap-3 flex-row-reverse shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 leading-none mb-1">כישלון ביצירת דוח הניתוח</h4>
                <p className="text-rose-800 text-xs font-sans leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* TRIGGER CONTROL BUTTON */}
          <div className="flex justify-center pt-2 pb-6">
            <button
              onClick={handleAnalyze}
              disabled={holdings.length === 0}
              className="group relative inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-sans text-base font-bold px-8 py-3.5 rounded-sm shadow-md cursor-pointer transition-all disabled:opacity-50 border border-slate-950 uppercase tracking-wide text-sm"
            >
              <span>הפק דו"ח מנהלים מבוסס סריקת שוק</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

        </div>
      )}

      {/* ----------------- SCREEN 2: DUSTY SANDBOX CRAWLING OVERLAY ----------------- */}
      {loading && (
        <div className="no-print max-w-2xl mx-auto py-12 text-center text-slate-900 font-sans space-y-8 flex-grow">
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-none border-4 border-slate-250 border-t-slate-900 animate-spin" />
              <div className="absolute top-4 left-4 text-slate-900">
                <Layers className="w-8 h-8 opacity-75" />
              </div>
            </div>
            <h2 className="text-lg font-black tracking-tight uppercase pt-3 text-slate-900">מריץ ניתוח מורחב ומנועי חיפוש ברשת...</h2>
            <p className="text-slate-500 text-xs w-96 mx-auto">
              סורק כותרות ושינויים שוטפים ברבעון האחרון עבור ניירות הערך הדומיננטיים.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs text-right space-y-3.5">
            {loadingSteps.map((step, idx) => {
              const isCompleted = loadingStep > idx;
              const isActive = loadingStep === idx;

              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-4 p-3 rounded-sm transition-all flex-row-reverse border ${
                    isActive 
                      ? "bg-slate-50 border-slate-900 scale-[1.002]" 
                      : "bg-white border-transparent"
                  } ${isCompleted ? "opacity-60" : "opacity-40"}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    ) : isActive ? (
                      <Loader2 className="w-4.5 h-4.5 text-slate-800 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-none border-2 border-slate-350" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={`text-xs font-bold leading-none mb-1 ${isActive ? "text-slate-900" : "text-slate-800"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
            REPORT SECTOR SIMULATOR | FX-GROUNDING
          </div>

        </div>
      )}

      {/* ----------------- SCREEN 3: REPORT SECTOR (SWISS/MINIMAL GRID) ----------------- */}
      {reportData && activeTab === "report" && !loading && (
        <div className="space-y-6 flex-grow animate-fade-in text-right">
          
          {/* Action and Formatting Toolbar */}
          <div className="no-print bg-white rounded-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-col-reverse shadow-xs">
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setRawView(!rawView)}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-xs text-xs font-bold border border-slate-300 transition-all cursor-pointer"
                title="צפה בפורמט ה-JSON המקורי"
              >
                <Code className="w-3.5 h-3.5" />
                {rawView ? "הצג דוח מעוצב" : "הצג קוד JSON מובנה"}
              </button>

              <button
                onClick={handleCopyJson}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs text-xs font-bold border transition-all cursor-pointer ${
                  copied 
                    ? "bg-slate-100 border-slate-900 text-slate-900 shadow-xs" 
                    : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {copied ? "הועתק ללוח!" : "העתק JSON מלא"}
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                הדפס דוח (PDF)
              </button>

              <button
                onClick={handleDownloadHTML}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="שמור והורד את הדו״ח המלא כקובץ HTML מעוצב"
              >
                <Download className="w-3.5 h-3.5 text-emerald-250" />
                הורד כקובץ HTML לכונן המקומי
              </button>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setActiveTab("edit")}
                className="flex items-center gap-1 bg-white text-slate-800 border border-slate-900 px-3.5 py-1.5 rounded-xs text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 ml-0.5" />
                צפייה ועריכת נכסי התיק
              </button>
            </div>

          </div>

          {/* iframe Printing Blocker Alert */}
          {isInIframe && (
            <div className="no-print bg-amber-50 border border-amber-250 rounded-sm p-4 text-right flex items-start gap-3.5 flex-row-reverse shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-amber-950 text-sm mb-1 leading-none">מדוע כפתור ההדפסה מרגיש מושבת? (מגבלת iFrame בממשק)</h4>
                <p className="text-amber-800 text-xs font-sans leading-relaxed">
                  דפדפנים מצד אבטחה קשיחה חוסמים פתיחת דיאלוג הדפסה (<code className="font-mono font-bold bg-amber-100/60 px-1 py-0.5 text-amber-900">window.print</code>) מתוך תצוגה מקדימה משובצת (iFrame) של AI Studio. תוכלי לפתור זאת בשתי דרכים קלות:
                </p>
                <div className="mt-3.5 flex items-center gap-3 justify-end flex-wrap">
                  <span className="text-[11px] text-slate-500 font-sans">
                    1. <strong>המלצה מועדפת:</strong> פתחי את האפליקציה בלשונית חיצונית חדשה (על ידי לחיצה על כפתור ה- <strong>"פתיחה בלשונית חדשה" ↗</strong> הממוקם בצד שמאל למעלה בנגן) והדפיסי משם בצורה מושלמת.
                  </span>
                  <span className="text-[11.5px] text-slate-400">|</span>
                  <button
                    onClick={handleDownloadHTML}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xs font-bold text-[11px] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    2. הורד את הדוח הפיננסי לקובץ HTML עצמאי
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Core view toggler */}
          {rawView ? (
            <div className="no-print bg-slate-900 text-slate-100 rounded-sm border border-slate-950 overflow-hidden text-right">
              <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between flex-row-reverse font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                </div>
                <div className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  RAW 11 NARRATIVE KEYS JSON EXPORT
                </div>
              </div>
              <div className="p-5 font-mono text-xs overflow-auto max-h-[600px] text-left dir-ltr bg-slate-900/90 whitespace-pre-wrap leading-relaxed select-all">
                {JSON.stringify(reportData.report, null, 2)}
              </div>
            </div>
          ) : (
            
            /* SWISS INSPIRED BEAUTIFUL UTILITY DOSSIER */
            <div className="bg-white rounded-none border-2 border-slate-900 overflow-hidden p-6 sm:p-8 space-y-6 text-right print:p-0 print:border-none print-card">
              
              {/* Report Header block EXACTLY matching design theme */}
              <header className="flex flex-col sm:flex-row justify-between items-end border-b-2 border-slate-900 pb-5 mb-8 text-right gap-4">
                <div className="flex-1 w-full">
                  <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1">
                    {reportData.report.portfolio_label} | FINEXECUTIVESUM
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                    {reportData.report.report_title}
                  </h1>
                  <p className="text-base text-slate-600 mt-1 italic">
                    {reportData.report.report_subtitle}
                  </p>
                </div>
                <div className="text-left border-r-2 md:border-r-0 md:border-l-2 border-slate-200 pr-4 md:pr-0 md:pl-6 shrink-0 w-full sm:w-auto text-right sm:text-left">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">סטטוס דיווח</div>
                  <div className="text-xl sm:text-2xl font-mono font-black text-emerald-600 uppercase">מבוקר ומאושר</div>
                  {reportData.input_echo && (
                    <div className="mt-1 text-[10px] font-mono font-bold text-right sm:text-left">
                      {reportData.input_echo.from_cache ? (
                        <span className="bg-amber-150 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-xs text-[9px] uppercase tracking-wider font-extrabold shadow-2xs select-none">CACHE HIT</span>
                      ) : (
                        <span className="bg-blue-150 text-blue-800 border border-blue-300 px-1.5 py-0.5 rounded-xs text-[9px] uppercase tracking-wider font-extrabold shadow-2xs select-none">FRESH REQS</span>
                      )}
                    </div>
                  )}
                </div>
              </header>

              {/* Cache input_echo audit trail block */}
              {reportData.input_echo && (
                <div className="bg-slate-50 border border-slate-200 px-4 py-3 text-right flex flex-col md:flex-row-reverse justify-between items-start md:items-center rounded-sm gap-2.5">
                  <div className="flex items-center gap-1.5 flex-row-reverse text-xs text-slate-600 font-sans">
                    <span className="font-extrabold text-slate-800">סימוני בקרת אימון (QA Echo):</span>
                    <span className="bg-slate-250 border border-slate-300 text-slate-700 font-mono text-[10px] px-1.5 py-1 rounded-xs">נכסים: {reportData.input_echo.holdings_count}</span>
                    <span className="bg-slate-250 border border-slate-300 text-slate-700 font-mono text-[10px] px-1.5 py-1 rounded-xs">משקל קבוע: {reportData.input_echo.weight_sum}%</span>
                    <span className="bg-slate-250 border border-slate-300 text-slate-750 font-mono text-[10px] px-1.5 py-1 rounded-xs select-all">טביעת אצבע: {reportData.input_echo.fingerprint}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    נוצר ב- {new Date(reportData.input_echo.generated_at).toLocaleString("he-IL")} {reportData.input_echo.from_cache && "(שוחזר מ-Cache)"}
                  </div>
                </div>
              )}

              {/* Grid 12 Columns Layout */}
              <div className="grid grid-cols-12 gap-8">
                
                {/* Right / Left Side Columns depending on rtl reading direction.
                    In standard CSS, col-span-8 and col-span-4 map layout arrangement. */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Executive Summary Card with bold black header border */}
                  <div className="bg-white border border-slate-200 p-6 shadow-xs rounded-sm text-right">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3.5 border-r-4 border-slate-900 pr-3">
                      סיכום מנהלים
                    </h2>
                    <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-3 font-sans">
                      {reportData.report.executive_summary.split("\n\n").map((para, idx) => (
                        <p key={idx} className={idx === 0 ? "italic text-slate-800 font-medium" : "text-slate-700"}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Dark block: Market Updates (Grounding summaries) */}
                  <div className="bg-slate-900 text-white p-6 rounded-sm flex-grow text-right relative overflow-hidden shadow-xs">
                    <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2 flex-row-reverse justify-end">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>
                      <span>עדכוני שוק - אחזקות מובילות (GOOGLE GROUNDING)</span>
                    </h2>
                    
                    {renderMarketUpdatesMinimal(reportData.report.field_updates_summary, reportData.field_updates)}

                    {/* Grounding references link boxes */}
                    {reportData.searchedHoldings && reportData.searchedHoldings.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-800">
                        <p className="text-[11px] font-mono text-slate-500 text-right mb-2.5 uppercase tracking-widest">מקורות ומזהים פיננסיים שנסרקו:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {reportData.searchedHoldings.map((sh, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-sm p-3 text-right">
                              <p className="text-xs font-bold text-slate-200 truncate">{sh.name}</p>
                              <p className="text-[10px] font-mono text-slate-500 leading-none mt-1 tracking-tight">{sh.isin}</p>
                              <div className="mt-2 flex items-center justify-between text-[11px] flex-row-reverse leading-none">
                                <span className="text-emerald-400 font-mono font-bold">{sh.sourcesCount} CRAWLS</span>
                                <span className="text-slate-600 font-mono text-[9px] uppercase">GROUNDED</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right / Left Side Sidebar (col-span-4) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Key Findings Card (01, 02, 03 utility lists) */}
                  <div className="bg-white border border-slate-200 p-5 shadow-xs rounded-sm text-right">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-r-4 border-slate-900 pr-3">
                      ממצאים עיקריים
                    </h2>
                    {renderBulletListMinimal(reportData.report.key_findings)}
                  </div>

                  {/* Allocation Detailed Overview List */}
                  <div className="bg-white border border-slate-200 p-5 shadow-xs rounded-sm text-right">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-r-4 border-slate-900 pr-3">
                      פילוח והקצאת נכסים
                    </h2>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                      {reportData.report.allocation_summary}
                    </p>
                    
                    {/* Embedded micro spreadsheet of weights mapping */}
                    <div className="bg-slate-50 border border-slate-150 rounded-sm overflow-hidden text-right">
                      <table className="w-full text-xs text-right font-sans">
                        <thead className="bg-slate-100 text-[10px] text-slate-500 border-b border-slate-200 font-mono">
                          <tr>
                            <th scope="col" className="px-2.5 py-1.5 text-center">משקל</th>
                            <th scope="col" className="px-2.5 py-1.5 pr-3">נכס</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-slate-700">
                          {holdings.map((h, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-2.5 py-1 text-center font-bold font-mono text-slate-900">{h.weight}</td>
                              <td className="px-2.5 py-1 pr-3 font-semibold text-slate-800 text-[11px] truncate max-w-[120px]">{h.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Principles Card - The Emerald custom tag dashboard */}
                  <div className="bg-emerald-50 border border-emerald-100 p-5 flex-grow rounded-sm text-right">
                    <h2 className="text-xs font-black uppercase tracking-widest text-emerald-800 mb-4 border-r-4 border-emerald-700 pr-3">
                      נקודות לבחינה ובקרה
                    </h2>
                    {renderActionPrinciplesMinimal(reportData.report.action_principles)}
                  </div>

                </div>

              </div>

              {/* Subordinate Findings: Tickers monitoring */}
              <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-xs text-right mt-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-r-4 border-slate-900 pr-3">
                  ניתוח אחזקות מובילות ופרמטרים למעקב
                </h2>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {reportData.report.top_holdings_analysis}
                </p>
              </div>

              {/* Regulatory Compliance Footer section EXACTLY like design */}
              <footer className="mt-8 pt-4 border-t border-slate-200 text-right">
                <div className="flex flex-col sm:flex-row justify-between items-center text-[10.5px] text-slate-400 leading-relaxed gap-6 flex-col-reverse">
                  <p className="max-w-4xl text-slate-400">
                    {reportData.report.compliance_note}
                  </p>
                  <div className="text-left font-mono whitespace-nowrap uppercase text-[10px] tracking-widest bg-slate-50 border border-slate-150 px-2.5 py-1 text-slate-500 rounded-sm">
                    מזהה דוח: FX-30-2026-V30
                  </div>
                </div>
              </footer>

            </div>
          )}

          {/* Quick Return Actions */}
          <div className="no-print flex justify-center pb-8 gap-4 pt-2 flex-wrap">
            <button
              onClick={() => setActiveTab("edit")}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-black px-5 py-2 rounded-sm shadow-xs cursor-pointer uppercase transition-all border border-slate-950"
            >
              <ChevronRight className="w-4 h-4 ml-0.5" />
              חזור לעריכת נכסי התיק
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-sans text-xs font-black px-5 py-2 rounded-sm shadow-xs cursor-pointer uppercase transition-all border border-slate-300"
              title="מתאים להדפסה בלשונית חיצונית של האפליקציה"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              הדפס דוח השקעות מבוקר
            </button>

            <button
              onClick={handleDownloadHTML}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-black px-5 py-2 rounded-sm shadow-xs cursor-pointer uppercase transition-all border border-emerald-700"
              title="שמור את הדוח המלא כקובץ HTML למחשב"
            >
              <Download className="w-4 h-4 text-emerald-250" />
              הורד כקובץ HTML עצמאי
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
