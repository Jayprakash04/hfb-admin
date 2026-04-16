"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// Sidebar and TopBar moved to shared layout
import { articleService, Article } from "../../services/api";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
  scheduled: "bg-blue-100 text-blue-700",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  scheduled: "Scheduled",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-black">{String(value)}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-4">
      <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 pb-2 border-b border-[#E5E7EB]">
        {title}
      </h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await articleService.getBySlug(slug);
        const raw = data as unknown as Record<string, unknown>;
        let a: Article | null = null;
        if (Array.isArray(raw.data)) {
          a = (raw.data[0] as Article) ?? null;
        } else if (raw.data && typeof raw.data === "object") {
          a = raw.data as Article;
        } else if ((raw as any).article) {
          a = (raw as any).article as Article;
        }
        setArticle(a);
        if (!a) setError("Article not found.");
      } catch {
        setError("Article not found.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetch();
  }, [slug]);

  return (
    <div className="flex flex-col flex-1 ml-55 min-w-0">
      <div className="px-6 py-6 flex-1">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              {loading ? (
                <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
              ) : article ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-black">{article.title}</h1>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        STATUS_COLOR[article.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABEL[article.status] ?? article.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{article.slug}</p>
                </>
              ) : (
                <h1 className="text-xl font-bold text-black">Article</h1>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => router.push("/articles")}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                ← Back
              </button>
              {article && (
                <button
                  onClick={() => router.push(`/articles/${article.slug}/edit`)}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-brand text-black rounded hover:bg-yellow-500 transition-colors"
                >
                  Edit Article
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && article && (
            <div className="grid grid-cols-3 gap-4">
              {/* Main column */}
              <div className="col-span-2 space-y-4">
                {/* Featured image */}
                {article.featuredImage?.url && (
                  <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                    <img
                      src={article.featuredImage.url}
                      alt={article.featuredImage.alt || article.title}
                      className="w-full h-56 object-cover"
                    />
                    {article.featuredImage.caption && (
                      <p className="text-[11px] text-gray-400 px-4 py-2 text-center italic">
                        {article.featuredImage.caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Excerpt */}
                {article.excerpt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 italic">{article.excerpt}</p>
                  </div>
                )}

                {/* Body */}
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 pb-2 border-b border-[#E5E7EB]">
                    Body
                  </h3>
                  <div
                    className="article-body prose prose-sm max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: article.body }}
                  />
                </div>

                {/* SEO */}
                {article.seo && (
                  <Card title="SEO">
                    <Field label="Meta Title" value={article.seo.metaTitle} />
                    <Field label="Meta Description" value={article.seo.metaDescription} />
                    <Field label="Focus Keyword" value={article.seo.focusKeyword} />
                    <Field label="Canonical URL" value={article.seo.canonicalUrl} />
                    <Field label="OG Image" value={article.seo.ogImage} />
                  </Card>
                )}
              </div>

              {/* Sidebar column */}
              <div className="space-y-4">
                {/* Meta */}
                <Card title="Meta">
                  <Field label="Author" value={article.author?.name} />
                  <Field label="Views" value={article.views} />
                  <Field label="Read Time" value={article.readTimeMinutes ? `${article.readTimeMinutes} min` : undefined} />
                  <Field
                    label="Published At"
                    value={
                      article.publishedAt
                        ? new Date(article.publishedAt).toLocaleString("en-GB")
                        : undefined
                    }
                  />
                  <Field
                    label="Scheduled At"
                    value={
                      article.scheduledAt
                        ? new Date(article.scheduledAt).toLocaleString("en-GB")
                        : undefined
                    }
                  />
                  <Field
                    label="Created"
                    value={new Date(article.createdAt).toLocaleString("en-GB")}
                  />
                  <Field
                    label="Updated"
                    value={new Date(article.updatedAt).toLocaleString("en-GB")}
                  />
                </Card>

                {/* Categories & Tags */}
                {((article.categories?.length ?? 0) > 0 ||
                  (article.tags?.length ?? 0) > 0) && (
                  <Card title="Categorization">
                    {(article.categories?.length ?? 0) > 0 && (
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-gray-400 mb-1.5">
                          Categories
                        </dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {article.categories!.map((c) => (
                            <span
                              key={c}
                              className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-medium rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                    {(article.tags?.length ?? 0) > 0 && (
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-gray-400 mb-1.5">
                          Tags
                        </dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {article.tags!.map((t) => (
                            <span
                              key={t}
                              className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </Card>
                )}

                {/* Schema Markup */}
                {article.articleSchema?.enabled && (
                  <Card title="Schema Markup">
                    <Field label="Type" value={article.articleSchema.type} />
                  </Card>
                )}

                {/* Related Brokers */}
                {(article.relatedBrokers?.length ?? 0) > 0 && (
                  <Card title="Related Brokers">
                    <dd className="flex flex-wrap gap-1.5">
                      {(article.relatedBrokers as any[]).map((b) => {
                        const id = typeof b === "string" ? b : b._id ?? String(b);
                        const name = typeof b === "string" ? b : (b.name ?? b.slug ?? id);
                        return (
                          <span
                            key={id}
                            className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </dd>
                  </Card>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
