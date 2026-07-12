import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { ContentCard } from "../components/content/ContentCard";
import { ContentGridSkeleton } from "../components/content/ContentCardSkeleton";
import { PreviewModal } from "../components/content/PreviewModal";
import { EmptyState } from "../components/ui/EmptyState";
import { Dropdown } from "../components/ui/Dropdown";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { CommandPalette } from "../components/ui/CommandPalette";
import { TypeIcon } from "../components/ui/TypeIcon";
import { contentService } from "../services/content.service";
import { collectionService } from "../services/collection.service";
import { useToast } from "../contexts/ToastContext";
import { getTypeStyle } from "../utils/thumbnail";
import type { Content, ContentType, ReadingStatus } from "../types/content";
import type { Collection } from "../types/collection";

export function DashboardPage() {
  const { addToast } = useToast();
  const location = useLocation();

  const [contents, setContents] = useState<Content[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Command Palette & view states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("dashboard-view-mode") as "grid" | "list") || "grid";
  });

  // Recently opened tracker (persisted in local state)
  const [recentlyOpened, setRecentlyOpened] = useState<Content[]>([]);

  // Filters state
  const [activeSidebarFilter, setActiveSidebarFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Preview Modal state
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Content Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formType, setFormType] = useState<ContentType>("Other");
  const [formCategory, setFormCategory] = useState("General");
  const [formFavorite, setFormFavorite] = useState(false);
  const [formCollectionId, setFormCollectionId] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formStatus, setFormStatus] = useState<ReadingStatus>("To Read");

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  // Sync viewMode changes to local storage
  useEffect(() => {
    localStorage.setItem("dashboard-view-mode", viewMode);
  }, [viewMode]);

  // Listen to sidebar changes from route state redirects
  useEffect(() => {
    if (location.state?.activeFilter) {
      setActiveSidebarFilter(location.state.activeFilter);
    }
  }, [location.state]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentData, collectionData] = await Promise.all([
        contentService.getContents(),
        collectionService.getCollections(),
      ]);
      setContents(contentData);
      setCollections(collectionData);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
      setError("Failed to load workspace. Please check backend connection.");
      addToast("Failed to load workspace data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openModal = useCallback((mode: "add" | "edit", content: Content | null = null) => {
    setModalMode(mode);
    setSelectedContent(content);
    if (mode === "edit" && content) {
      setFormTitle(content.title);
      setFormDescription(content.description);
      setFormLink(content.link);
      setFormType(content.type);
      setFormCategory(content.category);
      setFormFavorite(content.favorite);
      setFormCollectionId(content.collectionId || "");
      setFormTags(content.tags ? content.tags.join(", ") : "");
      setFormPinned(content.pinned);
      setFormStatus(content.status);
    } else {
      setFormTitle("");
      setFormDescription("");
      setFormLink("");
      setFormType("Other");
      setFormCategory("General");
      setFormFavorite(false);
      setFormCollectionId("");
      setFormTags("");
      setFormPinned(false);
      setFormStatus("To Read");
    }
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedContent(null);
  }, []);

  const openPreview = useCallback((content: Content) => {
    setPreviewContent(content);
    setIsPreviewOpen(true);
    // Track recently opened items (prevent duplicates, keep last 4)
    setRecentlyOpened((prev) => {
      const filtered = prev.filter((item) => item.id !== content.id);
      return [content, ...filtered].slice(0, 4);
    });
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewContent(null);
  }, []);

  // Keyboard Shortcuts implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes any open modal
      if (e.key === "Escape") {
        closeModal();
        closePreview();
        setIsCommandPaletteOpen(false);
      }

      // Bypass shortcut checks if the user is typing in an input
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      if (isTyping) return;

      // Ctrl + K to toggle command palette
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // '/' key to focus search
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }

      // 'N' to open Add Content modal
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openModal("add");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, closePreview, openModal]);

  // Collection CRUD handlers
  const handleCreateCollection = async (name: string) => {
    try {
      const newColl = await collectionService.createCollection(name);
      setCollections((prev) => [...prev, newColl]);
      addToast(`Collection "${name}" created successfully.`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to create collection", "error");
      throw err;
    }
  };

  const handleRenameCollection = async (id: string, name: string) => {
    try {
      const updated = await collectionService.updateCollection(id, name);
      setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      addToast(`Collection renamed to "${name}".`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to rename collection", "error");
      throw err;
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await collectionService.deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      setContents((prev) =>
        prev.map((c) => (c.collectionId === id ? { ...c, collectionId: undefined } : c))
      );
      addToast("Collection deleted successfully.", "success");
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to delete collection", "error");
      throw err;
    }
  };

  // Card toggle updates
  const handleToggleFavorite = async (content: Content) => {
    try {
      const updated = await contentService.updateContent(content.id, {
        favorite: !content.favorite,
      });
      setContents((prev) => prev.map((c) => (c.id === content.id ? updated : c)));
      addToast(updated.favorite ? "Added to favorites ★" : "Removed from favorites ☆", "success");
    } catch (err) {
      console.error("Failed to toggle favorite status:", err);
      addToast("Failed to update favorite status.", "error");
    }
  };

  const handleTogglePin = async (content: Content) => {
    try {
      const updated = await contentService.updateContent(content.id, {
        pinned: !content.pinned,
      });
      setContents((prev) => prev.map((c) => (c.id === content.id ? updated : c)));
      addToast(updated.pinned ? "Pinned content to top 📌" : "Unpinned content 📌", "success");
    } catch (err) {
      console.error("Failed to toggle pinned status:", err);
      addToast("Failed to update pinned status.", "error");
    }
  };

  const handleStatusChange = async (content: Content, newStatus: ReadingStatus) => {
    try {
      const updated = await contentService.updateContent(content.id, {
        status: newStatus,
      });
      setContents((prev) => prev.map((c) => (c.id === content.id ? updated : c)));
      addToast(`Reading status updated to "${newStatus}"`, "success");
    } catch (err) {
      console.error("Failed to change reading status:", err);
      addToast("Failed to update status.", "error");
    }
  };

  // Dynamic calculations
  const uniqueCategories = useMemo(() => {
    const categories = contents.map((c) => c.category).filter(Boolean);
    return ["All", ...Array.from(new Set(categories))];
  }, [contents]);

  const categoryOptions = useMemo(() => {
    return uniqueCategories.map((cat) => ({
      label: cat === "All" ? "All Categories" : cat,
      value: cat,
    }));
  }, [uniqueCategories]);

  const stats = useMemo(() => {
    const total = contents.length;
    const completed = contents.filter((c) => c.status === "Completed").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      favorites: contents.filter((c) => c.favorite).length,
      pinned: contents.filter((c) => c.pinned).length,
      collections: collections.length,
      toRead: contents.filter((c) => c.status === "To Read").length,
      reading: contents.filter((c) => c.status === "Reading").length,
      completed,
      completionRate: percentage,
      streak: total > 0 ? Math.min(7, Math.ceil(total / 2)) : 0, // Mock streak count
    };
  }, [contents, collections]);

  const recentItems = useMemo(() => {
    return [...contents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [contents]);

  const continueReadingItems = useMemo(() => {
    return contents
      .filter((c) => c.status === "Reading")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [contents]);

  const recentCollections = useMemo(() => {
    return [...collections]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [collections]);

  // Combined filters
  const filteredContents = useMemo(() => {
    let result = [...contents];

    // 1. Sidebar Filter
    if (activeSidebarFilter !== "All") {
      if (activeSidebarFilter === "Favorites") {
        result = result.filter((c) => c.favorite);
      } else if (activeSidebarFilter === "Pinned") {
        result = result.filter((c) => c.pinned);
      } else {
        const sidebarMap: Record<string, string> = {
          YouTube: "YouTube",
          GitHub: "GitHub",
          Twitter: "Twitter / X",
          LinkedIn: "LinkedIn",
          Notes: "Notes",
          PDF: "PDF",
          Images: "Image",
          Documents: "Document",
          Websites: "Website",
        };
        const mappedType = sidebarMap[activeSidebarFilter];
        if (mappedType) {
          result = result.filter((c) => c.type === mappedType);
        } else {
          const isCollectionId = collections.some((col) => col.id === activeSidebarFilter);
          if (isCollectionId) {
            result = result.filter((c) => c.collectionId === activeSidebarFilter);
          } else {
            result = result.filter((c) => c.tags?.includes(activeSidebarFilter));
          }
        }
      }
    }

    // 2. Category Dropdown
    if (selectedCategory !== "All") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // 3. Status Dropdown
    if (selectedStatus !== "All") {
      result = result.filter((c) => c.status === selectedStatus);
    }

    // 4. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const collName = collections.find((col) => col.id === c.collectionId)?.name || "";
        const tagsStr = c.tags ? c.tags.join(" ") : "";
        return (
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query) ||
          c.status.toLowerCase().includes(query) ||
          collName.toLowerCase().includes(query) ||
          tagsStr.toLowerCase().includes(query)
        );
      });
    }

    // 5. Pinning + Custom Sorting
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (selectedSort === "Newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (selectedSort === "Oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (selectedSort === "Alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [contents, activeSidebarFilter, selectedCategory, selectedStatus, searchQuery, selectedSort, collections]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Title is required");
      return;
    }

    setSaving(true);
    setFormError(null);

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim().replace(/#/g, ""))
      .filter((t) => t.length > 0);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      link: formLink.trim(),
      type: formType,
      category: formCategory.trim() || "General",
      favorite: formFavorite,
      collectionId: formCollectionId || null,
      tags: tagsArray,
      pinned: formPinned,
      status: formStatus,
    };

    try {
      if (modalMode === "add") {
        const newContent = await contentService.createContent(payload);
        setContents((prev) => [newContent, ...prev]);
        addToast(`Content "${payload.title}" created successfully.`, "success");
      } else if (modalMode === "edit" && selectedContent) {
        const updated = await contentService.updateContent(selectedContent.id, payload);
        setContents((prev) => prev.map((c) => (c.id === selectedContent.id ? updated : c)));
        addToast(`Content "${payload.title}" updated successfully.`, "success");
      }
      closeModal();
    } catch (err: any) {
      console.error("Error saving content:", err);
      setFormError(err.response?.data?.message || "Failed to save content.");
      addToast("Failed to save content.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (content: Content) => {
    try {
      await contentService.deleteContent(content.id);
      setContents((prev) => prev.filter((c) => c.id !== content.id));
      addToast(`Content "${content.title}" deleted.`, "success");
    } catch (err) {
      console.error("Failed to delete content:", err);
      addToast("Failed to delete content.", "error");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveSidebarFilter("All");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedSort("Newest");
    addToast("Filters reset successfully", "info");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Options mappings
  const typeOptions = [
    { label: "YouTube", value: "YouTube" },
    { label: "Twitter / X", value: "Twitter / X" },
    { label: "GitHub", value: "GitHub" },
    { label: "LinkedIn", value: "LinkedIn" },
    { label: "Website", value: "Website" },
    { label: "Article", value: "Article" },
    { label: "Notes", value: "Notes" },
    { label: "PDF", value: "PDF" },
    { label: "Image", value: "Image" },
    { label: "Document", value: "Document" },
    { label: "Other", value: "Other" },
  ];

  const collectionOptions = useMemo(() => {
    return [{ label: "None", value: "" }, ...collections.map((c) => ({ label: c.name, value: c.id }))];
  }, [collections]);

  const statusFilterOptions = [
    { label: "All Statuses", value: "All" },
    { label: "To Read", value: "To Read" },
    { label: "Reading", value: "Reading" },
    { label: "Completed", value: "Completed" },
  ];

  const statusFormOptions = [
    { label: "To Read", value: "To Read" },
    { label: "Reading", value: "Reading" },
    { label: "Completed", value: "Completed" },
  ];

  const sortOptions = [
    { label: "Newest First", value: "Newest" },
    { label: "Oldest First", value: "Oldest" },
    { label: "Alphabetical", value: "Alphabetical" },
  ];

  if (loading) {
    return (
      <Layout
        activeFilter={activeSidebarFilter}
        onFilterChange={setActiveSidebarFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="space-y-6">
          <div className="h-44 bg-brand-borderAccent/30 rounded-premium animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-premium border border-brand-border bg-brand-secondary p-6 shadow-premium-sm">
                <ContentGridSkeleton />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="h-44 bg-brand-borderAccent/30 rounded-premium animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      activeFilter={activeSidebarFilter}
      onFilterChange={setActiveSidebarFilter}
      collections={collections}
      contents={contents}
      onCreateCollection={handleCreateCollection}
      onRenameCollection={handleRenameCollection}
      onDeleteCollection={handleDeleteCollection}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onQuickAdd={() => openModal("add")}
    >
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Apple-inspired Hero & Primary CTA block */}
        <section className="bg-gradient-to-r from-brand-secondary via-brand-secondary to-brand-accent/5 border border-brand-border p-8 rounded-premium shadow-premium-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
          {/* Subtle grid decor */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50" />
          <div className="space-y-2.5 z-10">
            <h1 className="text-3xl font-black text-brand-text tracking-tight">
              {getGreeting()}, {localStorage.getItem("username") || "Lakshay"} 👋
            </h1>
            <p className="text-sm font-bold text-brand-accent uppercase tracking-widest mt-1">
              Your Second Brain Workspace
            </p>
            <p className="text-xs text-brand-sub max-w-lg leading-relaxed font-semibold">
              Capture everything. Remember anything. Learn faster. Organize your personal repository of notes, YouTube clips, GitHub codebases, and articles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <button
              onClick={() => openModal("add")}
              className="bg-brand-accent hover:bg-brand-accentHover text-white px-5 py-3 rounded-premium text-xs font-black shadow-premium-md hover:shadow-premium-lg hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <TypeIcon type="plus" size={13} />
              <span>Save Resource</span>
            </button>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="bg-brand-primary border border-brand-borderAccent hover:border-brand-accent/30 text-brand-text px-4 py-3 rounded-premium text-xs font-bold shadow-premium-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <TypeIcon type="search" size={13} />
              <span>Search Command</span>
              <kbd className="text-[9px] text-brand-muted bg-brand-secondary px-1.5 py-0.5 rounded border border-brand-border font-mono uppercase">
                ctrl+k
              </kbd>
            </button>
          </div>
        </section>

        {/* Visual Progress Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Completion Progress Ring Card */}
          <div className="bg-brand-secondary border border-brand-border p-5 rounded-premium shadow-premium-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                Reading Completion
              </span>
              <h3 className="text-xl font-black text-brand-text leading-tight">
                {stats.completed} Completed
              </h3>
              <p className="text-[10px] font-semibold text-brand-sub leading-normal">
                {stats.total - stats.completed} items remaining on your backlog lists.
              </p>
            </div>
            {/* SVG progress ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-brand-primary border"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-accent transition-all duration-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${stats.completionRate}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-brand-text">
                {stats.completionRate}%
              </div>
            </div>
          </div>

          {/* Resources breakdown bar card */}
          <div className="bg-brand-secondary border border-brand-border p-5 rounded-premium shadow-premium-sm flex items-center justify-between gap-4">
            <div className="space-y-1 w-full">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                Brain Metrics
              </span>
              <h3 className="text-xl font-black text-brand-text leading-tight">
                {stats.total} Total Items
              </h3>
              {/* Micro-bar metrics */}
              <div className="w-full bg-brand-primary h-2 rounded-full overflow-hidden mt-3 flex border border-brand-border">
                <div
                  className="bg-brand-accent h-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.favorites / stats.total) * 100 : 0}%` }}
                  title="Favorites"
                />
                <div
                  className="bg-yellow-500 h-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.pinned / stats.total) * 100 : 0}%` }}
                  title="Pinned"
                />
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  title="Completed"
                />
              </div>
              <div className="flex items-center justify-between text-[8px] font-extrabold text-brand-muted uppercase tracking-wider mt-1.5">
                <span>★ {stats.favorites} Favs</span>
                <span>📌 {stats.pinned} Pins</span>
                <span>✓ {stats.completed} Done</span>
              </div>
            </div>
          </div>

          {/* Streak & Saved stats card */}
          <div className="bg-brand-secondary border border-brand-border p-5 rounded-premium shadow-premium-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                Reading Streak
              </span>
              <h3 className="text-xl font-black text-brand-text leading-tight">
                {stats.streak} Days Active
              </h3>
              <p className="text-[10px] font-semibold text-brand-sub leading-normal">
                Saved {stats.total} links, notes and references in this node.
              </p>
            </div>
            <div className="text-3xl p-3 rounded-premium bg-brand-primary border border-brand-borderAccent shadow-inner select-none">
              🔥
            </div>
          </div>
        </section>

        {/* Workspace Hub Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left panel: cards database grid */}
          <div className="lg:col-span-3 space-y-5">
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-5 shadow-premium-sm">
              
              {/* Notion-style database toolbar header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-brand-border">
                <div>
                  <h2 className="text-xs font-black text-brand-text tracking-widest uppercase">Workspace Hub</h2>
                  <p className="text-[9px] font-bold text-brand-muted mt-0.5 uppercase tracking-wider">
                    Current Scope: <span className="text-brand-accent">{activeSidebarFilter}</span>
                  </p>
                </div>
                {contents.length > 0 && (
                  <Button
                    title="Add Content"
                    variant="primary"
                    size="md"
                    startIcon={<TypeIcon type="plus" size={12} />}
                    onClick={() => openModal("add")}
                  />
                )}
              </div>

              {error && (
                <div className="mb-5 rounded-premium bg-red-500/5 border border-red-500/20 p-3.5 text-xs text-red-500 font-bold">
                  {error}
                </div>
              )}

              {contents.length === 0 ? (
                <EmptyState
                  type="content"
                  action={
                    <Button
                      title="Add Content"
                      variant="primary"
                      size="md"
                      startIcon={<TypeIcon type="plus" size={12} />}
                      onClick={() => openModal("add")}
                    />
                  }
                />
              ) : (
                <>
                  {/* Notion database toolbar controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-primary border border-brand-border p-3 rounded-btn shadow-premium-sm mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">Category</span>
                        <Dropdown
                          label="All Categories"
                          options={categoryOptions}
                          selectedOption={selectedCategory}
                          onSelect={setSelectedCategory}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">Status</span>
                        <Dropdown
                          label="All Statuses"
                          options={statusFilterOptions}
                          selectedOption={selectedStatus}
                          onSelect={setSelectedStatus}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">Sort</span>
                        <Dropdown
                          label="Sort By"
                          options={sortOptions}
                          selectedOption={selectedSort}
                          onSelect={setSelectedSort}
                        />
                      </div>
                    </div>

                    {/* View mode switcher */}
                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">
                        {filteredContents.length} Results
                      </span>

                      <div className="flex items-center border border-brand-borderAccent rounded-lg p-0.5 bg-brand-secondary shadow-premium-sm">
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${
                            viewMode === "grid"
                              ? "bg-brand-primary text-brand-accent shadow-premium-sm"
                              : "text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          Grid
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${
                            viewMode === "list"
                              ? "bg-brand-primary text-brand-accent shadow-premium-sm"
                              : "text-brand-muted hover:text-brand-text"
                          }`}
                        >
                          List
                        </button>
                      </div>

                      {(searchQuery ||
                        activeSidebarFilter !== "All" ||
                        selectedCategory !== "All" ||
                        selectedStatus !== "All") && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="text-[9px] font-bold text-brand-accent hover:text-brand-accentHover"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Grid/List switcher render */}
                  {filteredContents.length === 0 ? (
                    <EmptyState
                      type="search"
                      action={
                        <Button
                          title="Clear Search & Filters"
                          variant="secondary"
                          size="sm"
                          onClick={clearAllFilters}
                        />
                      }
                    />
                  ) : viewMode === "list" ? (
                    <div className="flex flex-col gap-2.5">
                      {filteredContents.map((item) => (
                        <ContentCard
                          key={item.id}
                          content={item}
                          collections={collections}
                          onEdit={(content) => openModal("edit", content)}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                          onStatusChange={handleStatusChange}
                          onPreviewClick={openPreview}
                          searchQuery={searchQuery}
                          viewMode="list"
                        />
                      ))}
                    </div>
                  ) : (
                    /* Staggered masonry grid layout using dynamic spans */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredContents.map((item, idx) => {
                        // Stagger cards: make YouTube or Notes cards take 2 columns on larger screens
                        const isStaggered =
                          idx % 5 === 0 && (item.type === "YouTube" || item.type === "Notes");
                        return (
                          <div
                            key={item.id}
                            className={isStaggered ? "sm:col-span-2" : "col-span-1"}
                          >
                            <ContentCard
                              content={item}
                              collections={collections}
                              onEdit={(content) => openModal("edit", content)}
                              onDelete={handleDelete}
                              onToggleFavorite={handleToggleFavorite}
                              onTogglePin={handleTogglePin}
                              onStatusChange={handleStatusChange}
                              onPreviewClick={openPreview}
                              searchQuery={searchQuery}
                              viewMode="grid"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel widgets list */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Continue Reading Widget */}
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-5 shadow-premium-sm space-y-4">
              <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-1.5 border-b border-brand-border pb-2">
                <TypeIcon type="clock" size={12} />
                <span>Continue Reading</span>
              </h3>
              {continueReadingItems.length === 0 ? (
                <div className="text-[10px] text-brand-muted italic py-6 text-center border border-dashed border-brand-borderAccent rounded-premium bg-brand-primary/40">
                  No items in progress.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {continueReadingItems.map((item) => {
                    const style = getTypeStyle(item.type);
                    return (
                      <div
                        key={item.id}
                        onClick={() => openPreview(item)}
                        className="p-3 bg-brand-primary hover:bg-brand-secondary border border-brand-border hover:border-brand-accent/25 rounded-btn shadow-premium-sm transition-all duration-200 flex items-center gap-2.5 cursor-pointer group animate-fade-in"
                      >
                        <span className={`p-1.5 rounded-lg ${style.bgColor} text-${style.accentColor} shrink-0`}>
                          <TypeIcon type={item.type} size={12} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-brand-text group-hover:text-brand-accent transition-colors truncate">
                            {item.title}
                          </h4>
                          <span className="text-[8px] font-extrabold text-brand-muted uppercase mt-0.5 block">
                            Reading &bull; {item.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timeline Widget (Recently Saved / Edited / Opened logs) */}
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-5 shadow-premium-sm space-y-4">
              <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-1.5 border-b border-brand-border pb-2">
                <span>⚡ Recent Activity</span>
              </h3>
              {recentlyOpened.length === 0 && recentItems.length === 0 ? (
                <div className="text-[10px] text-brand-muted italic py-6 text-center border border-dashed border-brand-borderAccent rounded-premium bg-brand-primary/40">
                  No activity log.
                </div>
              ) : (
                <div className="relative border-l border-brand-borderAccent pl-3.5 ml-2.5 space-y-5">
                  {recentlyOpened.slice(0, 2).map((item) => (
                    <div key={`opened-${item.id}`} className="relative group text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-[19.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-accent border border-brand-secondary shrink-0" />
                      <div className="font-bold text-brand-text group-hover:text-brand-accent transition-colors cursor-pointer truncate" onClick={() => openPreview(item)}>
                        Opened: {item.title}
                      </div>
                      <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block mt-0.5">
                        Just Now
                      </span>
                    </div>
                  ))}
                  {recentItems.slice(0, 3).map((item) => (
                    <div key={`saved-${item.id}`} className="relative group text-xs">
                      <span className="absolute -left-[19.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-borderAccent border border-brand-secondary shrink-0" />
                      <div className="font-bold text-brand-text group-hover:text-brand-accent transition-colors cursor-pointer truncate" onClick={() => openPreview(item)}>
                        Saved: {item.title}
                      </div>
                      <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Collections Widget */}
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-5 shadow-premium-sm space-y-4">
              <h3 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-1.5 border-b border-brand-border pb-2">
                <TypeIcon type="collection" size={12} />
                <span>Recent Collections</span>
              </h3>
              {recentCollections.length === 0 ? (
                <div className="text-[10px] text-brand-muted italic py-6 text-center border border-dashed border-brand-borderAccent rounded-premium bg-brand-primary/40">
                  No collections created.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentCollections.map((coll) => (
                    <div
                      key={coll.id}
                      onClick={() => setActiveSidebarFilter(coll.id)}
                      className="p-3 bg-brand-primary hover:bg-brand-secondary border border-brand-border hover:border-brand-accent/25 rounded-btn shadow-premium-sm transition-all duration-200 flex items-center gap-2.5 cursor-pointer group"
                    >
                      <span className="p-1.5 rounded-lg bg-brand-accentLight text-brand-accent shrink-0 border border-brand-border">
                        <TypeIcon type="collection" size={12} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-brand-text group-hover:text-brand-accent transition-colors truncate">
                          {coll.name}
                        </h4>
                        <span className="text-[8px] font-bold text-brand-muted uppercase mt-0.5 block">
                          Created{" "}
                          {new Date(coll.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Add / Edit Content Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "add" ? "Create New Item" : "Edit Workspace Item"}
      >
        <form onSubmit={handleSave}>
          <fieldset disabled={saving} className="space-y-4 max-h-[65vh] overflow-y-auto px-1 scrollbar-thin">
            <Input label="Title" placeholder="Enter resource title" value={formTitle} onChange={setFormTitle} required />

            <Input
              label="Description"
              placeholder="Enter resource description (optional)"
              value={formDescription}
              onChange={setFormDescription}
            />

            <Input
              label="URL / Link"
              placeholder="Enter resource link (optional, e.g. https://...)"
              value={formLink}
              onChange={setFormLink}
            />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-brand-sub uppercase tracking-wider">Content Type</span>
              <Dropdown
                label="Select Type"
                options={typeOptions}
                selectedOption={formType}
                onSelect={(val) => setFormType(val as ContentType)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-brand-sub uppercase tracking-wider">Target Collection</span>
              <Dropdown
                label="Select Collection"
                options={collectionOptions}
                selectedOption={formCollectionId}
                onSelect={setFormCollectionId}
              />
            </div>

            <Input
              label="Tags"
              placeholder="React, CSS, Dev (comma separated tags)"
              value={formTags}
              onChange={setFormTags}
            />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-brand-sub uppercase tracking-wider">Reading Progress Status</span>
              <Dropdown
                label="Select Status"
                options={statusFormOptions}
                selectedOption={formStatus}
                onSelect={(val) => setFormStatus(val as ReadingStatus)}
              />
            </div>

            <Input
              label="Category Name"
              placeholder="Enter custom category (default: General)"
              value={formCategory}
              onChange={setFormCategory}
            />

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-brand-sub cursor-pointer select-none uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={formFavorite}
                  onChange={(e) => setFormFavorite(e.target.checked)}
                  className="rounded border-brand-borderAccent bg-brand-primary text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-secondary h-4 w-4"
                />
                <span>Mark as Favorite</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-brand-sub cursor-pointer select-none uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  className="rounded border-brand-borderAccent bg-brand-primary text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-secondary h-4 w-4"
                />
                <span>📌 Pin to Top</span>
              </label>
            </div>

            {formError && <div className="text-xs font-semibold text-red-500">{formError}</div>}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-brand-border bg-brand-secondary sticky bottom-0 z-10">
              <Button title="Cancel" variant="secondary" size="md" onClick={closeModal} />
              <Button
                title={saving ? "Saving..." : "Save"}
                variant="primary"
                size="md"
                type="submit"
                loading={saving}
              />
            </div>
          </fieldset>
        </form>
      </Modal>

      {/* Keyboard-friendly Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        contents={contents}
        collections={collections}
        onSelectItem={openPreview}
        onQuickAdd={() => openModal("add")}
        onSwitchCollection={(collectionId) => setActiveSidebarFilter(collectionId)}
        onClearFilters={clearAllFilters}
      />

      {/* Media Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        content={previewContent}
        collections={collections}
      />
    </Layout>
  );
}

export default DashboardPage;
