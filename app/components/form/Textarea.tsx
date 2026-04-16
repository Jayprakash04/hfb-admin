"use client";

import { FieldError } from "react-hook-form";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
  charCount?: number;
  maxChars?: number;
}

export default function Textarea({
  label,
  error,
  register,
  charCount,
  maxChars,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase text-gray-600">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {maxChars && (
          <span className={`text-[10px] ${(charCount ?? 0) > maxChars ? "text-red-500" : "text-gray-400"}`}>
            {charCount ?? 0}/{maxChars}
          </span>
        )}
      </div>
      <textarea
        {...register}
        {...props}
        className={`w-full px-3 py-2 border rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors resize-y min-h-[80px] ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB]"
        }`}
      />
      {error && <p className="text-[11px] text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
