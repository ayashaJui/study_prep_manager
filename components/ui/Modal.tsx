"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto !py-8 !px-4"
      style={{ background: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-lg border border-slate-700 bg-slate-800 flex flex-col"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between !px-5 !py-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="!p-1 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="!p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
