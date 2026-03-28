"use client";

import { Book, Menu, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import { useState } from "react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  return (
    <header
      className="text-white !p-4 border-b border-slate-700/50"
      style={{
        background: "#8b5cf6",
      }}
    >
      <div className="flex items-center justify-between">
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

        {/* Auth Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {isLoading ? (
            <div className="h-10 w-24 bg-white/20 rounded-lg animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <User size={18} />
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
                  style={{ background: "#1e293b", border: "1px solid #64748b" }}
                >
                  <div className="!p-3 border-b border-slate-700">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs opacity-75">{user.email}</p>
                  </div>
                  <Link href="/user/profile" className="block">
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left !px-4 !py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Settings size={16} />
                      View Profile
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left !px-4 !py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2 rounded-b-lg"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
