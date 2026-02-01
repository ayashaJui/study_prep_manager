import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export function Input({
  label,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="!mb-4">
      {label && (
        <label className="block font-medium !mb-2 text-sm text-slate-200">
          {label}
        </label>
      )}
      <input
        className={`w-full !px-3 !py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-700/50 text-slate-100 border-slate-600 placeholder:text-slate-400 ${className}`}
        {...props}
      />
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
