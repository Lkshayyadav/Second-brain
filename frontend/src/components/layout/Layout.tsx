import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { TypeIcon } from "../ui/TypeIcon";
import type { Collection } from "../../types/collection";
import type { Content } from "../../types/content";

interface LayoutProps {
  children: ReactNode;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  collections?: Collection[];
  contents?: Content[];
  onCreateCollection?: (name: string) => Promise<void>;
  onRenameCollection?: (id: string, name: string) => Promise<void>;
  onDeleteCollection?: (id: string) => Promise<void>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onQuickAdd?: () => void;
}

export function Layout({
  children,
  activeFilter,
  onFilterChange,
  collections = [],
  contents = [],
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  searchQuery = "",
  onSearchChange,
  onQuickAdd,
}: LayoutProps) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isSettings = location.pathname === "/settings";
  const username = localStorage.getItem("username") || "Explorer";

  // Calculate dynamic greeting greeting with wave emoji
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "👋 Good morning";
    if (hour < 18) return "👋 Good afternoon";
    return "👋 Good evening";
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="flex min-h-screen bg-brand-primary text-brand-text transition-colors duration-250">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        collections={collections}
        contents={contents}
        onCreateCollection={onCreateCollection}
        onRenameCollection={onRenameCollection}
        onDeleteCollection={onDeleteCollection}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="border-b border-brand-border bg-brand-secondary px-6 py-4 sticky top-0 z-30 shadow-premium-sm transition-colors duration-250">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title / Greeting & Subheading */}
            <div>
              <div className="flex items-center gap-2">
                <span className="lg:hidden text-2xl">🧠</span>
                <h1 className="text-base font-black text-brand-text leading-tight tracking-tight">
                  {getGreeting()}, {username}
                </h1>
              </div>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mt-0.5">
                Welcome back to your Second Brain &bull; {formattedDate}
              </p>
            </div>

            {/* Middle: Integrated Search */}
            {!isSettings && onSearchChange && (
              <div className="relative max-w-md w-full md:mx-4 flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-muted pointer-events-none">
                  <TypeIcon type="search" size={15} />
                </span>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search titles, tags, content... (Press '/' to focus)"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-btn border border-brand-border bg-brand-primary pl-9 pr-4 py-2 text-xs outline-none focus:bg-brand-secondary focus:border-brand-accent focus:ring-2 focus:ring-brand-accentGlow transition-all text-brand-text placeholder:text-brand-muted font-medium"
                />
              </div>
            )}

            {/* Right: Actions, Notifications, Toggle, Quick Add */}
            <div className="flex items-center gap-2.5 justify-end shrink-0">
              {/* Theme Toggle Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-brand-primary text-brand-sub hover:text-brand-text rounded-lg border border-brand-borderAccent transition-colors duration-200 focus:outline-none"
                title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>

              {/* Notification bell */}
              <div
                className="relative p-2 hover:bg-brand-primary rounded-lg text-brand-muted hover:text-brand-text border border-brand-borderAccent cursor-pointer transition-colors duration-200"
                title="Notifications"
              >
                <TypeIcon type="bell" size={17} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-brand-secondary" />
              </div>

              {/* Quick Add Button */}
              {!isSettings && onQuickAdd && (
                <button
                  onClick={onQuickAdd}
                  className="bg-brand-accent hover:bg-brand-accentHover text-white rounded-btn px-4 py-2 text-xs font-bold shadow-premium-sm hover:shadow-premium-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-brand-secondary"
                >
                  <TypeIcon type="plus" size={13} />
                  <span>Quick Add</span>
                </button>
              )}

              {isSettings ? (
                <Button
                  title="Dashboard"
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/dashboard")}
                />
              ) : (
                <Button
                  title="Settings"
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/settings")}
                />
              )}

              <Button
                title="Logout"
                variant="secondary"
                size="md"
                onClick={handleLogout}
              />
            </div>
          </div>
        </header>
        <main className="p-6 flex-1 overflow-auto bg-brand-primary">{children}</main>
      </div>
    </div>
  );
}
export default Layout;
