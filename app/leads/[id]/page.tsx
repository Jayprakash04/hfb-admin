"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
// Sidebar and TopBar are provided by layout
import { leadService, Lead } from "../../services/api";
import { LeadStatusEnum } from "../../lib/enums";

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-600",
  spam: "bg-gray-100 text-gray-500",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-black break-all">{String(value)}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-4">
      <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 pb-2 border-b border-[#E5E7EB]">{title}</h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editCpa, setEditCpa] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await leadService.getById(id);
        const raw = data as unknown as Record<string, unknown>;
        const l: Lead | null =
          (raw.lead as Lead) ??
          (raw.data as Lead) ??
          (Array.isArray(raw.data) ? (raw.data[0] as Lead) : null);
        setLead(l);
        if (!l) setError("Lead not found.");
      } catch {
        setError("Lead not found.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetch();
  }, [id]);

  function startEdit() {
    if (!lead) return;
    setEditStatus(lead.status);
    setEditCpa(String(lead.cpaValue ?? ""));
    setEditNotes(lead.adminNotes ?? "");
    setEditing(true);
  }

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    try {
      const { data } = await leadService.update(lead._id, {
        status: editStatus as Lead["status"],
        cpaValue: editCpa !== "" ? Number(editCpa) : undefined,
        adminNotes: editNotes || undefined,
      });
      const raw = data as unknown as Record<string, unknown>;
      const updated: Lead = (raw.lead as Lead) ?? (raw.data as Lead) ?? { ...lead, status: editStatus as Lead["status"], cpaValue: Number(editCpa), adminNotes: editNotes };
      setLead(updated);
      setEditing(false);
      toast.success("Lead updated.");
    } catch {
      toast.error("Failed to update lead.");
    } finally {
      setSaving(false);
    }
  }

  function brokerDisplay() {
    if (!lead?.broker) return { name: "—", slug: null };
    if (typeof lead.broker === "string") return { name: lead.broker, slug: null };
    return { name: lead.broker.name ?? "—", slug: lead.broker.slug ?? null };
  }

  function userDisplay() {
    if (!lead?.referredUser) return { name: "—", email: null };
    if (typeof lead.referredUser === "string") return { name: lead.referredUser, email: null };
    return { name: lead.referredUser.name ?? "—", email: lead.referredUser.email ?? null };
  }

  const broker = brokerDisplay();
  const user = userDisplay();

  return (
    <div className="flex flex-col flex-1 ml-55 min-w-0">
      <div className="px-6 py-6 flex-1">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">
                {loading ? "Loading..." : lead ? `Lead — ${broker.name}` : "Lead Detail"}
              </h1>
              {lead && (
                <p className="text-xs text-gray-400 mt-1 font-mono">{lead._id}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => router.push("/leads")}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                ← Back
              </button>
              {lead && !editing && (
                <button
                  onClick={startEdit}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-brand text-black rounded hover:bg-yellow-500"
                >
                  Edit Lead
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {!loading && lead && (
            <div className="grid grid-cols-3 gap-4">

              {/* Left — main info */}
              <div className="col-span-2 space-y-4">

                {/* Status + CPA edit panel */}
                {editing ? (
                  <div className="bg-white border border-amber-300 rounded-lg p-5">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-4">Editing Lead</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          {LeadStatusEnum.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">CPA Value ($)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editCpa}
                          onChange={(e) => setEditCpa(e.target.value)}
                          placeholder="e.g. 150.00"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Admin Notes</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={4}
                          placeholder="Internal notes about this lead..."
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-5 py-2 text-xs font-bold bg-amber-brand text-black rounded hover:bg-yellow-500 disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Card title="Status & Revenue">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-3 py-1 rounded text-xs font-bold ${STATUS_COLOR[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                      {lead.convertedAt && (
                        <span className="text-xs text-green-600 font-medium">
                          Converted: {new Date(lead.convertedAt).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                    <Field label="CPA Value" value={lead.cpaValue ? `$${lead.cpaValue.toFixed(2)}` : null} />
                    {lead.adminNotes && (
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-gray-400 mb-0.5">Admin Notes</dt>
                        <dd className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded p-3 whitespace-pre-wrap">{lead.adminNotes}</dd>
                      </div>
                    )}
                  </Card>
                )}

                {/* Traffic source */}
                <Card title="Traffic Source">
                  <Field label="Landing Page" value={lead.landingPage} />
                  <Field label="Referrer URL" value={lead.referrerUrl} />
                  <Field label="UTM Source" value={lead.utmSource} />
                  <Field label="UTM Medium" value={lead.utmMedium} />
                  <Field label="UTM Campaign" value={lead.utmCampaign} />
                  <Field label="UTM Term" value={lead.utmTerm} />
                  <Field label="UTM Content" value={lead.utmContent} />
                  {!lead.utmSource && !lead.utmMedium && !lead.utmCampaign && !lead.landingPage && !lead.referrerUrl && (
                    <p className="text-xs text-gray-400">No tracking data available.</p>
                  )}
                </Card>

                {/* CTA */}
                <Card title="Interaction">
                  <Field label="CTA Label" value={lead.ctaLabel} />
                  <Field label="Page Type" value={lead.pageType} />
                  <Field label="Device" value={lead.device} />
                  <Field label="Country" value={lead.country} />
                </Card>
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">

                {/* Broker */}
                <Card title="Broker">
                  <Field label="Name" value={broker.name} />
                  {broker.slug && (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase text-gray-400 mb-0.5">Profile</dt>
                      <dd>
                        <button
                          onClick={() => router.push(`/brokers/${broker.slug}`)}
                          className="text-xs text-amber-600 underline hover:text-amber-700"
                        >
                          View Broker →
                        </button>
                      </dd>
                    </div>
                  )}
                </Card>

                {/* User */}
                <Card title="Referred User">
                  {!lead.referredUser ? (
                    <p className="text-xs text-gray-400">Anonymous / not logged in</p>
                  ) : (
                    <>
                      <Field label="Name" value={user.name} />
                      <Field label="Email" value={user.email} />
                    </>
                  )}
                </Card>

                {/* Timestamps */}
                <Card title="Timestamps">
                  <Field
                    label="Created"
                    value={new Date(lead.createdAt).toLocaleString("en-GB")}
                  />
                  <Field
                    label="Updated"
                    value={new Date(lead.updatedAt).toLocaleString("en-GB")}
                  />
                  {lead.convertedAt && (
                    <Field
                      label="Converted At"
                      value={new Date(lead.convertedAt).toLocaleString("en-GB")}
                    />
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
   
  );
}
