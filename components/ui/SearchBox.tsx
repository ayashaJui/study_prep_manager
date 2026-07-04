"use client";

import { Search, X } from "lucide-react";
import type { KeyboardEventHandler, RefObject } from "react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  showClear?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  onKeyDown,
  showClear = true,
  inputRef,
}: SearchBoxProps) {
  const canClear = showClear && value.trim().length > 0 && !!onClear;

  return (
    <div className="relative !mb-4">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !mr-10"
        size={16}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full !pl-9 !pr-10 !py-2 rounded-sm border text-sm focus:!outline-none focus:border-purple-100 focus:ring-1 focus:ring-purple-500 bg-slate-700/50 text-slate-100 border-slate-600 placeholder:text-slate-400"
      />
      {canClear && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
