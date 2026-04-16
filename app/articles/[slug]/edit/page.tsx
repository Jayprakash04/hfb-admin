"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// Sidebar and TopBar moved to shared layout
import ArticleForm from "../../../components/article/ArticleForm";
import { ArticleFormValues, defaultArticleValues } from "../../../lib/article-schema";
import { articleService, Article } from "../../../services/api";

export default function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
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
    if (slug) fetchArticle();
  }, [slug]);

  // Merge fetched article with defaults to ensure all array/object fields are initialized
  function buildInitialData(a: Article): Partial<ArticleFormValues> {
    // relatedBrokers may come back as ObjectId strings or populated {_id, name} objects
    const relatedBrokers = ((a as any).relatedBrokers ?? []).map(
      (b: any) => (typeof b === "string" ? b : b._id ?? b)
    );
    return {
      ...defaultArticleValues,
      ...(a as unknown as Partial<ArticleFormValues>),
      categories: (a as any).categories ?? [],
      tags: (a as any).tags ?? [],
      relatedBrokers,
      featuredImage: {
        ...defaultArticleValues.featuredImage,
        ...(a as any).featuredImage,
      },
      seo: {
        ...defaultArticleValues.seo,
        ...(a as any).seo,
      },
      articleSchema: {
        ...defaultArticleValues.articleSchema,
        ...(a as any).articleSchema,
      },
    };
  }

  return (
    <div className="flex flex-col flex-1 ml-55 min-w-0">
      <div className="px-6 py-6 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-black">
                {loading ? "Loading..." : article ? `Edit: ${article.title}` : "Edit Article"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">Update article details below.</p>
            </div>
            <button
              onClick={() => router.push("/articles")}
              className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              ← Back to Articles
            </button>
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
            <ArticleForm
              mode="edit"
              articleId={article._id}
              initialData={buildInitialData(article)}
              onSuccess={() => router.push("/articles")}
            />
          )}
        </div>
      </div>
    
  );
}
