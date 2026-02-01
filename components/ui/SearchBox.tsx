"use client";

import { Search } from "lucide-react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBoxProps) {
  return (
    <div className="relative !mb-4">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !mr-10"
        size={16}
      />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full !pl-9 !pr-3 !py-2 rounded-sm border text-sm focus:!outline-none focus:border-purple-100 focus:ring-1 focus:ring-purple-500 bg-slate-700/50 text-slate-100 border-slate-600 placeholder:text-slate-400"
      />
    </div>
  );
}
