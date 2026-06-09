import { Holding } from "./types";

export interface PresetPortfolio {
  name: string;
  description: string;
  holdings: Holding[];
}

export const PRESET_PORTFOLIOS: PresetPortfolio[] = [
  {
    name: "תיק 4 (דוח נוכחי - קסם KTF ותכלית TTF)",
    description: "תיק השקעות חדש ומבוזר הכולל ריכוז ראשון של אג\"ח ממשלתיות וקונצרניות בישראל (קסם KTF, תכלית TTF) לצד קרנות סל מניות מובילות (S&P 500, נאסד\"ק 100).",
    holdings: [
      {
        id: "usr4-1",
        name: "קסם KTF תל גוב- שקלי",
        isin: "IL0051180474",
        ticker: "5118047",
        weight: "14.97%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr4-2",
        name: "תכלית TTF צמוד A ומעלה מרווח אג\"ח ממשלתי",
        isin: "IL0051333768",
        ticker: "5133376",
        weight: "13.18%",
        sector: "מדדי אג\"ח",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr4-3",
        name: "קסםKTF תל גוב-צמודות 5-10",
        isin: "IL0051180540",
        ticker: "5118054",
        weight: "12.95%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr4-4",
        name: "תכלית TTF ת\"א 35",
        isin: "IL0051094188",
        ticker: "5109418",
        weight: "8.97%",
        sector: "מניות מדדים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr4-5",
        name: "תכלית TTF אינדקס ישראל שקלי A ומעלה פקטור מרווח",
        isin: "IL0051343908",
        ticker: "5134390",
        weight: "6.97%",
        sector: "מדדי אג\"ח",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr4-6",
        name: "מור מחקה S&P 500 מנוטרלת מט\"ח",
        isin: "IL0051230212",
        ticker: "5123021",
        weight: "6.51%",
        sector: "מניות מדדים חול",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-7",
        name: "תכלית NASDAQ 100 TTF מנוטרלת מטח",
        isin: "IL0051231798",
        ticker: "5123179",
        weight: "4.08%",
        sector: "טכנולוגיה ומדדים",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-8",
        name: "תכלית TTF ת\"א 90",
        isin: "IL0051187404",
        ticker: "5118740",
        weight: "4.05%",
        sector: "מניות מדדים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr4-9",
        name: "קסם iBoxx US Liquid Investment Grade Top 30 KTF",
        isin: "IL0051181795",
        ticker: "5118179",
        weight: "4.05%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr4-10",
        name: "אי.בי.אי מחקה MSCI EM",
        isin: "IL0051193188",
        ticker: "5119318",
        weight: "3.55%",
        sector: "שווקים מתפתחים",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-11",
        name: "תכלית S&P 500 TTF",
        isin: "IL0051139983",
        ticker: "5113998",
        weight: "2.79%",
        sector: "מניות מדדים חול",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-12",
        name: "MTF מחקה STOXX Europe 600",
        isin: "IL0051218431",
        ticker: "5121843",
        weight: "2.67%",
        sector: "מניות אירופה",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-13",
        name: "מגדל כספית",
        isin: "IL0051343098",
        ticker: "5134309",
        weight: "2.53%",
        sector: "כספיות",
        assetClass: "מזומנים",
        region: "ישראל"
      },
      {
        id: "usr4-14",
        name: "Shiller Barclays CAPE® US Core Mid-Month Sector",
        isin: "IL0051307374",
        ticker: "5130737",
        weight: "2.52%",
        sector: "מניות מדדים חול",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-15",
        name: "ISHARES $ HIGH YIELD CORP BOND UCITS ETF",
        isin: "IE00BYXYYL56",
        ticker: "1159078",
        weight: "2.49%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr4-16",
        name: "ילין לפידות מחקה ת\"א בנקים",
        isin: "IL0051373020",
        ticker: "5137302",
        weight: "2.41%",
        sector: "פיננסים ובנקים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr4-17",
        name: "MTF מחקה (!) אינדקס HY-BBB כללי",
        isin: "IL0051233513",
        ticker: "5123351",
        weight: "1.88%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr4-18",
        name: "הראל סל Nikkei 225 מנוטרלת מט\"ח",
        isin: "IL0011492514",
        ticker: "1149251",
        weight: "1.40%",
        sector: "מניות יפן",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr4-19",
        name: "MTF מחקה ת\"א צמיחה",
        isin: "IL0051236417",
        ticker: "5123641",
        weight: "1.36%",
        sector: "מניות ישראל",
        assetClass: "מניות",
        region: "ישראל"
      }
    ]
  },
  {
    name: "תיק 5 (דוח קודם - אג\"ח, נדל\"ן ותשתיות ישראל)",
    description: "תיק השקעות דפנסיבי המורכב ברובו מאגרות חוב ממשלתיות ישראל ומגוון רחב של אג\"ח קונצרניות מענפי הנדל\"ן, הריט, התשתיות והבנקאות (ג'נריישן, סלע, מליסרון, לאומי, שפיר) לצד חשיפה מנייתית מבוזרת (XLK, מזרחי).",
    holdings: [
      {
        id: "usr5-1",
        name: "ממשלתי שקלית 0330",
        isin: "IL0011609851",
        ticker: "1160985",
        weight: "9.70%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-2",
        name: "סלע נדלן אגח ד",
        isin: "IL0011671471",
        ticker: "1167147",
        weight: "3.14%",
        sector: "נדל\"ן וריט",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-3",
        name: "ישרס אגח יט",
        isin: "IL0061303488",
        ticker: "6130348",
        weight: "2.84%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-4",
        name: "ג'נריישן קפ אגח ג",
        isin: "IL0011845554",
        ticker: "1184555",
        weight: "2.78%",
        sector: "תשתיות ואנרגיה",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-5",
        name: "אלוני חץ אגח יב",
        isin: "IL0039004952",
        ticker: "3900495",
        weight: "2.76%",
        sector: "נדל\"ן מניב",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-6",
        name: "ווסטדייל אגח ג",
        isin: "None",
        ticker: "1208511",
        weight: "2.57%",
        sector: "נדל\"ן חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr5-7",
        name: "ממשל שקלית 0432",
        isin: "IL0011806606",
        ticker: "1180660",
        weight: "2.53%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-8",
        name: "נכסים ובנ אגח י",
        isin: "IL0011936304",
        ticker: "1193630",
        weight: "2.49%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-9",
        name: "מליסרון אגח יז",
        isin: "IL0032302734",
        ticker: "3230273",
        weight: "2.39%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-10",
        name: "שכון ובינוי אגח 8",
        isin: "IL0011358889",
        ticker: "1135888",
        weight: "2.38%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-11",
        name: "נמקו אגח ב",
        isin: "IL0011602583",
        ticker: "1160258",
        weight: "2.37%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-12",
        name: "מזרחי טפחות",
        isin: "IL0006954379",
        ticker: "695437",
        weight: "2.34%",
        sector: "פיננסים ובנקים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr5-13",
        name: "כללביט אגח יב",
        isin: "IL0011799280",
        ticker: "1179928",
        weight: "2.31%",
        sector: "בנקים ופיננסים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-14",
        name: "מגדל הון אגח יד",
        isin: "IL0012075219",
        ticker: "1207521",
        weight: "2.26%",
        sector: "בנקים ופיננסים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-15",
        name: "מניבים ריט אגח ד",
        isin: "IL0011939290",
        ticker: "1193929",
        weight: "2.25%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-16",
        name: "מבנה אגח כה",
        isin: "IL0022606367",
        ticker: "2260636",
        weight: "2.20%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-17",
        name: "לייטסטון אגח ג",
        isin: "IL0011900995",
        ticker: "1190099",
        weight: "2.09%",
        sector: "נדל\"ן חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr5-18",
        name: "אמות אגח ט",
        isin: "IL0012049990",
        ticker: "1204999",
        weight: "1.89%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-19",
        name: "שפיר הנדסה אגח ג",
        isin: "IL0011784175",
        ticker: "1178417",
        weight: "1.81%",
        sector: "תעשייה ותשתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr5-20",
        name: "XLK - Technology ETF",
        isin: "US81369Y8030",
        ticker: "XLK",
        weight: "1.79%",
        sector: "טכנולוגיה ומדדים",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "usr5-21",
        name: "פועלים",
        isin: "IL0006625771",
        ticker: "662577",
        weight: "1.72%",
        sector: "פיננסים ובנקים",
        assetClass: "מניות",
        region: "ישראל"
      }
    ]
  },
  {
    name: "תיק 6 (דוח נוכחי - אלטשולר שחם, שקליות ומדדים)",
    description: "תיק מגוון עם חשיפה רחבה לקרנות נאמנות של אלטשולר שחם (שווקים מפותחים, אג\"ח חברות, סופה) בשילוב אגרות חוב ממשלתיות ישראל ומדדים גלובליים (מדד הניקיי, נאסד\"ק 100, S&P 500).",
    holdings: [
      {
        id: "usr6-1",
        name: "אלטש שווק מפותח",
        isin: "IL0051186091",
        ticker: "5118609",
        weight: "13.15%",
        sector: "מניות מפותחות",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr6-2",
        name: "אלטשולר שחם (!) אגח חברות ללא",
        isin: "IL0051056971",
        ticker: "5105697",
        weight: "13.02%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-3",
        name: "אלטשולר שחם (!) אגח ארהב/חול ק",
        isin: "IL0051185911",
        ticker: "5118591",
        weight: "9.93%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr6-4",
        name: "אלטשולר שחם (!) אגח גלובלי ללא",
        isin: "IL0051059116",
        ticker: "5105911",
        weight: "6.84%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr6-5",
        name: "אלטשולר שחם אגח תל בונד",
        isin: "IL0051100852",
        ticker: "5110085",
        weight: "5.99%",
        sector: "מדדי אג\"ח",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-6",
        name: "1025 צמודה ממשלתי",
        isin: "IL0011359127",
        ticker: "1135912",
        weight: "5.63%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-7",
        name: "גלובלי מניות (4B) שחם אלטשולר",
        isin: "IL0051083298",
        ticker: "5108329",
        weight: "4.20%",
        sector: "מניות גלובלי",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr6-8",
        name: "ממשלתי צמוד 0527",
        isin: "IL0011408478",
        ticker: "1140847",
        weight: "3.82%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-9",
        name: "אלטשולר שחם סופה מניות",
        isin: "IL0051267016",
        ticker: "5126701",
        weight: "3.73%",
        sector: "מניות ישראל",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr6-10",
        name: "אלטשולר שחם (!) אגח חול עד 10%",
        isin: "IL0051077845",
        ticker: "5107784",
        weight: "3.53%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr6-11",
        name: "04/25 0.5% שקלית ממשלתית",
        isin: "IL0011626681",
        ticker: "1162668",
        weight: "3.39%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-12",
        name: "קסם NASDAQ 100 KTF",
        isin: "IL0051289051",
        ticker: "5128905",
        weight: "3.07%",
        sector: "טכנולוגיה ומדדים",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "usr6-13",
        name: "מז טפ הנפק 46",
        isin: "IL0023102259",
        ticker: "2310225",
        weight: "2.79%",
        sector: "פיננסים ובנקים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-14",
        name: "פועלים הנפקות אגח 36",
        isin: "None",
        ticker: "1940659",
        weight: "2.40%",
        sector: "פיננסים ובנקים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-15",
        name: "אלטשולר שחם (!) אגח הזדמנויות",
        isin: "IL0051086424",
        ticker: "5108642",
        weight: "2.32%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr6-16",
        name: "קסם S&P 500 KTF מנוטרלת מט\"ח",
        isin: "IL0051229578",
        ticker: "5122957",
        weight: "2.10%",
        sector: "מניות מדדים חול",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr6-17",
        name: "יתר (40) שחם אלטשולר",
        isin: "IL0051059033",
        ticker: "5105903",
        weight: "2.00%",
        sector: "מניות ישראל",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr6-18",
        name: "קסם ETF KOSPI 200",
        isin: "IL0011457541",
        ticker: "1145754",
        weight: "1.74%",
        sector: "מניות אסיה",
        assetClass: "מניות",
        region: "גלובלי"
      }
    ]
  },
  {
    name: "תיק 3 (נכסים אלטרנטיביים ו-Private Equity)",
    description: "תיק מבוזר עם ריכוזיות גבוהה במניות גלובליות ו-Private Equity (SCHF, HVPE, NBPE, FDN) השם דגש על שווקים מפותחים ונכסים אלטרנטיביים.",
    holdings: [
      {
        id: "usr3-1",
        name: "SCHF- SCHWAB INT EQUITY",
        isin: "US8085248057",
        ticker: "SCHF",
        weight: "26.84%",
        sector: "מניות מפותחות",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr3-2",
        name: "HVPE.L- HarbourVest Global Private Equity Ltd",
        isin: "GG00BR30MJ80",
        ticker: "HVPE",
        weight: "25.85%",
        sector: "Private Equity",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr3-3",
        name: "NBPE.LN- NB Private Equity Partners Limited I",
        isin: "GG00B1ZBD492",
        ticker: "NBPE",
        weight: "20.91%",
        sector: "Private Equity",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr3-4",
        name: "FDN- First Trust Dow Jones Internet ETF",
        isin: "US33733E3027",
        ticker: "FDN",
        weight: "14.63%",
        sector: "טכנולוגיה ואינטרנט",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "usr3-5",
        name: "KWEB - KraneShares CSI China Internet ETF",
        isin: "US5007673065",
        ticker: "KWEB",
        weight: "6.24%",
        sector: "אינטרנט וטכנולוגיה סין",
        assetClass: "מניות",
        region: "סין"
      },
      {
        id: "usr3-6",
        name: "פיקדון דולר ארה\"ב",
        isin: "None",
        ticker: "USD_DEP",
        weight: "2.69%",
        sector: "מזומן ונזילות",
        assetClass: "מזומנים",
        region: "גלובלי"
      },
      {
        id: "usr3-7",
        name: "עו'ש שקלי",
        isin: "None",
        ticker: "ILS_CASH",
        weight: "0.99%",
        sector: "מזומן ונזילות",
        assetClass: "מזומנים",
        region: "ישראל"
      },
      {
        id: "usr3-8",
        name: "עו\"ש דולר ארה\"ב",
        isin: "None",
        ticker: "USD_CASH",
        weight: "0.72%",
        sector: "מזומן ונזילות",
        assetClass: "מזומנים",
        region: "גלובלי"
      },
      {
        id: "usr3-9",
        name: "IWDA.L- iShares Core MSCI World ETF USD",
        isin: "IE00B4L5Y983",
        ticker: "IWDA",
        weight: "0.70%",
        sector: "מניות קור גדולה",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr3-10",
        name: "עו\"ש לירה שטרלינג",
        isin: "None",
        ticker: "GBP_CASH",
        weight: "0.42%",
        sector: "מזומן ונזילות",
        assetClass: "מזומנים",
        region: "גלובלי"
      }
    ]
  },
  {
    name: "תיק 2 (אגרות חוב וממשלתיות מבוזר)",
    description: "תיק מבוזר המורכב ברובו מאגרות חוב קונצרניות וממשלתיות בישראל ובעולם (Goldman Sachs, PIMCO, לאומי, חשמל) לצด קרנות סל מנייתיות מובילות (S&P 500, תא 125).",
    holdings: [
      {
        id: "usr2-1",
        name: "GSGCHIA LX Goldman Sachs - SICAV I - GS G",
        isin: "LU0234589421",
        ticker: "70477856",
        weight: "6.59%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr2-2",
        name: "אי.בי.אי. (0B) (!) אג\"ח חברות",
        isin: "IL0051194251",
        ticker: "5119425",
        weight: "4.97%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-3",
        name: "אי.בי.אי. (0B) תיק קונצרני",
        isin: "IL0051284342",
        ticker: "5128434",
        weight: "4.89%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-4",
        name: "קסם KTF תל גוב-שקלי 5-10",
        isin: "IL0051291925",
        ticker: "5129192",
        weight: "4.56%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-5",
        name: "IVV US iShares Core S&P 500 ETF",
        isin: "US4642872000",
        ticker: "IVV",
        weight: "4.39%",
        sector: "מניות מדדים",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "usr2-6",
        name: "MTF סל (00) תל בונד - צמודות A",
        isin: "IL0011715948",
        ticker: "1171594",
        weight: "4.34%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-7",
        name: "PIMCO Global Investors (PIMINIA)",
        isin: "IE00B87KCF77",
        ticker: "70724430",
        weight: "3.64%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "אירופה"
      },
      {
        id: "usr2-8",
        name: "בנק לאומי לישראל סדרה 183",
        isin: "IL0060405474",
        ticker: "6040547",
        weight: "3.18%",
        sector: "פיננסים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-9",
        name: "חברת חשמל סדרה 31",
        isin: "IL0060002859",
        ticker: "6000285",
        weight: "3.14%",
        sector: "תשתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-10",
        name: "MTF מחקה (00) תל גוב-צמודות 5-10",
        isin: "IL0051354053",
        ticker: "5135405",
        weight: "3.02%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-11",
        name: "תכלית TTF (40) תא 125",
        isin: "IL0051146574",
        ticker: "5114657",
        weight: "2.54%",
        sector: "מניות מדדים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr2-12",
        name: "תכלית TTF שקליות ריבית קבועה 5+",
        isin: "None",
        ticker: "5119375",
        weight: "2.50%",
        sector: "אג\"ח ממשלתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-13",
        name: "מליסרון אגח כא",
        isin: "IL0011946386",
        ticker: "1194638",
        weight: "2.43%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-14",
        name: "פועלים אגח 102",
        isin: "IL0012234527",
        ticker: "1223452",
        weight: "2.26%",
        sector: "פיננסים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-15",
        name: "הראל השקעות אגח א",
        isin: "IL0058501102",
        ticker: "5850110",
        weight: "2.18%",
        sector: "פיננסים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-16",
        name: "אנלייט אנ אגח ד",
        isin: "IL0072002566",
        ticker: "7200256",
        weight: "2.06%",
        sector: "טכנולוגיה / אנרגיה",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-17",
        name: "עזריאלי אגח י",
        isin: "IL0012256892",
        ticker: "1225689",
        weight: "2.03%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-18",
        name: "אלוני חץ אגח יג",
        isin: "IL0011894065",
        ticker: "1189406",
        weight: "2.02%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-19",
        name: "הראל מחקה CoCo בנקים",
        isin: "IL0051300189",
        ticker: "5130018",
        weight: "1.99%",
        sector: "פיננסים",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr2-20",
        name: "רבוע נדלן ט",
        isin: "IL0011745564",
        ticker: "1174556",
        weight: "1.75%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      }
    ]
  },
  {
    name: "תיק 1 (מגוון קרנות סל ואגרות חוב ישראל)",
    description: "תיק השקעות מגוון הכולל קרנות נאמנות וקרנות סל מובילות (SPY, הראל), מניות מובילות (מזרחי, מגה אור) ואגרות חוב ישראל.",
    holdings: [
      {
        id: "usr-1",
        name: "SPY- ספיידר ספ 500",
        isin: "US78462F1030",
        ticker: "SPY",
        weight: "10.34%",
        sector: "מניות מדדים",
        assetClass: "מניות",
        region: "ארה\"ב"
      },
      {
        id: "usr-2",
        name: "הראל iBoxx USD Liquid 5-9 Top 50",
        isin: "IL0051387228",
        ticker: "5138722",
        weight: "6.48%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ארה\"ב"
      },
      {
        id: "usr-3",
        name: "י.ל מניות צמיחה",
        isin: "IL0051195084",
        ticker: "5119508",
        weight: "5.56%",
        sector: "חשיפה למניות",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr-4",
        name: "ילין לפידות אגח חול",
        isin: "IL0051199615",
        ticker: "5119961",
        weight: "5.48%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr-5",
        name: "MTF S&P 500 Bond Mega 30 1-3",
        isin: "IL0051280381",
        ticker: "5128038",
        weight: "4.26%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "ארה\"ב"
      },
      {
        id: "usr-6",
        name: "עו'ש",
        isin: "None",
        ticker: "CASH",
        weight: "3.87%",
        sector: "מזומן ונזילות",
        assetClass: "מזומנים",
        region: "ישראל"
      },
      {
        id: "usr-7",
        name: "י.ל אגח חברות בסיכון גבוה + 10",
        isin: "IL0051088990",
        ticker: "5108899",
        weight: "3.63%",
        sector: "אג\"ח קונצרניות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr-8",
        name: "מגה אור",
        isin: "IL0011044885",
        ticker: "1104488",
        weight: "2.92%",
        sector: "נדל\"ן ובינוי",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr-9",
        name: "מזרחי טפחות",
        isin: "IL0006954379",
        ticker: "695437",
        weight: "2.59%",
        sector: "פיננסים",
        assetClass: "מניות",
        region: "ישראל"
      },
      {
        id: "usr-10",
        name: "ילין לפידות מניות חול",
        isin: "IL0051209778",
        ticker: "5120977",
        weight: "2.46%",
        sector: "חשיפה למניות",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr-11",
        name: "ילין לפידות 10/90 תיק אגח חול ומניות",
        isin: "IL0051201262",
        ticker: "5120126",
        weight: "2.19%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "גלובלי"
      },
      {
        id: "usr-12",
        name: "תכלית S&P 500 Bond Mega 30 Investment Grade 3-5",
        isin: "IL0051369994",
        ticker: "5136999",
        weight: "2.06%",
        sector: "אג\"ח חו\"ל",
        assetClass: "אג'ח",
        region: "ארה\"ב"
      },
      {
        id: "usr-13",
        name: "KTF יורוסטוקס 600 מנוטרל מטח",
        isin: "IL0051229404",
        ticker: "5122940",
        weight: "2.05%",
        sector: "חשיפה למניות",
        assetClass: "מניות",
        region: "גלובלי"
      },
      {
        id: "usr-14",
        name: "מליסרון אגח יט",
        isin: "IL0032303989",
        ticker: "3230398",
        weight: "1.85%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr-15",
        name: "חשמל אגח 31",
        isin: "IL0060002859",
        ticker: "6000285",
        weight: "1.70%",
        sector: "תשתיות",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr-16",
        name: "שטראוס אגח ו",
        isin: "IL0074604211",
        ticker: "7460421",
        weight: "1.49%",
        sector: "תעשייה ומזון",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr-17",
        name: "ביג אגח יג",
        isin: "IL0011595167",
        ticker: "1159516",
        weight: "1.46%",
        sector: "נדל\"ן מסחרי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr-18",
        name: "נתנאל מניב אגח א",
        isin: "IL0012247812",
        ticker: "1224781",
        weight: "1.43%",
        sector: "נדל\"ן ובינוי",
        assetClass: "אג'ח",
        region: "ישראל"
      },
      {
        id: "usr-19",
        name: "פריורטק אגח ב",
        isin: "IL0012239652",
        ticker: "1223965",
        weight: "1.42%",
        sector: "אלקטרוניקה ושבבים",
        assetClass: "אג'ח",
        region: "ישראל"
      }
    ]
  },
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
