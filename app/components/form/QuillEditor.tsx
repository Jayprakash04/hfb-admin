"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-64 border border-[#E5E7EB] rounded-md bg-gray-50 animate-pulse" />
  ),
});

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  [{ align: [] }],
  ["clean"],
];

interface QuillEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function QuillEditor({
  label,
  value,
  onChange,
  error,
  required,
  placeholder = "Write your article content here...",
  className = "",
}: QuillEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    []
  );

  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className={`quill-wrapper rounded-md overflow-hidden border ${
          error ? "border-red-400" : "border-[#E5E7EB]"
        }`}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          style={{ minHeight: "320px" }}
        />
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
