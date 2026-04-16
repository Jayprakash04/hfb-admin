"use client";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StatCards from "./components/StatCards";
import BrokerTable from "./components/BrokerTable";
import { QuickActionsPanel } from "./components/QuickActions";
import PendingReviews from "./components/PendingReviews";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-1 ml-[220px]">
          <div className="flex flex-col flex-1 min-w-0">
            <TopBar />
            <StatCards />

            {/* Table + Quick Actions row */}
            <div className="flex gap-6 px-6 pb-4">
              <div className="flex-1 min-w-0">
                <BrokerTable />
              </div>
              <div className="w-[240px] flex-shrink-0">
                <QuickActionsPanel />
              </div>
            </div>

            <Footer />
          </div>

          {/* Right Panel */}
          {/* <PendingReviews /> */}
        </div>
      </div>
    </ProtectedRoute>
  );
}
