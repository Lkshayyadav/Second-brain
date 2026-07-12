import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ConfirmModal } from "../ui/ConfirmModal";
import { TypeIcon } from "../ui/TypeIcon";
import { getTypeStyle } from "../../utils/thumbnail";
import type { Collection } from "../../types/collection";
import type { Content } from "../../types/content";

interface SidebarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  collections?: Collection[];
  contents?: Content[];
  onCreateCollection?: (name: string) => Promise<void>;
  onRenameCollection?: (id: string, name: string) => Promise<void>;
  onDeleteCollection?: (id: string) => Promise<void>;
}

const typeItems = [
  { name: "YouTube", label: "YouTube", icon: "YouTube" as const },
  { name: "GitHub", label: "GitHub", icon: "GitHub" as const },
  { name: "Twitter", label: "Twitter / X", icon: "Twitter" as const },
  { name: "LinkedIn", label: "LinkedIn", icon: "LinkedIn" as const },
  { name: "Websites", label: "Websites", icon: "Website" as const },
  { name: "Article", label: "Articles", icon: "Article" as const },
  { name: "Notes", label: "Notes", icon: "Notes" as const },
  { name: "PDF", label: "PDFs", icon: "PDF" as const },
  { name: "Images", label: "Images", icon: "Image" as const },
  { name: "Documents", label: "Documents", icon: "Document" as const },
];

