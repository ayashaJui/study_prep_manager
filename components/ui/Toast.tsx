"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    warning: <AlertCircle size={20} className="text-yellow-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  const styles = {
    success: "bg-green-900/95 border-green-400",
    error: "bg-red-900/95 border-red-400",
    warning: "bg-yellow-900/95 border-yellow-400",
    info: "bg-blue-900/95 border-blue-400",
  };

  return (
    <div
      className={`flex items-start gap-3 !p-4 rounded-lg border-2 backdrop-blur-md shadow-2xl transition-all duration-300 ${
        styles[toast.type]
      } ${
        isExiting
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      }`}
      style={{ 
        minWidth: "320px", 
        maxWidth: "420px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
      }}
    >
      <div className="flex-shrink-0 !mt-0.5">{icons[toast.type]}</div>
      <p className="flex-1 text-sm text-white font-medium leading-relaxed">
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-300 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
