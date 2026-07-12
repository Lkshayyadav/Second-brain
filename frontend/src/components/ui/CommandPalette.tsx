import { useState, useEffect, useRef } from "react";
import type { Content } from "../../types/content";
import type { Collection } from "../../types/collection";
import { TypeIcon } from "./TypeIcon";
import { useTheme } from "../../contexts/ThemeContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  contents: Content[];
  collections: Collection[];
  onSelectItem: (content: Content) => void;
  onQuickAdd: () => void;
  onSwitchCollection: (collectionId: string) => void;
  onClearFilters: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  contents,
  collections,
  onSelectItem,
  onQuickAdd,
  onSwitchCollection,
  onClearFilters,
}: CommandPaletteProps) {
  const { toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Auto focus
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
      setQuery("");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter commands and contents
  const actions = [
    {
      id: "quick-add",
      title: "Create New Content",
      subtitle: "Add a link, note, video or document to your brain",
      icon: "plus" as const,
      handler: () => {
        onQuickAdd();
        onClose();
      },
    },
    {
      id: "toggle-theme",
      title: "Toggle Theme",
      subtitle: "Switch between dark and light themes",
      icon: "bell" as const, // Fallback icon or appropriate TypeIcon
      handler: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: "clear-filters",
      title: "Reset All Filters",
      subtitle: "Clear search, categories and collection scopes",
      icon: "close" as const,
      handler: () => {
        onClearFilters();
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((act) =>
    act.title.toLowerCase().includes(query.toLowerCase()) ||
    act.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCollections = collections
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4);

  const filteredContents = contents
    .filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, 6);

  // Combine flat list for keyboard indexing
  const flatItems: Array<
    | { type: "action"; item: (typeof actions)[0] }
    | { type: "collection"; item: Collection }
    | { type: "content"; item: Content }
  > = [
    ...filteredActions.map((act) => ({ type: "action" as const, item: act })),
    ...filteredCollections.map((col) => ({ type: "collection" as const, item: col })),
    ...filteredContents.map((con) => ({ type: "content" as const, item: con })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = flatItems[activeIndex];
      if (selected) {
        triggerItem(selected);
      }
    }
  };

  const triggerItem = (
    selected:
      | { type: "action"; item: (typeof actions)[0] }
      | { type: "collection"; item: Collection }
      | { type: "content"; item: Content }
  ) => {
    if (selected.type === "action") {
      selected.item.handler();
    } else if (selected.type === "collection") {
      onSwitchCollection(selected.item.id);
      onClose();
    } else if (selected.type === "content") {
      onSelectItem(selected.item);
      onClose();
    }
  };

  // Auto scroll focused item into view
  useEffect(() => {
    const activeEl = scrollContainerRef.current?.querySelector(`[data-active="true"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Background close overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main command palette body */}
      <div className="relative z-10 w-full max-w-2xl bg-brand-secondary/90 dark:bg-brand-secondary/80 border border-brand-border rounded-premium shadow-premium-lg overflow-hidden flex flex-col max-h-[50vh] backdrop-blur-xl">
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border shrink-0">
          <span className="text-brand-muted">
            <TypeIcon type="search" size={16} />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search saved items..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-muted font-medium"
          />
          <span className="text-[10px] font-bold text-brand-muted bg-brand-primary border border-brand-borderAccent rounded px-1.5 py-0.5 shrink-0 uppercase tracking-wider">
            ESC
          </span>
        </div>

        {/* Scrollable list content */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto p-2 space-y-4 flex-1 scrollbar-thin"
        >
          {flatItems.length === 0 ? (
            <div className="text-center py-8 text-xs font-bold text-brand-muted uppercase tracking-wider">
              No actions or resources match your query
            </div>
          ) : (
            <>
              {/* Actions Section */}
              {filteredActions.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[9px] font-extrabold text-brand-muted uppercase tracking-widest">
                    Quick Commands
                  </h4>
                  <div className="space-y-0.5 mt-1">
                    {filteredActions.map((act, i) => {
                      const overallIndex = i;
                      const isActive = activeIndex === overallIndex;
                      return (
                        <div
                          key={act.id}
                          data-active={isActive}
                          onClick={() => triggerItem({ type: "action", item: act })}
                          className={`flex items-center justify-between px-3 py-2 rounded-btn cursor-pointer transition-all ${
                            isActive
                              ? "bg-brand-accent text-white shadow-premium-sm"
                              : "hover:bg-brand-primary text-brand-text"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={isActive ? "text-white" : "text-brand-accent"}>
                              <TypeIcon type={act.icon} size={14} />
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{act.title}</div>
                              <div
                                className={`text-[10px] truncate ${
                                  isActive ? "text-white/80" : "text-brand-muted"
                                }`}
                              >
                                {act.subtitle}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-brand-primary text-brand-muted border border-brand-borderAccent"
                            }`}
                          >
                            Command
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Collections Section */}
              {filteredCollections.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[9px] font-extrabold text-brand-muted uppercase tracking-widest">
                    Collections Scope
                  </h4>
                  <div className="space-y-0.5 mt-1">
                    {filteredCollections.map((col, i) => {
                      const overallIndex = filteredActions.length + i;
                      const isActive = activeIndex === overallIndex;
                      return (
                        <div
                          key={col.id}
                          data-active={isActive}
                          onClick={() => triggerItem({ type: "collection", item: col })}
                          className={`flex items-center justify-between px-3 py-2 rounded-btn cursor-pointer transition-all ${
                            isActive
                              ? "bg-brand-accent text-white shadow-premium-sm"
                              : "hover:bg-brand-primary text-brand-text"
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className={isActive ? "text-white" : "text-brand-accent"}>
                              📁
                            </span>
                            <span className="text-xs font-bold truncate">{col.name}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-brand-primary text-brand-muted border border-brand-borderAccent"
                            }`}
                          >
                            Scope
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contents Section */}
              {filteredContents.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[9px] font-extrabold text-brand-muted uppercase tracking-widest">
                    Saved Resources
                  </h4>
                  <div className="space-y-0.5 mt-1">
                    {filteredContents.map((con, i) => {
                      const overallIndex = filteredActions.length + filteredCollections.length + i;
                      const isActive = activeIndex === overallIndex;
                      return (
                        <div
                          key={con.id}
                          data-active={isActive}
                          onClick={() => triggerItem({ type: "content", item: con })}
                          className={`flex items-center justify-between px-3 py-2 rounded-btn cursor-pointer transition-all ${
                            isActive
                              ? "bg-brand-accent text-white shadow-premium-sm"
                              : "hover:bg-brand-primary text-brand-text"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className={isActive ? "text-white" : "text-brand-accent"}>
                              <TypeIcon type={con.type} size={13} />
                            </span>
                            <span className="text-xs font-bold truncate">{con.title}</span>
                          </div>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-brand-primary text-brand-muted border border-brand-border"
                            }`}
                          >
                            {con.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-brand-border bg-brand-primary/45 flex items-center justify-between text-[9px] font-bold text-brand-muted uppercase tracking-wider shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ctrl + k to open anytime</span>
        </div>
      </div>
    </div>
  );
}
export default CommandPalette;
