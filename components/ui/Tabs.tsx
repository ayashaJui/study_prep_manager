"use client";

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 !mb-5 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`!px-4 !py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? "bg-purple-600 text-white"
              : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
}
