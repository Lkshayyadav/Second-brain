import { ReactNode } from "react";

type EmptyStateType = "content" | "search" | "favorites" | "collections" | "pinned";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const getIllustration = () => {
    switch (type) {
      case "search":
        return (
          <svg className="w-20 h-20 text-brand-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16" y2="16" />
            <line x1="8" y1="11" x2="14" y2="11" />
            <line x1="11" y1="8" x2="11" y2="14" />
          </svg>
        );
      case "favorites":
        return (
          <svg className="w-20 h-20 text-brand-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </svg>
        );
      case "pinned":
        return (
          <svg className="w-20 h-20 text-brand-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="8" x2="22" y2="8" />
            <path d="M12 2v8H4V2z" />
            <path d="M9 10v10l3 2 3-2V10" />
            <line x1="2" y1="18" x2="22" y2="18" />
          </svg>
        );
      case "collections":
        return (
          <svg className="w-20 h-20 text-brand-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="3" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </svg>
        );
      case "content":
      default:
        return (
          <svg className="w-20 h-20 text-brand-muted/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M12 6V12L16 14" />
            <path d="M8 2h8" />
          </svg>
        );
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "search":
        return "No matches found";
      case "favorites":
        return "No favorites yet";
      case "pinned":
        return "No pinned items yet";
      case "collections":
        return "No collections created";
      case "content":
      default:
        return "Your Brain is empty";
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case "search":
        return "We couldn't find anything matching your search term. Try adjusting your query or resetting filters.";
      case "favorites":
        return "Items you mark as favorite with a star will appear here for quick access.";
      case "pinned":
        return "Items you pin to the top of your dashboard will show up in this space.";
      case "collections":
        return "Group your articles, notes, and references into organized collections.";
      case "content":
      default:
        return "Start saving resources, articles, notes, or YouTube videos to build your Second Brain.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-brand-secondary rounded-premium border border-dashed border-brand-borderAccent animate-fade-in shadow-premium-sm">
      <div className="mb-4 flex justify-center">{getIllustration()}</div>
      <h3 className="text-sm font-bold text-brand-text mb-1">{title || getDefaultTitle()}</h3>
      <p className="text-xs text-brand-sub max-w-sm mb-5 leading-relaxed">
        {description || getDefaultDescription()}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

export default EmptyState;
