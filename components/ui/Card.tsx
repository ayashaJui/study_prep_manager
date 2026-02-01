import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-md !p-4 md:!p-6 backdrop-blur-sm border border-slate-700/50 ${className}`}
      style={{
        background: "rgba(30, 41, 66, 0.6)",
      }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardTitle({
  children,
  action,
  className = "",
}: CardTitleProps) {
  return (
    <div className={`flex items-center justify-between !mb-4 ${className}`}>
      <h2 className="text-lg md:text-xl font-semibold text-slate-100">
        {children}
      </h2>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CardSection({
  title,
  action,
  children,
  className = "",
}: CardSectionProps) {
  return (
    <div className={`!mt-5 ${className}`}>
      <div className="flex items-center justify-between !mb-3">
        <h3 className="text-base md:text-lg font-semibold text-slate-200">
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}
