import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "small" | "take" | "edit" | "delete";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-md transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "text-white !px-4 !py-2 text-sm hover:brightness-110",
    secondary:
      "text-slate-200 !px-4 !py-2 text-sm border border-slate-600 hover:bg-slate-700/50",
    small: "!px-3 !py-1.5 text-sm",
    take: "text-white !px-3 !py-1.5 text-sm hover:brightness-110",
    edit: "text-white !px-3 !py-1.5 text-sm hover:brightness-110",
    delete: "text-white !px-3 !py-1.5 text-sm hover:brightness-110",
  };

  const styles = {
    primary: {
      background: "#8b5cf6",
    },
    secondary: {
      background: "transparent",
    },
    small: {},
    take: { background: "#10b981" },
    edit: { background: "#3b82f6" },
    delete: { background: "#ef4444" },
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={styles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}
