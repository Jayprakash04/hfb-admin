"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
// Sidebar and TopBar are provided by layout
import { leadService, brokerService, Broker, Lead } from "../services/api";
import { LeadStatusEnum, DeviceTypeEnum, PageTypeEnum } from "../lib/enums";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-600",
  spam: "bg-gray-100 text-gray-500",
};

function brokerName(b: Lead["broker"]) {
  if (!b) return "—";
  if (typeof b === "string") return b;
  return b.name ?? "—";
}

function userName(u: Lead["referredUser"]) {
  if (!u) return "—";
  if (typeof u === "string") return u;
  return u.name ?? "—";
}

// ── Edit Status Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  lead: Lead;
  onClose: () => void;
  onSaved: (updated: Lead) => void;
}

function EditModal({ lead, onClose, onSaved }: EditModalProps) {
  const [status, setStatus] = useState(lead.status);
  const [cpaValue, setCpaValue] = useState(String(lead.cpaValue ?? ""));
  const [adminNotes, setAdminNotes] = useState(lead.adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await leadService.update(lead._id, {
        status,
        cpaValue: cpaValue !== "" ? Number(cpaValue) : undefined,
        adminNotes: adminNotes || undefined,
      });
      const raw = data as unknown as Record<string, unknown>;
      const updated: Lead =
        (raw.lead as Lead) ?? (raw.data as Lead) ?? { ...lead, status, cpaValue: Number(cpaValue), adminNotes };
      toast.success("Lead updated.");
      onSaved(updated);
    } catch {
      toast.error("Failed to update lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-base font-bold text-black mb-5">Edit Lead</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Lead["status"])}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {LeadStatusEnum.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">CPA Value ($)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={cpaValue}
              onChange={(e) => setCpaValue(e.target.value)}
              placeholder="e.g. 150.00"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes about this lead..."
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold bg-amber-brand text-black rounded hover:bg-yellow-500 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Lead Modal ────────────────────────────────────────────────────────

interface CreateModalProps {
  brokers: Broker[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateModal({ brokers, onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState({
    broker: "",
    ctaLabel: "",
    pageType: "",
    landingPage: "",
    referrerUrl: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    country: "",
    device: "",
  });
  const [saving, setSaving] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    if (!form.broker) {
      toast.error("Broker is required.");
      return;
    }
    setSaving(true);
    try {
      await leadService.create({
        broker: form.broker,
        ctaLabel: form.ctaLabel || undefined,
        pageType: form.pageType || undefined,
        landingPage: form.landingPage || undefined,
        referrerUrl: form.referrerUrl || undefined,
        utmSource: form.utmSource || undefined,
        utmMedium: form.utmMedium || undefined,
        utmCampaign: form.utmCampaign || undefined,
        utmTerm: form.utmTerm || undefined,
        utmContent: form.utmContent || undefined,
        country: form.country || undefined,
        device: form.device || undefined,
      });
      toast.success("Lead created.");
      onCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create lead.");
    } finally {
      setSaving(false);
    }
  }

  const Field = ({ label, k, placeholder, type = "text" }: { label: string; k: keyof typeof form; placeholder?: string; type?: string }) => (
    <div>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );

  const SelectField = ({ label, k, options }: { label: string; k: keyof typeof form; options: readonly string[] }) => (
    <div>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">{label}</label>
      <select
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 my-auto">
        <h3 className="text-base font-bold text-black mb-5">Create New Lead</h3>
        <div className="space-y-3">
          {/* Broker */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Broker <span className="text-red-500">*</span>
            </label>
            <select
              value={form.broker}
              onChange={(e) => set("broker", e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select broker...</option>
              {brokers.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA Label" k="ctaLabel" placeholder="e.g. Open Account" />
            <SelectField label="Page Type" k="pageType" options={PageTypeEnum} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Device" k="device" options={DeviceTypeEnum} />
            <Field label="Country" k="country" placeholder="e.g. GB" />
          </div>
          <Field label="Landing Page URL" k="landingPage" placeholder="https://..." />
          <Field label="Referrer URL" k="referrerUrl" placeholder="https://..." />

          <p className="text-[10px] font-bold uppercase text-gray-400 pt-1">UTM Parameters</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="UTM Source" k="utmSource" placeholder="e.g. google" />
            <Field label="UTM Medium" k="utmMedium" placeholder="e.g. cpc" />
            <Field label="UTM Campaign" k="utmCampaign" placeholder="e.g. summer_sale" />
            <Field label="UTM Term" k="utmTerm" placeholder="e.g. forex broker" />
          </div>
          <Field label="UTM Content" k="utmContent" placeholder="e.g. banner_v2" />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold bg-amber-brand text-black rounded hover:bg-yellow-500 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const LIMIT = 15;

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Brokers for filter + create
  const [brokers, setBrokers] = useState<Broker[]>([]);

  // Modals
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Load brokers once
  useEffect(() => {
    brokerService.list({ limit: 500 }).then(({ data }) => {
      const raw = data as unknown as Record<string, unknown>;
      const rows: Broker[] = Array.isArray(raw.data)
        ? (raw.data as Broker[])
        : Array.isArray((raw as any).brokers)
        ? ((raw as any).brokers as Broker[])
        : [];
      setBrokers(rows);
    }).catch(() => {});
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await leadService.list({
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
        broker: brokerFilter || undefined,
        device: deviceFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const raw = data as unknown as Record<string, unknown>;
      const rows: Lead[] = Array.isArray(raw.data)
        ? (raw.data as Lead[])
        : Array.isArray((raw as any).leads)
        ? ((raw as any).leads as Lead[])
        : [];
      const pagination = (raw.pagination ?? (raw as any).meta) as
        | { totalPages?: number; pages?: number; total?: number }
        | undefined;
      setLeads(rows);
      setTotalPages(pagination?.totalPages ?? pagination?.pages ?? 1);
      setTotal(pagination?.total ?? rows.length);
    } catch {
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, brokerFilter, deviceFilter, startDate, endDate]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { setPage(1); }, [statusFilter, brokerFilter, deviceFilter, startDate, endDate]);

  function handleLeadUpdated(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    setEditLead(null);
  }

  // Summary stats derived from current page data
  const totalCPA = leads.reduce((sum, l) => sum + (l.cpaValue ?? 0), 0);
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  return (
    <div className="flex flex-col flex-1 ml-55 min-w-0">
      <div className="px-6 py-6 flex-1">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-black">Lead Management</h1>
              <p className="text-xs text-gray-500 mt-1">{total} total lead{total !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-amber-brand text-black text-xs font-bold rounded-md hover:bg-yellow-500 transition-colors"
            >
              + New Lead
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Leads", value: total, color: "text-black" },
              { label: "Converted", value: convertedCount, color: "text-green-600" },
              { label: "CPA This Page", value: `$${totalCPA.toFixed(2)}`, color: "text-amber-600" },
              { label: "Conversion Rate", value: total > 0 ? `${((convertedCount / leads.length) * 100).toFixed(1)}%` : "0%", color: "text-purple-600" },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-[11px] font-semibold uppercase text-gray-400 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase text-gray-500">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 w-36"
                >
                  <option value="">All</option>
                  {LeadStatusEnum.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Broker */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase text-gray-500">Broker</label>
                <select
                  value={brokerFilter}
                  onChange={(e) => setBrokerFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 w-44"
                >
                  <option value="">All Brokers</option>
                  {brokers.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Device */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase text-gray-500">Device</label>
                <select
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 w-32"
                >
                  <option value="">All</option>
                  {DeviceTypeEnum.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Date range */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase text-gray-500">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase text-gray-500">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {(statusFilter || brokerFilter || deviceFilter || startDate || endDate) && (
                <button
                  onClick={() => { setStatusFilter(""); setBrokerFilter(""); setDeviceFilter(""); setStartDate(""); setEndDate(""); }}
                  className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded hover:bg-gray-50 self-end"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : leads.length === 0 ? (
              <div className="py-20 text-center text-sm text-gray-400">No leads found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                    <tr>
                      {["Broker", "Status", "CTA / Page", "Device", "Country", "UTM Source", "CPA", "User", "Date", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                        {/* Broker */}
                        <td className="px-4 py-3">
                          <span className="font-medium text-black text-xs">{brokerName(lead.broker)}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_COLOR[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>

                        {/* CTA / Page */}
                        <td className="px-4 py-3">
                          <div className="text-xs text-black">{lead.ctaLabel ?? "—"}</div>
                          {lead.pageType && <div className="text-[11px] text-gray-400">{lead.pageType}</div>}
                        </td>

                        {/* Device */}
                        <td className="px-4 py-3 text-xs text-gray-600 capitalize">{lead.device ?? "—"}</td>

                        {/* Country */}
                        <td className="px-4 py-3 text-xs text-gray-600">{lead.country ?? "—"}</td>

                        {/* UTM Source */}
                        <td className="px-4 py-3 text-xs text-gray-600">{lead.utmSource ?? "—"}</td>

                        {/* CPA */}
                        <td className="px-4 py-3 text-xs font-semibold text-green-700">
                          {lead.cpaValue ? `$${lead.cpaValue.toFixed(2)}` : "—"}
                        </td>

                        {/* Referred User */}
                        <td className="px-4 py-3 text-xs text-gray-600">{userName(lead.referredUser)}</td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/leads/${lead._id}`)}
                              title="View"
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                            >
                              <EyeIcon />
                            </button>
                            <button
                              onClick={() => setEditLead(lead)}
                              title="Edit"
                              className="p-1.5 rounded hover:bg-yellow-100 text-gray-500 hover:text-yellow-700 transition-colors"
                            >
                              <PencilIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span key={`e-${i}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                          page === item ? "bg-amber-brand text-black border-amber-brand" : "border-[#E5E7EB] hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Edit modal */}
      {editLead && (
        <EditModal
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSaved={handleLeadUpdated}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          brokers={brokers}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchLeads(); }}
        />
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
