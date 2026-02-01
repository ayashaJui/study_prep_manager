import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 !mb-5 !px-3 !py-2.5 rounded-md bg-slate-800/40 border border-slate-700/50">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-purple-400 transition-colors group"
            >
              {index === 0 && (
                <Home
                  size={14}
                  className="group-hover:scale-110 transition-transform"
                />
              )}
              <span>{item.label}</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
              {index === 0 && <Home size={14} />}
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
          )}
        </div>
      ))}
    </nav>
  );
}
