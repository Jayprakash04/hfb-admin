"use client";

interface CheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function Checkbox({ label, description, checked, onChange, className = "" }: CheckboxProps) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-yellow-500 w-4 h-4 mt-0.5 rounded"
      />
      <div>
        <span className="text-sm text-black font-medium">{label}</span>
        {description && <p className="text-[11px] text-gray-400">{description}</p>}
      </div>
    </label>
  );
}
