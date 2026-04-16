"use client";

import StatCards from "./components/StatCards";
import BrokerTable from "./components/BrokerTable";
import { QuickActionsPanel } from "./components/QuickActions";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 ml-55">
        <div className="flex flex-col flex-1 min-w-0">
          <StatCards />

          <div className="flex gap-6 px-6 pb-4">
            <div className="flex-1 min-w-0">
              <BrokerTable />
            </div>
            <div className="w-60 shrink-0">
              <QuickActionsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
