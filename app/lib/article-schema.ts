import { z } from "zod";

export const articleFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters and hyphens only"),
  excerpt: z.string().max(350, "Excerpt must be at most 350 characters").default(""),
  body: z.string().min(1, "Body is required"),
  relatedBrokers: z.array(z.string()).default([]),
  featuredImage: z
    .object({
      url: z.string().nullable().default(null),
      alt: z.string().default(""),
      caption: z.string().default(""),
    })
    .default({ url: null, alt: "", caption: "" }),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived", "scheduled"]).default("draft"),
  publishedAt: z.string().nullable().default(null),
  scheduledAt: z.string().nullable().default(null),
  seo: z
    .object({
      metaTitle: z.string().nullable().default(null),
      metaDescription: z.string().nullable().default(null),
      focusKeyword: z.string().nullable().default(null),
      canonicalUrl: z.string().nullable().default(null),
      ogImage: z.string().nullable().default(null),
    })
    .default({
      metaTitle: null,
      metaDescription: null,
      focusKeyword: null,
      canonicalUrl: null,
      ogImage: null,
    }),
  articleSchema: z
    .object({
      enabled: z.boolean().default(false),
      type: z
        .enum(["Article", "BlogPosting", "NewsArticle", "TechArticle"])
        .default("Article"),
    })
    .default({ enabled: false, type: "Article" }),
  readTimeMinutes: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    },
    z.number().nullable().default(null)
  ),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export const defaultArticleValues: ArticleFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  relatedBrokers: [],
  featuredImage: { url: null, alt: "", caption: "" },
  categories: [],
  tags: [],
  status: "draft",
  publishedAt: null,
  scheduledAt: null,
  seo: {
    metaTitle: null,
    metaDescription: null,
    focusKeyword: null,
    canonicalUrl: null,
    ogImage: null,
  },
  articleSchema: { enabled: false, type: "Article" },
  readTimeMinutes: null,
};
