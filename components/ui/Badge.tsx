import { ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "not-started" | "in-progress" | "review" | "mastered";
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  const styles = {
    default: {
      background: "#8b5cf6",
      color: "white",
    },
    "not-started": {
      background: "#64748b",
      color: "#f1f5f9",
    },
    "in-progress": {
      background: "#3b82f6",
      color: "white",
    },
    review: {
      background: "#f59e0b",
      color: "white",
    },
    mastered: {
      background: "#10b981",
      color: "white",
    },
  };

  return (
    <span
      className={`inline-block !px-2.5 !py-1 rounded-sm text-xs font-semibold uppercase ${className}`}
      style={styles[variant]}
    >
      {children}
    </span>
  );
}
