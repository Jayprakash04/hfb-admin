"use client";

interface SectionWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function SectionWrapper({ title, description, children }: SectionWrapperProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
      <div className="mb-5 pb-3 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-bold uppercase tracking-wide text-black">{title}</h3>
        {description && <p className="text-[11px] text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
