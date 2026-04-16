import { z } from "zod";

export const brokerFormSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Broker name is required").max(100),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  logo: z.string().default(""),
  shortDescription: z.string().max(300, "Max 300 characters").default(""),
  fullDescription: z.string().default(""),

  // Regulation
  regulatoryBodies: z.array(z.string()).default([]),
  licenseNumbers: z.array(z.string()).default([]),
  isRegulated: z.boolean().default(false),

  // Company Info
  foundedYear: z.number().min(1900).max(2030).optional(),
  headquartersCountry: z.string().default(""),

  // Status
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // Trading Conditions
  tradingConditions: z.object({
    minDeposit: z.number().min(0).default(0),
    maxLeverage: z.string().default("1:100"),
    spreadFrom: z.number().min(0).default(0),
    commissionPerLot: z.number().min(0).default(0),
    accountTypes: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default([]),
    baseCurrencies: z.array(z.string()).default([]),
    instruments: z.array(z.string()).default([]),
    hasIslamicAccount: z.boolean().default(false),
    hasDemoAccount: z.boolean().default(false),
  }).default({
    minDeposit: 0,
    maxLeverage: "1:100",
    spreadFrom: 0,
    commissionPerLot: 0,
    accountTypes: [],
    platforms: [],
    baseCurrencies: [],
    instruments: [],
    hasIslamicAccount: false,
    hasDemoAccount: false,
  }),

  // Pros & Cons
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),

  // Contact
  contact: z.object({
    website: z.string().url("Invalid URL").or(z.literal("")).default(""),
    email: z.string().email("Invalid email").or(z.literal("")).default(""),
    phone: z.string().default(""),
    liveChatUrl: z.string().url("Invalid URL").or(z.literal("")).default(""),
    twitter: z.string().url("Invalid URL").or(z.literal("")).default(""),
    facebook: z.string().url("Invalid URL").or(z.literal("")).default(""),
    linkedin: z.string().url("Invalid URL").or(z.literal("")).default(""),
  }).default({
    website: "",
    email: "",
    phone: "",
    liveChatUrl: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  }),

  // Ratings
  ratingAverage: z.number().min(0).max(5).default(0),
  ratingCount: z.number().min(0).default(0),

  // Affiliate
  affiliateUrl: z.string().url("Invalid URL").or(z.literal("")).default(""),
  affiliateCpaValue: z.number().min(0).default(0),

  // SEO
  seo: z.object({
    metaTitle: z.string().default(""),
    metaDescription: z.string().default(""),
    metaKeywords: z.array(z.string()).default([]),
  }).default({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
  }),

  // Tags
  tags: z.array(z.string()).default([]),
});

export type BrokerFormValues = z.infer<typeof brokerFormSchema>;

export const defaultBrokerValues: BrokerFormValues = {
  name: "",
  slug: "",
  logo: "",
  shortDescription: "",
  fullDescription: "",
  regulatoryBodies: [],
  licenseNumbers: [],
  isRegulated: false,
  foundedYear: undefined,
  headquartersCountry: "",
  isFeatured: false,
  isActive: true,
  tradingConditions: {
    minDeposit: 0,
    maxLeverage: "1:100",
    spreadFrom: 0,
    commissionPerLot: 0,
    accountTypes: [],
    platforms: [],
    baseCurrencies: [],
    instruments: [],
    hasIslamicAccount: false,
    hasDemoAccount: false,
  },
  pros: [],
  cons: [],
  contact: {
    website: "",
    email: "",
    phone: "",
    liveChatUrl: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  },
  ratingAverage: 0,
  ratingCount: 0,
  affiliateUrl: "",
  affiliateCpaValue: 0,
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
  },
  tags: [],
};
