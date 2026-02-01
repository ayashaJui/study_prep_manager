interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between !mb-2">
          {label && <span className="text-sm text-slate-300">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-purple-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-700">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full bg-purple-600"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
