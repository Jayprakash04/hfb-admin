"use client";

import { FieldError } from "react-hook-form";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, register, options, className = "", ...props }: SelectProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
        {label}
      </label>
      <select
        {...register}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB]"
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
