import { useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Library, LogOut, Search, User, LifeBuoy } from "lucide-react";
import { buttonTap } from "../lib/motion";
import { CitySelector } from "./CitySelector";

export function Header({
  activeView,
  onViewChange,
  shelfCount,
  currentUser,
  onAuthOpen,
  onLogout,
  onGlobalSearch,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onGlobalSearch) {
      onGlobalSearch(searchQuery.trim());
      setSearchQuery("");
    } else {
      onViewChange("search");
    }
  };

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <div className="glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-lg px-3 py-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onViewChange("search")}
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left focus:outline-none focus:ring-2 focus:ring-iris/30"
            aria-label="NextRead"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
              <BookMarked className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-none tracking-tightish text-ink">
                NextRead
              </span>
              <span className="hidden text-xs font-medium text-graphite sm:block">
                книги по вкусу
              </span>
            </span>
          </button>
          <div className="hidden md:block">
            <CitySelector />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <CitySelector />
          </div>
          <nav className="flex items-center gap-1 rounded-lg border border-line bg-white/70 p-1">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-graphite pointer-events-none" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск книг..." 
                className={`h-9 transition-all duration-300 rounded-lg bg-transparent pl-8 pr-3 text-sm font-medium text-ink placeholder:text-graphite focus:outline-none focus:ring-2 focus:ring-iris/30 focus:bg-white/80 ${activeView === "search" && !searchQuery ? "w-28 bg-white/40" : "w-32 md:w-48 bg-white/60"}`}
              />
            </form>

            <motion.button
              type="button"
              {...buttonTap}
              onClick={() => onViewChange("shelves")}
              className={`relative inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-iris/30 ${
                activeView === "shelves" ? "text-white" : "text-graphite hover:text-ink"
              }`}
            >
              {activeView === "shelves" ? (
                <motion.span
                  layoutId="header-active-pill"
                  className="absolute inset-0 rounded-lg bg-ink shadow-inset"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              ) : null}
              <Library className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative hidden sm:inline">Полки</span>
              {shelfCount > 0 ? (
                <span
                  className={`relative rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeView === "shelves" ? "bg-white/20 text-white" : "bg-ink text-white"
                  }`}
                >
                  {shelfCount}
                </span>
              ) : null}
            </motion.button>

            <motion.button
              type="button"
              {...buttonTap}
              onClick={() => onViewChange("support")}
              className={`relative inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-iris/30 ${
                activeView === "support" ? "text-white" : "text-graphite hover:text-ink"
              }`}
            >
              {activeView === "support" ? (
                <motion.span
                  layoutId="header-active-pill"
                  className="absolute inset-0 rounded-lg bg-ink shadow-inset"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              ) : null}
              <LifeBuoy className="relative h-4 w-4" aria-hidden="true" />
              <span className="relative hidden sm:inline">Поддержка</span>
            </motion.button>
          </nav>

          {currentUser ? (
            <div className="flex items-center gap-1 rounded-lg border border-line bg-white/70 p-1">
              <motion.button
                type="button"
                {...buttonTap}
                onClick={() => onViewChange("profile")}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-iris/30"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {currentUser.name}
                </span>
              </motion.button>
              <motion.button
                type="button"
                {...buttonTap}
                onClick={onLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-graphite transition hover:bg-white hover:text-coral"
                aria-label="Выйти"
                title="Выйти"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              {...buttonTap}
              onClick={onAuthOpen}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white/80 px-3 text-sm font-semibold text-ink transition hover:border-iris/30 hover:bg-iris/10"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Войти</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