export function Sidebar({
  activeFilter = "All",
  onFilterChange,
  collections = [],
  contents = [],
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";

  // Persistent collapsible state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const username = localStorage.getItem("username") || "Lakshay";

  // Collection deletion state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [collToDelete, setCollToDelete] = useState<{ id: string; name: string } | null>(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleFilterClick = (filter: string) => {
    if (isSettingsPage) {
      navigate("/dashboard", { state: { activeFilter: filter } });
    } else {
      onFilterChange?.(filter);
    }
  };

  const handleAddCollection = async () => {
    const name = window.prompt("Enter new collection name:");
    if (name && name.trim()) {
      try {
        await onCreateCollection?.(name.trim());
      } catch (err) {
        console.error("Error creating collection:", err);
      }
    }
  };

  const handleRenameCollection = async (id: string, currentName: string) => {
    const name = window.prompt("Rename collection to:", currentName);
    if (name && name.trim() && name.trim() !== currentName) {
      try {
        await onRenameCollection?.(id, name.trim());
      } catch (err) {
        console.error("Error renaming collection:", err);
      }
    }
  };

  const handleDeleteCollectionClick = (id: string, name: string) => {
    setCollToDelete({ id, name });
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteCollection = async () => {
    if (collToDelete) {
      try {
        await onDeleteCollection?.(collToDelete.id);
        if (activeFilter === collToDelete.id) {
          handleFilterClick("All");
        }
      } catch (err) {
        console.error("Error deleting collection:", err);
      } finally {
        setCollToDelete(null);
      }
    }
  };

  // Extract unique tags dynamically
  const popularTags = useMemo(() => {
    if (!contents || contents.length === 0) return [];
    const allTags = contents.flatMap((c) => c.tags || []);
    const counts: Record<string, number> = {};
    allTags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 6);
  }, [contents]);

  return (
    <aside
      className={`hidden h-screen border-r border-brand-border bg-brand-secondary p-4 lg:flex flex-col sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand logo & collapse switch */}
      <div className="flex items-center justify-between mb-6 px-2 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 font-extrabold text-brand-text text-base">
            <span className="text-xl">🧠</span>
            <span className="tracking-tight bg-gradient-to-r from-brand-accent to-purple-600 bg-clip-text text-transparent">
              Brainly
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="text-xl font-bold text-center w-full">🧠</div>
        )}
        <button
          onClick={toggleCollapse}
          className={`p-1.5 rounded-lg border border-brand-borderAccent hover:bg-brand-primary text-brand-sub hover:text-brand-text transition-colors duration-200 focus:outline-none ${
            isCollapsed ? "mx-auto mt-2" : ""
          }`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Scrollable menu content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 -mr-1.5 scrollbar-thin">
        {/* Core Nav */}
        <div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-2.5 px-3">
              Navigation
            </span>
          )}
          <nav className="space-y-1">
            {[
              { name: "All", label: "Dashboard", icon: "collection" as const },
              { name: "Favorites", label: "Favorites", icon: "star-filled" as const },
              { name: "Pinned", label: "Pinned", icon: "pin" as const },
            ].map((item) => {
              const isActive = !isSettingsPage && activeFilter === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleFilterClick(item.name)}
                  className={`flex items-center w-full text-left rounded-btn px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-brand-accentLight text-brand-accent shadow-premium-sm border-l-4 border-brand-accent pl-2"
                      : "text-brand-sub hover:bg-brand-primary hover:text-brand-text border-l-4 border-transparent"
                  }`}
                  title={item.label}
                >
                  <span className={`${isActive ? "text-brand-accent" : "text-brand-muted"} mr-2.5`}>
                    <TypeIcon type={item.icon} size={15} />
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collections Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-3 shrink-0">
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                Collections
              </span>
            )}
            {!isCollapsed && (
              <button
                type="button"
                onClick={handleAddCollection}
                className="text-[10px] font-bold text-brand-accent hover:text-brand-accentHover"
                title="Create Collection"
              >
                + Add
              </button>
            )}
            {isCollapsed && (
              <button
                type="button"
                onClick={handleAddCollection}
                className="mx-auto text-brand-accent"
                title="Add Collection"
              >
                +
              </button>
            )}
          </div>

          {collections.length === 0 ? (
            !isCollapsed && (
              <div className="px-3 py-2 text-[10px] text-brand-muted italic">
                No collections yet.
              </div>
            )
          ) : (
            <nav className="space-y-1">
              {collections.map((coll) => {
                const isActive = !isSettingsPage && activeFilter === coll.id;
                return (
                  <div
                    key={coll.id}
                    className={`flex items-center justify-between group rounded-btn px-3 py-1 text-xs transition-colors ${
                      isActive
                        ? "bg-brand-accentLight text-brand-accent font-semibold"
                        : "text-brand-sub hover:bg-brand-primary hover:text-brand-text"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleFilterClick(coll.id)}
                      className="flex-1 text-left py-1 text-xs outline-none break-all line-clamp-1 flex items-center"
                      title={coll.name}
                    >
                      <span className="mr-2.5 text-brand-muted">📁</span>
                      {!isCollapsed && <span>{coll.name}</span>}
                    </button>
                    {!isCollapsed && (
                      <div className="hidden group-hover:flex items-center gap-1.5 ml-2">
                        <button
                          type="button"
                          onClick={() => handleRenameCollection(coll.id, coll.name)}
                          className="text-[10px] text-brand-muted hover:text-brand-text"
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollectionClick(coll.id, coll.name)}
                          className="text-[10px] text-brand-muted hover:text-red-500"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* Content Types Section */}
        <div>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-2.5 px-3">
              Content Types
            </span>
          )}
          <nav className="space-y-1">
            {typeItems.map((item) => {
              const filterValue =
                item.name === "Websites"
                  ? "Websites"
                  : item.name === "Images"
                  ? "Images"
                  : item.name === "Documents"
                  ? "Documents"
                  : item.name === "Twitter"
                  ? "Twitter"
                  : item.name;
              const isActive = !isSettingsPage && activeFilter === filterValue;
              const style = getTypeStyle(
                item.name === "Websites"
                  ? "Website"
                  : item.name === "Images"
                  ? "Image"
                  : item.name === "Documents"
                  ? "Document"
                  : item.name === "Twitter"
                  ? "Twitter / X"
                  : (item.name as any)
              );

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleFilterClick(filterValue)}
                  className={`flex items-center w-full text-left rounded-btn px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "bg-brand-accentLight text-brand-accent font-semibold"
                      : "text-brand-sub hover:bg-brand-primary hover:text-brand-text"
                  }`}
                  title={item.label}
                >
                  <span className={`mr-2.5 text-${style.accentColor}`}>
                    <TypeIcon type={item.icon} size={13} />
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Popular Tags Section */}
        {!isCollapsed && popularTags.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-2.5 px-3">
              Popular Tags
            </span>
            <div className="flex flex-wrap gap-1 px-3">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleFilterClick(tag)}
                  className="bg-brand-primary hover:bg-brand-borderAccent border border-brand-border rounded px-2 py-0.5 text-[10px] font-bold text-brand-sub hover:text-brand-text transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Profile card */}
      <div className="pt-4 border-t border-brand-border mt-auto shrink-0 space-y-2">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className={`w-full flex items-center rounded-btn px-3 py-2 text-xs font-semibold transition-colors ${
            isSettingsPage
              ? "bg-brand-accentLight text-brand-accent"
              : "text-brand-sub hover:bg-brand-primary hover:text-brand-text"
          }`}
          title="Settings"
        >
          <span className="text-brand-muted mr-2.5">
            <TypeIcon type="user" size={15} />
          </span>
          {!isCollapsed && <span>Account Settings</span>}
        </button>

        {/* Profile Card details */}
        <div className="bg-brand-primary border border-brand-border p-2.5 rounded-premium flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white text-xs font-black shadow-premium-sm uppercase">
            {username.slice(0, 2)}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-brand-text truncate leading-tight">
                {username}
              </p>
              <p className="text-[9px] font-medium text-brand-muted truncate leading-none mt-0.5">
                Pro Subscriber
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Collection Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setCollToDelete(null);
        }}
        onConfirm={handleConfirmDeleteCollection}
        title="Delete Collection?"
        message={`Are you sure you want to delete collection "${collToDelete?.name}"? Any content items belonging to this collection will be kept but unassigned.`}
        confirmText="Delete"
        type="danger"
      />
    </aside>
  );
}

export default Sidebar;
