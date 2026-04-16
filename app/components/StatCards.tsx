"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/api";

interface Stats {
  activeBrokers: number;
  pendingReviews: number;
  articlesPublished: number;
  dataUpdatesToday: number;
}

export default function StatCards() {
  const [stats, setStats] = useState<Stats>({
    activeBrokers: 0,
    pendingReviews: 0,
    articlesPublished: 0,
    dataUpdatesToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await adminService.getDashboard();
        // Backend returns { success, data: { stats } } or flat { success, stats }
        const payload = (data as unknown as { data?: typeof data }).data ?? data;
        const statsData = payload.stats ?? payload;
        if (data.success) {
          setStats({
            activeBrokers: (statsData as typeof statsData & Record<string, number>).activeBrokers ?? 0,
            pendingReviews: (statsData as typeof statsData & Record<string, number>).pendingReviews ?? 0,
            articlesPublished: (statsData as typeof statsData & Record<string, number>).articlesPublished ?? 0,
            dataUpdatesToday: (statsData as typeof statsData & Record<string, number>).dataUpdatesToday ?? 0,
          });
        }
      } catch {
        // fallback to zeros if API unavailable
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const shimmer = loading ? "animate-pulse bg-gray-200 rounded h-7 w-12" : "";

  return (
    <div className="grid grid-cols-4 gap-4 px-6 py-5">
      {/* Active Brokers */}
      <div className="bg-white border border-border-light rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Active Brokers</p>
            {loading ? <div className={shimmer} /> : (
              <p className="text-2xl font-bold text-black mt-1">{stats.activeBrokers}</p>
            )}
          </div>
          <div className="text-green-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-amber-brand rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/80 uppercase font-semibold">Pending Reviews</p>
            {loading ? <div className="animate-pulse bg-white/30 rounded h-7 w-12" /> : (
              <p className="text-2xl font-bold text-white mt-1">{stats.pendingReviews}</p>
            )}
          </div>
          <div className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Articles Published */}
      <div className="bg-white border border-border-light rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Articles Published</p>
            {loading ? <div className={shimmer} /> : (
              <p className="text-2xl font-bold text-black mt-1">{stats.articlesPublished}</p>
            )}
          </div>
          <div className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Data Updates Today */}
      <div className="bg-white border border-border-light rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Data Updates Today</p>
            {loading ? <div className={shimmer} /> : (
              <p className="text-2xl font-bold text-black mt-1">{stats.dataUpdatesToday}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">(Spreads/Fees)</p>
          </div>
          <div className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
