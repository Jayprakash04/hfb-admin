"use client";

import { FieldError } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
}

export default function Input({ label, error, register, className = "", ...props }: InputProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        {...register}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB]"
        }`}
      />
      {error && <p className="text-[11px] text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
