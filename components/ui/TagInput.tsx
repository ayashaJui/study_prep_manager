"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export default function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Add tag...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase().trim()) &&
      !tags.includes(s),
  );

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        addTag(filtered[highlightIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue) {
      onChange(tags.slice(0, -1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const showDropdown = isOpen && filtered.length > 0;
  const showHint =
    !!inputValue.trim() &&
    !tags.includes(inputValue.trim()) &&
    !filtered.includes(inputValue.trim());

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap gap-1.5 !px-3 !py-2 min-h-[42px] rounded-lg border border-slate-600 bg-slate-700/50 cursor-text focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 !px-2.5 !py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(idx);
              }}
              className="text-purple-400 hover:text-purple-200 transition-colors leading-none"
              aria-label={`Remove tag ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={tags.length === 0 ? placeholder : ""}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 !mt-1 rounded-lg border border-slate-600 shadow-xl z-50 max-h-48 overflow-y-auto"
          style={{ background: "#1e293b" }}
        >
          {filtered.map((suggestion, idx) => (
            <button
              key={suggestion}
              type="button"
              className="w-full text-left !px-3 !py-2 text-sm transition-colors"
              style={{
                color: idx === highlightIndex ? "white" : "#cbd5e1",
                background:
                  idx === highlightIndex
                    ? "rgba(139,92,246,0.4)"
                    : "transparent",
              }}
              onMouseEnter={() => setHighlightIndex(idx)}
              onMouseLeave={() => setHighlightIndex(-1)}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {showHint && (
        <p className="text-xs text-slate-500 !mt-1.5">
          Press Enter or , to add &ldquo;{inputValue.trim()}&rdquo;
        </p>
      )}
    </div>
  );
}
