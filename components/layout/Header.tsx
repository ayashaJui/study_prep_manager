import { Book, Menu } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header
      className="text-white !p-4 border-b border-slate-700/50"
      style={{
        background: "#8b5cf6",
      }}
    >
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="p-2 bg-white/20 rounded-lg">
          <Book size={20} />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold">
            Interview & Study Prep Manager
          </h1>
          <p className="text-xs opacity-90 hidden md:block">
            Organize topics, notes, flashcards, and quizzes
          </p>
        </div>
      </div>
    </header>
  );
}
