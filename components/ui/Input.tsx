"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export function Input({
  label,
  helperText,
  className = "",
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="!mb-4">
      {label && (
        <label className="block font-medium !mb-2 text-sm text-slate-200">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`w-full !px-3 !py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-700/50 text-slate-100 border-slate-600 placeholder:text-slate-400 ${isPassword ? "!pr-10" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-slate-400 !mt-1">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export function Textarea({
  label,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="!mb-6">
      {label && (
        <label className="block font-medium !mb-2 text-sm text-slate-200">
          {label}
        </label>
      )}
      <textarea
        className={`w-full !px-3 !py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-y min-h-[100px] bg-slate-700/50 text-slate-100 border-slate-600 placeholder:text-slate-400 ${className}`}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-slate-400 !mt-1">{helperText}</p>
      )}
    </div>
  );
}
