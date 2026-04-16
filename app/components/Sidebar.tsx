"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-border-light flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-2 border-b border-border-light">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-black">HFB</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-black">
            Hot Forex Brokers
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 italic">Reviews You Can Trade On</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 text-[13px]">
        {/* Dashboard */}
        <SidebarLink href="/" icon={<DashboardIcon />} label="Main Dashboard" active={pathname === "/"} highlight />

        {/* BROKER MANAGEMENT */}
        <SidebarSection title="BROKER MANAGEMENT">
          <SidebarLink href="/brokers" icon={<TableIcon />} label=" Brokers" active={pathname === "/brokers"} />
          {/* <SidebarLink href="/brokers/new" icon={<PlusIcon />} label="+ Add New Broker" active={pathname === "/brokers/new"} /> */}
          {/* <SidebarLink href="/" icon={<UploadIcon />} label="Import Data" active={false} /> */}
        </SidebarSection>

        {/* CONTENT MANAGEMENT */}
        <SidebarSection title="CONTENT MANAGEMENT (CMS)">
          <SidebarLink href="/articles/new" icon={<EditIcon />} label="Articles" active={pathname === "/articles/new"} />
          {/* <SidebarLink href="/articles" icon={<ListIcon />} label="View All Articles" active={pathname === "/articles"} /> */}
        </SidebarSection>

        {/* DATA TABLES */}
        <SidebarSection title="DATA TABLES">
          <SidebarLink href="/" icon={<GridIcon />} label="Top Forex Table Data" active={false} />
          <SidebarLink href="/" icon={<GridIcon />} label="Comparison Table Data" active={false} />
        </SidebarSection>

        {/* REVIEWS & RATINGS */}
        <SidebarSection title="REVIEWS & RATINGS">
          {/* <SidebarLink href="/" icon={<ListIcon />} label="Moderation Queue" active={false} /> */}
          <SidebarLink href="/" icon={<ChatIcon />} label="User Reviews" active={false} />
        </SidebarSection>

        {/* FEATURED BROKERS */}
        {/* <SidebarSection title="FEATURED BROKERS">
          <SidebarLink href="/" icon={<StarIcon />} label="Select Homepage Featured" active={false} />
        </SidebarSection> */}

        {/* E-E-A-T SECTION */}
        {/* <SidebarSection title="E-E-A-T SECTION">
          <SidebarLink href="/" icon={<PenIcon />} label="Edit Author Profiles" active={false} />
        </SidebarSection> */}

        {/* SETTINGS & USER ADMIN */}
        <SidebarSection title="SETTINGS & USER ADMIN">
          <SidebarLink href="/" icon={<PersonIcon />} label=" Admins" active={false} />
          {/* <SidebarLink href="/" icon={<KeyIcon />} label="API Keys (for data sources)" active={false} /> */}
          <SidebarLink href="/leads" icon={<FormIcon />} label="Lead Gen Forms" active={pathname === "/leads" || pathname.startsWith("/leads/")} />
        </SidebarSection>
      </nav>
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({ href, icon, label, active, highlight }: { href: string; icon: React.ReactNode; label: string; active: boolean; highlight?: boolean }) {
  const base = active
    ? "bg-amber-brand text-white font-semibold"
    : "text-gray-700 hover:bg-gray-100";
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${base} ${highlight && active ? "py-2 mb-4" : ""}`}
    >
      <span className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-gray-400"}`}>{icon}</span>
      {label}
    </Link>
  );
}

/* SVG Icons */
function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function FormIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
