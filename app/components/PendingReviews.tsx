"use client";

import { useEffect, useState } from "react";
import { reviewService, Review } from "../services/api";

export default function PendingReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await reviewService.list({ status: "pending", limit: 10 });
      // Backend returns { success, data: { reviews } } or flat { success, reviews }
      const payload = (data as unknown as { data?: typeof data }).data ?? data;
      if (data.success) {
        setReviews(payload.reviews ?? []);
      }
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    try {
      await reviewService.moderate(id, { status });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      // silent fail
    }
  };

  return (
    <aside className="w-[300px] bg-white border-l border-border-light flex flex-col flex-shrink-0">
      <div className="px-4 py-4 border-b border-border-light">
        <h2 className="text-sm font-bold uppercase tracking-wide text-black">Pending Reviews Queue</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="bg-gray-200 rounded h-3 w-20" />
                <div className="bg-gray-200 rounded h-3 w-full" />
                <div className="bg-gray-200 rounded h-3 w-16" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400 mt-8">
            No pending reviews
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border-light bg-gray-50">
                <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-2 py-2 font-semibold text-gray-500 uppercase">Rating</th>
                <th className="text-left px-2 py-2 font-semibold text-gray-500 uppercase">Snippet</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b border-border-light hover:bg-gray-50">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="font-medium">{review.author?.name || "Anonymous"}</span>
                  </td>
                  <td className="px-2 py-2.5 font-bold">{review.ratings.overall}</td>
                  <td className="px-2 py-2.5">
                    <p className="line-clamp-2 leading-tight">{review.title}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleModerate(review._id, "approved")}
                        className="text-[10px] font-semibold text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerate(review._id, "rejected")}
                        className="text-[10px] font-semibold text-red-500 hover:underline"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </aside>
  );
}
