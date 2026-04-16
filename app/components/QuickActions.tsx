"use client";

import { useRouter } from "next/navigation";

export default function QuickActions() {
  return null;
}

export function QuickActionsPanel() {
  const router = useRouter();

  return (
    <div>
      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-black mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <button
            onClick={() => router.push("/brokers/new")}
            className="w-full py-2 px-4 border-2 border-black text-black text-xs font-bold uppercase rounded hover:bg-gray-100 transition-colors"
          >
            Add New Broker
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 border-2 border-black text-black text-xs font-bold uppercase rounded hover:bg-gray-100 transition-colors"
          >
            Create New Article
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 bg-amber-brand text-white text-xs font-bold uppercase rounded hover:opacity-90 transition-colors"
          >
            Moderate Reviews
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-black mb-3">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-black font-medium">Log log update</p>
              <p className="text-[10px] text-gray-400">occurred 3 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-xs text-black font-medium">Create new article</p>
              <p className="text-[10px] text-gray-400">occurred 3 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <div>
              <p className="text-xs text-black font-medium">Moderate reviews</p>
              <p className="text-[10px] text-gray-400">(selected in MongoDB, Node.js)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
