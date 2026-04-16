"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { brokerService, Broker } from "../../services/api";

export default function BrokerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBroker() {
      try {
      // fetch by slug
        const { data } = await brokerService.getBySlug(id);
        const raw = data as unknown as Record<string, unknown>;
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
        setError("Could not load broker.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBroker();
  }, [id]);

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return d; }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-[220px] min-w-0">
        <TopBar />
        <div className="px-6 py-6 flex-1">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">
                {loading ? "Loading..." : broker?.name ?? "Broker Details"}
              </h1>
              {broker && (
                <p className="text-xs text-gray-400 mt-0.5">
                  slug: <span className="font-mono">{broker.slug}</span> · ID: <span className="font-mono">{broker._id}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/brokers")}
                className="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              >
                ← Back
              </button>
              {broker && (
                <button
                  onClick={() => router.push(`/brokers/${broker.slug}/edit`)}
                  className="px-3 py-2 text-xs font-bold text-white bg-amber-brand rounded hover:opacity-90 transition-opacity"
                >
                  Edit Broker
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {!loading && broker && (
            <div className="space-y-5">

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${broker.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {broker.isActive ? "● Active" : "○ Inactive"}
                </span>
                {broker.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">★ Featured</span>
                )}
                {broker.isRegulated ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">✓ Regulated</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Unregulated</span>
                )}
              </div>

              {/* Main 2-column grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left: 2/3 */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Basic Info */}
                  <Card title="Basic Information">
                    <Row label="Name" value={broker.name} />
                    <Row label="Slug" value={broker.slug} mono />
                    <Row label="Short Description" value={broker.shortDescription} />
                    <Row label="Full Description" value={(broker as unknown as Record<string, unknown>).fullDescription as string} multiline />
                    {broker.logo && (
                      <div className="flex gap-3 py-2 border-b border-gray-50">
                        <span className="text-xs text-gray-400 w-36 shrink-0">Logo</span>
                        <img src={broker.logo} alt="logo" className="h-8 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                      </div>
                    )}
                  </Card>

                  {/* Trading Conditions */}
                  {broker.tradingConditions && (
                    <Card title="Trading Conditions">
                      <Row label="Min Deposit" value={broker.tradingConditions.minDeposit != null ? `$${broker.tradingConditions.minDeposit}` : undefined} />
                      <Row label="Max Leverage" value={broker.tradingConditions.maxLeverage} />
                      <Row label="Spread From" value={broker.tradingConditions.spreadFrom != null ? `${broker.tradingConditions.spreadFrom} pips` : undefined} />
                      <Row label="Commission/Lot" value={broker.tradingConditions.commissionPerLot != null ? `$${broker.tradingConditions.commissionPerLot}` : undefined} />
                      <TagRow label="Platforms" values={broker.tradingConditions.platforms} color="purple" />
                      <TagRow label="Account Types" values={(broker.tradingConditions as unknown as Record<string, unknown>).accountTypes as string[]} color="blue" />
                      <TagRow label="Base Currencies" values={broker.tradingConditions.baseCurrencies} color="gray" />
                      <TagRow label="Instruments" values={(broker.tradingConditions as unknown as Record<string, unknown>).instruments as string[]} color="gray" />
                      <div className="flex flex-wrap gap-4 pt-2">
                        <BoolBadge label="Islamic Account" value={(broker.tradingConditions as unknown as Record<string, unknown>).hasIslamicAccount as boolean} />
                        <BoolBadge label="Demo Account" value={(broker.tradingConditions as unknown as Record<string, unknown>).hasDemoAccount as boolean} />
                      </div>
                    </Card>
                  )}

                  {/* Pros & Cons */}
                  {((broker.pros?.length ?? 0) > 0 || (broker.cons?.length ?? 0) > 0) && (
                    <Card title="Pros & Cons">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-green-600 mb-2">Pros</p>
                          <ul className="space-y-1">
                            {broker.pros?.map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="text-green-500 mt-0.5">✓</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-red-500 mb-2">Cons</p>
                          <ul className="space-y-1">
                            {broker.cons?.map((c, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="text-red-400 mt-0.5">✗</span>{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* SEO */}
                  {(broker as unknown as Record<string, unknown>).seo && (
                    <Card title="SEO">
                      {(() => {
                        const seo = (broker as unknown as Record<string, unknown>).seo as Record<string, unknown>;
                        return (
                          <>
                            <Row label="Meta Title" value={seo.metaTitle as string} />
                            <Row label="Meta Description" value={seo.metaDescription as string} multiline />
                            <TagRow label="Meta Keywords" values={seo.metaKeywords as string[]} color="gray" />
                          </>
                        );
                      })()}
                    </Card>
                  )}
                </div>

                {/* Right: 1/3 */}
                <div className="space-y-5">

                  {/* Quick Stats */}
                  <Card title="Ratings">
                    <div className="flex items-center gap-3 py-2">
                      <svg className="w-8 h-8 text-amber-brand" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div>
                        <p className="text-2xl font-bold text-black">{broker.ratingAverage?.toFixed(1) ?? "0.0"}</p>
                        <p className="text-xs text-gray-400">{broker.ratingCount ?? 0} reviews</p>
                      </div>
                    </div>
                  </Card>

                  {/* Company */}
                  <Card title="Company Info">
                    <Row label="Founded" value={(broker as unknown as Record<string, unknown>).foundedYear as string} />
                    <Row label="HQ Country" value={(broker as unknown as Record<string, unknown>).headquartersCountry as string} />
                    <TagRow label="Regulatory Bodies" values={broker.regulatoryBodies} color="blue" />
                    <TagRow label="License Numbers" values={(broker as unknown as Record<string, unknown>).licenseNumbers as string[]} color="gray" />
                  </Card>

                  {/* Contact */}
                  {(broker as unknown as Record<string, unknown>).contact && (
                    <Card title="Contact & Social">
                      {(() => {
                        const c = (broker as unknown as Record<string, unknown>).contact as Record<string, string>;
                        return (
                          <>
                            <LinkRow label="Website" href={c.website} />
                            <Row label="Email" value={c.email} />
                            <Row label="Phone" value={c.phone} />
                            <LinkRow label="Live Chat" href={c.liveChatUrl} />
                            <LinkRow label="Twitter" href={c.twitter} />
                            <LinkRow label="Facebook" href={c.facebook} />
                            <LinkRow label="LinkedIn" href={c.linkedin} />
                          </>
                        );
                      })()}
                    </Card>
                  )}

                  {/* Affiliate */}
                  <Card title="Affiliate">
                    <LinkRow label="Affiliate URL" href={(broker as unknown as Record<string, unknown>).affiliateUrl as string} />
                    <Row label="CPA Value" value={(broker as unknown as Record<string, unknown>).affiliateCpaValue != null ? `$${(broker as unknown as Record<string, unknown>).affiliateCpaValue}` : undefined} />
                  </Card>

                  {/* Tags */}
                  {(broker as unknown as Record<string, unknown>).tags && (
                    <Card title="Tags">
                      <TagRow label="" values={(broker as unknown as Record<string, unknown>).tags as string[]} color="amber" />
                    </Card>
                  )}

                  {/* Timestamps */}
                  <Card title="Timestamps">
                    <Row label="Created" value={fmt(broker.createdAt)} />
                    <Row label="Updated" value={fmt(broker.updatedAt)} />
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border-light rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-border-light bg-gray-50">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">{title}</h3>
        </div>
      )}
      <div className="px-4 py-3 divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Row({ label, value, mono, multiline }: { label: string; value?: string | number | null; mono?: boolean; multiline?: boolean }) {
  if (value == null || value === "") return null;
  return (
    <div className={`flex gap-3 py-1.5 ${multiline ? "flex-col gap-0.5" : ""}`}>
      {label && <span className="text-xs text-gray-400 w-36 shrink-0">{label}</span>}
      <span className={`text-xs text-black break-words ${mono ? "font-mono" : ""}`}>{String(value)}</span>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href?: string | null }) {
  if (!href) return null;
  return (
    <div className="flex gap-3 py-1.5">
      <span className="text-xs text-gray-400 w-36 shrink-0">{label}</span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">
        {href}
      </a>
    </div>
  );
}

function TagRow({ label, values, color }: { label: string; values?: string[] | null; color: "blue" | "purple" | "gray" | "amber" }) {
  if (!values?.length) return null;
  const cls = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-50 text-amber-700",
  }[color];
  return (
    <div className="flex gap-3 py-1.5">
      {label && <span className="text-xs text-gray-400 w-36 shrink-0">{label}</span>}
      <div className="flex flex-wrap gap-1">
        {values.map((v) => (
          <span key={v} className={`px-2 py-0.5 rounded text-[10px] font-medium ${cls}`}>{v}</span>
        ))}
      </div>
    </div>
  );
}

function BoolBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`} />
      <span className={value ? "text-black font-medium" : "text-gray-400"}>{label}</span>
    </div>
  );
}
