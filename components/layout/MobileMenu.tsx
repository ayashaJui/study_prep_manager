"use client";

import { X } from "lucide-react";

interface MobileMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({
  children,
  isOpen,
  onClose,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - only on mobile */}
      <div
        className="fixed inset-0 bg-black/70 z-30 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed md:relative left-0 top-0 bottom-0 z-40 md:z-0 w-64 md:w-auto overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Close button - only on mobile */}
          <div
            className="md:hidden flex justify-end !p-3 "
            style={{ background: "#1a1f2e" }}
          >
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </>
  );
}
