import { ReactNode } from "react";

interface BadgeProps {
  variant?:
    | "default"
    | "not-started"
    | "in-progress"
    | "review"
    | "mastered"
    | "flashcard"
    | "quiz"
    | "note";
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
  onClick,
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
    flashcard: {
      background: "#06b6d4",
      color: "white",
    },
    quiz: {
      background: "#3b82f6",
      color: "white",
    },
    note: {
      background: "#a78bfa",
      color: "white",
    },
  };

  const badgeClassName = `inline-block !px-2.5 !py-1 rounded-sm text-xs font-semibold uppercase ${onClick ? "cursor-pointer" : ""} ${className}`;
  const badgeStyle = styles[variant] || styles.default;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={badgeClassName}
        style={badgeStyle}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={badgeClassName} style={badgeStyle}>
      {children}
    </span>
  );
}
