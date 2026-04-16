"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// Sidebar and TopBar are provided by layout
import { brokerService, Broker } from "../services/api";

export default function BrokersPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const fetchBrokers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await brokerService.list({
        page,
        limit: 10,
        search: search || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      console.log("Brokers API response:", data);

      // Backend returns { success, data: [...brokers], pagination: { totalPages, total } }
      const raw = data as unknown as Record<string, unknown>;

      const rows: Broker[] = (
        Array.isArray(raw.data)
          ? raw.data
          : (raw.data as Record<string, unknown>)?.brokers ?? raw.brokers ?? []
      ) as Broker[];

      const pagination = (raw.pagination ?? (raw.data as Record<string, unknown>)?.pagination) as
        | { pages?: number; totalPages?: number; total?: number }
        | undefined;

      if (raw.success) {
        let filtered = rows;
        if (filterActive === "active") filtered = rows.filter((b) => b.isActive);
        if (filterActive === "inactive") filtered = rows.filter((b) => !b.isActive);
        setBrokers(filtered);
        setTotalPages(pagination?.totalPages ?? pagination?.pages ?? 1);
        setTotal(pagination?.total ?? rows.length);
      } else {
        setError("Failed to load brokers.");
      }
    } catch (err: unknown) {
      console.error("Brokers fetch error:", err);
      setError("Could not connect to the server.");
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterActive]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleActive = async (broker: Broker) => {
    setTogglingId(broker._id);
    try {
      await brokerService.update(broker._id, { isActive: !broker.isActive } as Record<string, unknown>);
      fetchBrokers();
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (broker: Broker) => {
    setTogglingId(broker._id);
    try {
      await brokerService.update(broker._id, { isFeatured: !broker.isFeatured });
      fetchBrokers();
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (broker: Broker) => {
    if (!confirm(`Delete "${broker.name}"? This action cannot be undone.`)) return;
    setDeletingId(broker._id);
    try {
      await brokerService.delete(broker._id);
      fetchBrokers();
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="flex flex-col flex-1 ml-[220px] min-w-0">
      <div className="px-6 py-6 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">All Brokers</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? "Loading..." : `${total} broker${total !== 1 ? "s" : ""} total`}
              </p>
            </div>
            <button
              onClick={() => router.push("/brokers/new")}
              className="flex items-center gap-2 px-4 py-2 bg-amber-brand text-white text-xs font-bold uppercase rounded hover:opacity-90 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add New Broker
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search brokers..."
                  className="pl-8 pr-3 py-2 border border-border-light rounded-md text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-brand w-52"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  className="px-3 py-2 border border-border-light text-xs text-gray-500 rounded hover:bg-gray-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Status filter */}
            <div className="flex items-center gap-1 border border-border-light rounded-md overflow-hidden text-xs">
              {(["all", "active", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilterActive(f); setPage(1); }}
                  className={`px-3 py-2 font-semibold capitalize transition-colors ${
                    filterActive === f
                      ? "bg-black text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchBrokers} className="font-semibold underline hover:no-underline">Retry</button>
            </div>
          )}
          <div className="bg-white border border-border-light rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-border-light">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Broker</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Regulation</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Featured</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Added</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border-light">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="animate-pulse bg-gray-200 rounded h-4 w-full max-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : brokers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-400 font-medium">No brokers found</p>
                        <button
                          onClick={() => router.push("/brokers/new")}
                          className="text-amber-brand font-semibold hover:underline text-xs"
                        >
                          Add your first broker
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  brokers.map((broker) => (
                    <tr
                      key={broker._id}
                      className="border-b border-border-light last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      {/* Broker name + slug */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-black">{broker.name}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">{broker.slug}</div>
                      </td>

                      {/* Regulation */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {broker.regulatoryBodies && broker.regulatoryBodies.length > 0 ? (
                            broker.regulatoryBodies.slice(0, 2).map((r) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                          {broker.regulatoryBodies && broker.regulatoryBodies.length > 2 && (
                            <span className="text-[10px] text-gray-400">
                              +{broker.regulatoryBodies.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active status toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(broker)}
                          disabled={togglingId === broker._id}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            broker.isActive
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {togglingId === broker._id ? "..." : broker.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(broker)}
                          disabled={togglingId === broker._id}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            broker.isFeatured
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {broker.isFeatured ? "★ Featured" : "☆ Normal"}
                        </button>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3">
                        {broker.ratingAverage != null && broker.ratingAverage > 0 ? (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-amber-brand" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-semibold text-black">{broker.ratingAverage.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-500">{formatDate(broker.createdAt)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => router.push(`/brokers/${broker.slug}`)}
                            className="p-1.5 border border-border-light text-blue-500 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => router.push(`/brokers/${broker.slug}/edit`)}
                            className="p-1.5 border border-border-light text-gray-600 rounded hover:bg-gray-100 transition-colors"
                            title="Edit Broker"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(broker)}
                            disabled={deletingId === broker._id}
                            className="p-1.5 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Delete Broker"
                          >
                            {deletingId === broker._id ? (
                              <span className="w-3.5 h-3.5 block border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-border-light rounded text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                        p === page
                          ? "bg-black text-white"
                          : "border border-border-light text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-border-light rounded text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    
  );
}
