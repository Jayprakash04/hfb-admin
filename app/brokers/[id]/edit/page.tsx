"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import TopBar from "../../../components/TopBar";
import BrokerForm from "../../../components/broker/BrokerForm";
import { BrokerFormValues, defaultBrokerValues } from "../../../lib/broker-schema";
import { brokerService, Broker } from "../../../services/api";

export default function EditBrokerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBroker() {
      try {
        const { data } = await brokerService.getBySlug(id);
        const raw = data as unknown as Record<string, unknown>;
        // Handle: { success, data: {...} } or { success, data: [{...}] } or { success, broker: {...} }
        let b: Broker | null = null;
        if (Array.isArray(raw.data)) {
          b = (raw.data[0] as Broker) ?? null;
        } else if (raw.data && typeof raw.data === "object") {
          b = raw.data as Broker;
        } else if (raw.broker) {
          b = raw.broker as Broker;
        }
        setBroker(b);
        if (!b) setError("Broker not found.");
      } catch {
        setError("Broker not found.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBroker();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-[220px] min-w-0">
        <TopBar />
        <div className="px-6 py-6 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-black">
                {loading ? "Loading..." : broker ? `Edit: ${broker.name}` : "Edit Broker"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">Update broker details below.</p>
            </div>
            <button
              onClick={() => router.push("/brokers")}
              className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              ← Back to Brokers
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

          {!loading && broker && (
            <BrokerForm
              mode="edit"
              brokerId={id}
              initialData={{
                ...defaultBrokerValues,
                ...(broker as unknown as Partial<BrokerFormValues>),
                pros: (broker as any).pros ?? [],
                cons: (broker as any).cons ?? [],
                regulatoryBodies: (broker as any).regulatoryBodies ?? [],
                licenseNumbers: (broker as any).licenseNumbers ?? [],
                tags: (broker as any).tags ?? [],
                tradingConditions: {
                  ...defaultBrokerValues.tradingConditions,
                  ...(broker as any).tradingConditions,
                  accountTypes: (broker as any).tradingConditions?.accountTypes ?? [],
                  platforms: (broker as any).tradingConditions?.platforms ?? [],
                  baseCurrencies: (broker as any).tradingConditions?.baseCurrencies ?? [],
                  instruments: (broker as any).tradingConditions?.instruments ?? [],
                },
                contact: {
                  ...defaultBrokerValues.contact,
                  ...(broker as any).contact,
                },
                seo: {
                  ...defaultBrokerValues.seo,
                  ...(broker as any).seo,
                  metaKeywords: (broker as any).seo?.metaKeywords ?? [],
                },
              }}
              onSuccess={() => router.push("/brokers")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
