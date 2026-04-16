"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
// Sidebar and TopBar moved to shared layout
import { articleService, Article } from "../services/api";

const STATUS_FILTERS = ["All", "draft", "published", "archived", "scheduled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
  scheduled: "Scheduled",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
  scheduled: "bg-blue-100 text-blue-700",
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const LIMIT = 12;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await articleService.list({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
      });
      const raw = data as unknown as Record<string, unknown>;
      const rows: Article[] = Array.isArray(raw.data)
        ? (raw.data as Article[])
        : Array.isArray((raw as any).articles)
        ? ((raw as any).articles as Article[])
        : [];
      const pagination = (raw.pagination ?? (raw as any).meta) as
        | { totalPages?: number; pages?: number; total?: number }
        | undefined;
      setArticles(rows);
      setTotalPages(pagination?.totalPages ?? pagination?.pages ?? 1);
      setTotal(pagination?.total ?? rows.length);
    } catch {
      toast.error("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  async function handleDelete(id: string) {
    try {
      await articleService.delete(id);
      toast.success("Article deleted.");
      setDeleteId(null);
      fetchArticles();
    } catch {
      toast.error("Failed to delete article.");
    }
  }

  return (
    <div className="flex flex-col flex-1 ml-55 min-w-0">
      <div className="px-6 py-6 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">Articles</h1>
              <p className="text-xs text-gray-500 mt-1">
                {total} article{total !== 1 ? "s" : ""} total
              </p>
            </div>
            <Link
              href="/articles/new"
              className="px-4 py-2 bg-amber-brand text-black text-xs font-bold rounded-md hover:bg-yellow-500 transition-colors"
            >
              + New Article
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent w-64"
            />
            <div className="flex gap-1">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-amber-brand text-black"
                      : "bg-white border border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s === "All" ? "All" : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : articles.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-400">
                No articles found.{" "}
                <Link href="/articles/new" className="text-amber-brand underline">
                  Create one
                </Link>
                .
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                      Views
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-500">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {articles.map((article) => (
                    <tr key={article._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-black text-sm leading-tight">
                          {article.title}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{article.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            STATUS_COLOR[article.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABEL[article.status] ?? article.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {article.author?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {article.views?.toLocaleString() ?? "0"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/articles/${article.slug}`)}
                            title="View"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            onClick={() => router.push(`/articles/${article.slug}/edit`)}
                            title="Edit"
                            className="p-1.5 rounded hover:bg-yellow-100 text-gray-500 hover:text-yellow-700 transition-colors"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => setDeleteId(article._id)}
                            title="Delete"
                            className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                          page === item
                            ? "bg-amber-brand text-black border-amber-brand"
                            : "border-[#E5E7EB] hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-bold text-black mb-2">Delete Article?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. The article will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
