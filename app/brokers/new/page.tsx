"use client";

import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import BrokerForm from "../../components/broker/BrokerForm";
import { useRouter } from "next/navigation";

export default function NewBrokerPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-[220px] min-w-0">
        <TopBar />
        <div className="px-6 py-6 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-black">Add New Broker</h1>
              <p className="text-xs text-gray-500 mt-1">
                Fill in the details below to add a new broker to the platform.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          <BrokerForm
            mode="create"
            onSuccess={() => router.push("/")}
          />
        </div>
      </div>
    </div>
  );
}
