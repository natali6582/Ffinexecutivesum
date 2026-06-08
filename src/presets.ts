import { Holding } from "./types";

export interface PresetPortfolio {
  name: string;
  description: string;
  holdings: Holding[];
}

export const PRESET_PORTFOLIOS: PresetPortfolio[] = [
  {
    name: "תיק מגה-קפ וטכנולוגיה עולמית",
    description: "תיק השקעות ממוקד מניות טכנולוגיה מובילות בארה\"ב בעלות שווי שוק גבוה וזיקה לצמיחה דינמית.",
    holdings: [
      {
        id: "p1-1",
        name: "Apple Inc.",
        isin: "US0378331005",
        ticker: "AAPL",
        weight: "25%",
        sector: "טכנולוגיה",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "p1-2",
        name: "Microsoft Corporation",
        isin: "US5949181045",
        ticker: "MSFT",
        weight: "20%",
        sector: "טכנולוגיה / ענן",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "p1-3",
        name: "NVIDIA Corporation",
        isin: "US67066G1040",
        ticker: "NVDA",
        weight: "15%",
        sector: "שבבים ומחשוב פנים",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "p1-4",
        name: "Tesla Inc.",
        isin: "US88160R1014",
        ticker: "TSLA",
        weight: "10%",
        sector: "רכבים חשמליים",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "p1-5",
        name: "Meta Platforms Inc.",
        isin: "US30303M1027",
        ticker: "META",
        weight: "10%",
        sector: "רשתות חברתיות / AI",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "p1-6",
        name: "Alphabet Inc.",
        isin: "US02079K3059",
        ticker: "GOOGL",
        weight: "10%",
        sector: "פרסום דיגיטלי / AI",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "p1-7",
        name: "מזומן ושווי מזומנים",
        isin: "None",
        ticker: "CASH",
        weight: "10%",
        sector: "נזילות",
        assetClass: "מזומנים",
        region: "ישראל"
      }
    ]
  },
  {
    name: "תיק תעשייה וענקיות ישראל",
    description: "חשיפה מרוכזת לחברות מובילות במדדים תל-אביביים עם שילוב רפואה, תעשייה ביטחונית וטכנולוגיה מקומית.",
    holdings: [
      {
        id: "p2-1",
        name: "Nice Ltd",
        isin: "IL0027301017",
        ticker: "NICE",
        weight: "30%",
        sector: "טכנולוגיה / שירות לקוחות",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "p2-2",
        name: "Teva Pharmaceutical Industries",
        isin: "US8816242098",
        ticker: "TEVA",
        weight: "25%",
        sector: "בריאות ורפואה",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "p2-3",
        name: "Elbit Systems Ltd",
        isin: "IL0010811246",
        ticker: "ESLT",
        weight: "20%",
        sector: "ביטחון ותעופה",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "p2-4",
        name: "Tower Semiconductor Ltd",
        isin: "IL0010823126",
        ticker: "TSEM",
        weight: "15%",
        sector: "חצי מוליכים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "p2-5",
        name: "אקרו נדלן בע\"מ",
        isin: "IL0011831862",
        ticker: "ACRO",
        weight: "10%",
        sector: "נדל\"ן ובינוי",
        assetClass: "מניות",
        region: "ישראל"
      }
    ]
  },
  {
    name: "תיק פיזור ענקיות אירופה וגלובלי",
    description: "תיק מפוזר המכסה פלא חצי-מוליכים הולנדי, קמעונאות יוקרה צרפתית ובנייה בריטית.",
    holdings: [
      {
        id: "p3-1",
        name: "Berkeley Group Holdings Plc",
        isin: "GB00B02L3W35",
        ticker: "BKG",
        weight: "40%",
        sector: "צריכה מחזורית / בינוי",
        assetClass: "מניות",
        region: "בריטניה"
      },
      {
        id: "p3-2",
        name: "ASML Holding NV",
        isin: "NL0010273215",
        ticker: "ASML",
        weight: "35%",
        sector: "טכנולוגיית ייצור שבבים",
        assetClass: "מניות",
        region: "הולנד"
      },
      {
        id: "p3-3",
        name: "LVMH Moët Hennessy",
        isin: "FR0000121014",
        ticker: "MC",
        weight: "25%",
        sector: "מוצרי יוקרה",
        assetClass: "מניות",
        region: "צרפת"
      }
    ]
  }
];
