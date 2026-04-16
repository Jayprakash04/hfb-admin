"use client";

import { useState } from "react";

interface DynamicListInputProps {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function DynamicListInput({
  label,
  value = [],
  onChange,
  placeholder = "Type and press Enter",
  error,
  className = "",
}: DynamicListInputProps) {
  const safeValue = Array.isArray(value) ? value : [];
  const [input, setInput] = useState("");

  const addItem = () => {
    const trimmed = input.trim();
    if (trimmed && !safeValue.includes(trimmed)) {
      onChange([...safeValue, trimmed]);
      setInput("");
    }
  };

  const removeItem = (index: number) => {
    onChange(safeValue.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 bg-yellow-400 text-black text-xs font-bold rounded-md hover:bg-yellow-500 transition-colors"
        >
          Add
        </button>
      </div>
      {safeValue.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {safeValue.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-1 rounded"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="hover:text-red-600 text-gray-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
