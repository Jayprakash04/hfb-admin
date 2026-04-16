"use client";

import { useEffect, useState, useCallback } from "react";
import { brokerService, Broker } from "../services/api";

export default function BrokerTable() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBrokers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await brokerService.list({
        page,
        limit: 6,
        sortBy: "ratingAverage",
        sortOrder: "desc",
      });
      // Backend returns { success, data: [...brokers], pagination: { totalPages } }
      const raw = data as unknown as Record<string, unknown>;
      const rows: Broker[] = (Array.isArray(raw.data) ? raw.data : []) as Broker[];
      const pag = raw.pagination as { totalPages?: number; pages?: number } | undefined;
      if (raw.success) {
        setBrokers(rows);
        setTotalPages(pag?.totalPages ?? pag?.pages ?? 1);
      }
    } catch {
      // keep empty state
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const handleDeactivate = async (id: string, isActive: boolean) => {
    try {
      await brokerService.update(id, { isFeatured: !isActive } as Record<string, unknown>);
      fetchBrokers();
    } catch {
      // silent fail
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pb-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-black mb-3">
        Broker Management Overview
      </h2>
      <div className="border border-border-light rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-border-light">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase">Broker Name</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase">Status</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase">Last Update</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase">Rating</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase">Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-4 py-2.5"><div className="animate-pulse bg-gray-200 rounded h-4 w-24" /></td>
                  <td className="px-4 py-2.5"><div className="animate-pulse bg-gray-200 rounded h-4 w-14" /></td>
                  <td className="px-4 py-2.5"><div className="animate-pulse bg-gray-200 rounded h-4 w-20" /></td>
                  <td className="px-4 py-2.5"><div className="animate-pulse bg-gray-200 rounded h-4 w-8" /></td>
                  <td className="px-4 py-2.5"><div className="animate-pulse bg-gray-200 rounded h-4 w-28" /></td>
                </tr>
              ))
            ) : brokers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No brokers found. Add your first broker to get started.
                </td>
              </tr>
            ) : (
              brokers.map((broker) => (
                <tr key={broker._id} className="border-b border-border-light last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-black font-medium">{broker.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={broker.isActive ? "text-green-600" : "text-gray-400"}>
                      {broker.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{formatDate(broker.updatedAt)}</td>
                  <td className="px-4 py-2.5 text-black">
                    {broker.ratingAverage ? broker.ratingAverage.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-bold text-black hover:underline cursor-pointer">Edit</span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <button
                      onClick={() => handleDeactivate(broker._id, broker.isActive)}
                      className="font-bold text-black hover:underline cursor-pointer"
                    >
                      {broker.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1 border border-border-light rounded hover:bg-gray-50 text-gray-500 disabled:opacity-40"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded font-semibold ${
              p === page ? "bg-amber-brand text-white" : "border border-border-light text-gray-500 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-border-light rounded hover:bg-gray-50 text-gray-500 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
