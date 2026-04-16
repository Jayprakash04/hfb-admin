export const RegulationEnum = [
  "FCA",
  "CySEC",
  "ASIC",
  "BaFin",
  "FINMA",
  "FSA",
  "DFSA",
  "CFTC",
  "NFA",
  "MAS",
  "FSC",
  "FSCA",
  "CMA",
  "JFSA",
  "SFC",
  "SEBI",
  "CBR",
  "FMA",
  "MFSA",
  "CNMV",
  "AMF",
  "CONSOB",
  "SCB",
  "VFSC",
  "IFSC",
  "Other",
] as const;

export const ArticleStatusEnum = [
  "draft",
  "published",
  "archived",
  "scheduled",
] as const;

export const ArticleSchemaTypeEnum = [
  "Article",
  "BlogPosting",
  "NewsArticle",
  "TechArticle",
] as const;

export const AccountTypeEnum = [
  "Standard",
  "Micro",
  "Mini",
  "ECN",
  "STP",
  "Raw Spread",
  "Zero Spread",
  "VIP",
  "Islamic",
  "Demo",
  "Cent",
  "Pro",
] as const;

export const PlatformEnum = [
  "MT4",
  "MT5",
  "cTrader",
  "TradingView",
  "Proprietary",
  "WebTrader",
  "Mobile App",
  "NinjaTrader",
  "ZuluTrade",
  "DXtrade",
] as const;

export const LeadStatusEnum = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
  "spam",
] as const;

export const DeviceTypeEnum = [
  "desktop",
  "mobile",
  "tablet",
  "unknown",
] as const;

export const PageTypeEnum = [
  "broker_review",
  "comparison",
  "top_list",
  "article",
  "homepage",
  "other",
] as const;
