import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  variant?: "blue" | "green" | "purple" | "default";
}

export default function StatCard({
  icon,
  value,
  label,
  variant = "default",
}: StatCardProps) {
  const styles = {
    default: {
      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
    blue: { background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
    green: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
    purple: { background: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)" },
  };

  return (
    <div className="!p-4 md:!p-5 rounded-lg text-white" style={styles[variant]}>
      <div className="opacity-80 mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90 mt-1">{label}</div>
    </div>
  );
}
