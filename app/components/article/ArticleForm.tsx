"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  articleFormSchema,
  ArticleFormValues,
  defaultArticleValues,
} from "../../lib/article-schema";
import { articleService, brokerService, Broker } from "../../services/api";
import SectionWrapper from "../form/SectionWrapper";
import Input from "../form/Input";
import Textarea from "../form/Textarea";
import Select from "../form/Select";
import Checkbox from "../form/Checkbox";
import DynamicListInput from "../form/DynamicListInput";
import MultiSelect from "../form/MultiSelect";
import QuillEditor from "../form/QuillEditor";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ArticleFormProps {
  mode: "create" | "edit";
  articleId?: string;
  initialData?: Partial<ArticleFormValues>;
  onSuccess?: () => void;
}

export default function ArticleForm({
  mode,
  articleId,
  initialData,
  onSuccess,
}: ArticleFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema) as any,
    defaultValues: { ...defaultArticleValues, ...initialData },
  });

  const [brokerOptions, setBrokerOptions] = useState<{ value: string; label: string }[]>([]);

  // Fetch all brokers for the related brokers selector
  useEffect(() => {
    async function fetchBrokers() {
      try {
        const { data } = await brokerService.list({ limit: 500 });
        const raw = data as unknown as Record<string, unknown>;
        const rows: Broker[] = Array.isArray(raw.data)
          ? (raw.data as Broker[])
          : Array.isArray((raw as any).brokers)
          ? ((raw as any).brokers as Broker[])
          : [];
        setBrokerOptions(rows.map((b) => ({ value: b._id, label: b.name })));
      } catch {
        // Non-critical — related brokers selector will be empty
      }
    }
    fetchBrokers();
  }, []);

  const title = watch("title");
  const status = watch("status");
  const schemaEnabled = watch("articleSchema.enabled");
  const excerptValue = watch("excerpt");
  const metaDescValue = watch("seo.metaDescription");

  // Auto-generate slug from title on create
  useEffect(() => {
    if (mode === "create" && title) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [title, mode, setValue]);

  async function onSubmit(values: ArticleFormValues) {
    try {
      // Clean empty strings to null for nullable fields
      const payload = {
        ...values,
        featuredImage: {
          ...values.featuredImage,
          url: values.featuredImage.url || null,
        },
        publishedAt: values.publishedAt || null,
        scheduledAt: values.scheduledAt || null,
        readTimeMinutes:
          values.readTimeMinutes === null || Number.isNaN(values.readTimeMinutes)
            ? null
            : values.readTimeMinutes,
        seo: {
          metaTitle: values.seo.metaTitle || null,
          metaDescription: values.seo.metaDescription || null,
          focusKeyword: values.seo.focusKeyword || null,
          canonicalUrl: values.seo.canonicalUrl || null,
          ogImage: values.seo.ogImage || null,
        },
      };

      if (mode === "create") {
        await articleService.create(payload as any);
        toast.success("Article created successfully!");
      } else {
        await articleService.update(articleId!, payload as any);
        toast.success("Article updated successfully!");
      }
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
  }

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
    { value: "scheduled", label: "Scheduled" },
  ];

  const schemaTypeOptions = [
    { value: "Article", label: "Article" },
    { value: "BlogPosting", label: "Blog Posting" },
    { value: "NewsArticle", label: "News Article" },
    { value: "TechArticle", label: "Tech Article" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ── Content ──────────────────────────────── */}
      <SectionWrapper
        title="Article Content"
        description="Core article title, slug, excerpt, and body."
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title"
            required
            register={register("title")}
            error={errors.title}
            placeholder="e.g. Best Forex Brokers in 2025"
          />
          <Input
            label="Slug"
            required
            register={register("slug")}
            error={errors.slug}
            placeholder="e.g. best-forex-brokers-2025"
          />
        </div>
        <Textarea
          label="Excerpt"
          register={register("excerpt")}
          error={errors.excerpt}
          placeholder="Short summary shown in article cards (max 350 characters)"
          maxChars={350}
          charCount={excerptValue?.length ?? 0}
          rows={3}
        />
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <QuillEditor
              label="Body"
              required
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.body?.message}
              placeholder="Write your article content here..."
            />
          )}
        />
      </SectionWrapper>

      {/* ── Featured Image ───────────────────────── */}
      <SectionWrapper
        title="Featured Image"
        description="Main image displayed at the top of the article."
      >
        <Input
          label="Image URL"
          register={register("featuredImage.url")}
          error={errors.featuredImage?.url}
          placeholder="https://example.com/image.jpg"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Alt Text"
            register={register("featuredImage.alt")}
            error={errors.featuredImage?.alt}
            placeholder="Descriptive alt text for accessibility"
          />
          <Input
            label="Caption"
            register={register("featuredImage.caption")}
            error={errors.featuredImage?.caption}
            placeholder="Image caption (optional)"
          />
        </div>
      </SectionWrapper>

      {/* ── Publishing ───────────────────────────── */}
      <SectionWrapper
        title="Publishing"
        description="Set the article status and scheduling."
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            register={register("status")}
            error={errors.status}
            options={statusOptions}
          />
          <Input
            label="Read Time (minutes)"
            type="number"
            min={1}
            register={register("readTimeMinutes")}
            error={errors.readTimeMinutes as any}
            placeholder="e.g. 5"
          />
        </div>
        {(status === "published" || status === "scheduled") && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Published At"
              type="datetime-local"
              register={register("publishedAt")}
              error={errors.publishedAt as any}
            />
            {status === "scheduled" && (
              <Input
                label="Scheduled At"
                type="datetime-local"
                register={register("scheduledAt")}
                error={errors.scheduledAt as any}
              />
            )}
          </div>
        )}
      </SectionWrapper>

      {/* ── Categorization ───────────────────────── */}
      <SectionWrapper
        title="Categorization"
        description="Categories and tags help with filtering and SEO."
      >
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <DynamicListInput
              label="Categories"
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Type a category and press Enter"
              error={errors.categories?.message}
            />
          )}
        />
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <DynamicListInput
              label="Tags"
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Type a tag and press Enter"
              error={errors.tags?.message}
            />
          )}
        />
      </SectionWrapper>

      {/* ── SEO ──────────────────────────────────── */}
      <SectionWrapper
        title="SEO"
        description="Optimize the article for search engines."
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Meta Title"
            register={register("seo.metaTitle")}
            error={errors.seo?.metaTitle}
            placeholder="SEO title (defaults to article title if blank)"
          />
          <Input
            label="Focus Keyword"
            register={register("seo.focusKeyword")}
            error={errors.seo?.focusKeyword}
            placeholder="e.g. best forex brokers"
          />
        </div>
        <Textarea
          label="Meta Description"
          register={register("seo.metaDescription")}
          error={errors.seo?.metaDescription}
          placeholder="150–160 characters recommended"
          maxChars={160}
          charCount={metaDescValue?.length ?? 0}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Canonical URL"
            register={register("seo.canonicalUrl")}
            error={errors.seo?.canonicalUrl}
            placeholder="https://example.com/canonical-url"
          />
          <Input
            label="OG Image URL"
            register={register("seo.ogImage")}
            error={errors.seo?.ogImage}
            placeholder="https://example.com/og-image.jpg"
          />
        </div>
      </SectionWrapper>

      {/* ── Schema Markup ────────────────────────── */}
      <SectionWrapper
        title="Schema Markup"
        description="JSON-LD structured data for rich search results."
      >
        <Controller
          name="articleSchema.enabled"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Enable Article Schema Markup"
              description="Adds structured data to help search engines understand this article"
              checked={field.value ?? false}
              onChange={field.onChange}
            />
          )}
        />
        {schemaEnabled && (
          <Select
            label="Schema Type"
            register={register("articleSchema.type")}
            error={errors.articleSchema?.type}
            options={schemaTypeOptions}
          />
        )}
      </SectionWrapper>

      {/* ── Related Brokers ──────────────────────── */}
      <SectionWrapper
        title="Related Brokers"
        description="Select brokers to associate with this article."
      >
        <Controller
          name="relatedBrokers"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Related Brokers"
              options={brokerOptions}
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Search and select brokers..."
              error={errors.relatedBrokers?.message}
            />
          )}
        />
        {brokerOptions.length === 0 && (
          <p className="text-[11px] text-gray-400">Loading broker list...</p>
        )}
      </SectionWrapper>

      {/* ── Actions ──────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-amber-brand text-black text-sm font-bold rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create Article"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
