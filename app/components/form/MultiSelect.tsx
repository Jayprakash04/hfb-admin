"use client";

import { useState, useRef, useEffect } from "react";

export type MultiSelectOption = string | { value: string; label: string };

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
  className?: string;
  placeholder?: string;
}

function optValue(o: MultiSelectOption) {
  return typeof o === "string" ? o : o.value;
}
function optLabel(o: MultiSelectOption) {
  return typeof o === "string" ? o : o.label;
}

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  className = "",
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  };

  // Build a label lookup from selected values
  const labelMap = Object.fromEntries(options.map((o) => [optValue(o), optLabel(o)]));

  const filtered = options.filter((o) =>
    optLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={ref}>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md text-sm cursor-pointer min-h-[38px] flex flex-wrap gap-1 items-center ${
          error ? "border-red-400 bg-red-50" : "border-[#E5E7EB]"
        }`}
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[11px] font-medium px-2 py-0.5 rounded"
            >
              {labelMap[v] ?? v}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(v);
                }}
                className="hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#E5E7EB] rounded-md shadow-lg">
          {options.length > 8 && (
            <div className="px-2 pt-2 pb-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 border border-[#E5E7EB] rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">No options found.</p>
            ) : (
              filtered.map((opt) => {
                const v = optValue(opt);
                return (
                  <label
                    key={v}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-yellow-50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(v)}
                      onChange={() => toggle(v)}
                      className="accent-yellow-500 w-3.5 h-3.5"
                    />
                    {optLabel(opt)}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
