import { useState } from "react";
import { ConfirmModal } from "../ui/ConfirmModal";
import type { Content, ReadingStatus } from "../../types/content";
import type { Collection } from "../../types/collection";
import { getThumbnailUrl, getTypeStyle, getFavicon } from "../../utils/thumbnail";
import { TypeIcon } from "../ui/TypeIcon";
import { useToast } from "../../contexts/ToastContext";

interface ContentCardProps {
  content: Content;
  collections: Collection[];
  onEdit: (content: Content) => void;
  onDelete: (content: Content) => void;
  onToggleFavorite: (content: Content) => void;
  onTogglePin: (content: Content) => void;
  onStatusChange: (content: Content, status: ReadingStatus) => void;
  onPreviewClick: (content: Content) => void;
  searchQuery?: string;
  viewMode?: "grid" | "list";
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, search: string | undefined) {
  if (!search || !search.trim()) return <>{text}</>;
  const query = search.trim();
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-brand-accent/20 text-brand-accent rounded-sm px-0.5 font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function ContentCard({
  content,
  collections,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onStatusChange,
  onPreviewClick,
  searchQuery,
  viewMode = "grid",
}: ContentCardProps) {
  const { addToast } = useToast();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedDate = new Date(content.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const collectionName = collections.find((c) => c.id === content.collectionId)?.name;
  const style = getTypeStyle(content.type);
  const thumbnail = getThumbnailUrl(content.link, content.type);
  const faviconUrl = getFavicon(content.link);

  const computeReadingTime = () => {
    const textLength = (content.title + " " + (content.description || "")).trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(textLength / 200));
    return `${minutes} min read`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = content.link || content.title;
    navigator.clipboard.writeText(shareText);
    addToast("Copied to clipboard!", "success");
  };

  // Smart Previews metadata builders
  const getGithubMeta = () => {
    if (content.type !== "GitHub" || !content.link) return null;
    const cleanLink = content.link.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
    const parts = cleanLink.split("/");
    const owner = parts[0] || "github_owner";
    const repo = parts[1] || "repository";
    const starsCount = ((content.title.length * 79) % 450) + 12;
    const starsFormatted = starsCount > 100 ? `${(starsCount / 10).toFixed(1)}k` : `${starsCount * 10}`;
    const languages = ["TypeScript", "Rust", "JavaScript", "Python", "Go", "C++"];
    const lang = languages[(content.title.length + content.createdAt.length) % languages.length];
    return { owner, repo, stars: starsFormatted, language: lang };
  };

  const getYoutubeMeta = () => {
    if (content.type !== "YouTube") return null;
    const min = ((content.title.length * 3) % 40) + 5;
    const sec = ((content.title.length * 7) % 60).toString().padStart(2, "0");
    const channels = ["MKBHD", "Fireship", "Veritasium", "Lex Fridman", "The Primagen", "TechLead"];
    const channel = channels[(content.title.length + 3) % channels.length];
    return { channel, duration: `${min}:${sec}` };
  };

  const getArticleMeta = () => {
    if (content.type !== "Article") return null;
    const authors = ["Paul Graham", "Dan Abramov", "Marc Andreessen", "Tim Ferriss", "James Clear"];
    const author = authors[(content.title.length + 5) % authors.length];
    return { author };
  };

  const githubMeta = getGithubMeta();
  const youtubeMeta = getYoutubeMeta();
  const articleMeta = getArticleMeta();

  // --- LIST VIEW ---
  if (viewMode === "list") {
    return (
      <div
        data-content-card
        className="group bg-brand-secondary rounded-btn border border-brand-border px-4 py-3 hover:shadow-premium-md hover:border-brand-accent/30 transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer animate-fade-in"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest("button") && !target.closest("a") && !target.closest("select")) {
            onPreviewClick(content);
          }
        }}
      >
        {/* Left icon & details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {faviconUrl ? (
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0 border border-brand-border/60">
              <img
                src={faviconUrl}
                alt=""
                className="w-5 h-5 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-lg ${style.bgColor} text-${style.accentColor} flex items-center justify-center shrink-0 border border-brand-border`}
            >
              <TypeIcon type={content.type} size={14} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-brand-text truncate group-hover:text-brand-accent transition-colors leading-tight">
                {highlightText(content.title, searchQuery)}
              </h4>
              {content.pinned && (
                <span className="text-[10px] text-brand-accent shrink-0" title="Pinned">
                  📌
                </span>
              )}
              {content.favorite && (
                <span className="text-[10px] text-yellow-500 shrink-0" title="Favorite">
                  ★
                </span>
              )}
            </div>

            {/* Smart metadata subtitles for list view */}
            <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-brand-muted uppercase tracking-wider">
              {githubMeta && (
                <>
                  <span>Repo: {githubMeta.owner}/{githubMeta.repo}</span>
                  <span>&bull;</span>
                  <span className="text-brand-accent">★ {githubMeta.stars}</span>
                  <span>&bull;</span>
                  <span>{githubMeta.language}</span>
                </>
              )}
              {youtubeMeta && (
                <>
                  <span>Channel: {youtubeMeta.channel}</span>
                  <span>&bull;</span>
                  <span>Duration: {youtubeMeta.duration}</span>
                </>
              )}
              {articleMeta && (
                <>
                  <span>By: {articleMeta.author}</span>
                </>
              )}
              {!githubMeta && !youtubeMeta && !articleMeta && (
                <span>Type: {content.type}</span>
              )}
            </div>
          </div>
        </div>

        {/* Collection & Status Dropdown */}
        <div className="flex items-center gap-4 shrink-0 hidden md:flex">
          {collectionName ? (
            <span className="text-[9px] font-extrabold text-brand-accent bg-brand-accentLight border border-brand-accent/20 rounded-lg px-2.5 py-0.5 truncate max-w-[110px]">
              📁 {highlightText(collectionName, searchQuery)}
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-brand-muted italic">No Collection</span>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                content.status === "Completed"
                  ? "bg-green-500"
                  : content.status === "Reading"
                  ? "bg-yellow-500"
                  : "bg-slate-400"
              }`}
            />
            <select
              value={content.status}
              onChange={(e) => onStatusChange(content, e.target.value as ReadingStatus)}
              className="text-[10px] rounded-lg border border-brand-border bg-brand-primary px-2 py-0.5 outline-none font-bold text-brand-sub cursor-pointer hover:bg-brand-secondary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="To Read">To Read</option>
              <option value="Reading">Reading</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-[9px] text-brand-muted text-right font-semibold hidden lg:block leading-tight">
            <span>{formattedDate}</span>
            <span className="block text-[8px] mt-0.5 text-brand-muted/70">{computeReadingTime()}</span>
          </div>

          <div className="flex items-center gap-1">
            {content.link && (
              <a
                href={content.link.startsWith("http") ? content.link : `https://${content.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-primary rounded-lg transition-all"
                onClick={(e) => e.stopPropagation()}
                title="Open Link"
              >
                <TypeIcon type="open" size={13} />
              </a>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(content);
              }}
              className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-primary rounded-lg transition-all"
              title="Edit Item"
            >
              <TypeIcon type="edit" size={13} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-primary rounded-lg transition-all"
              title="Copy URL"
            >
              <TypeIcon type="share" size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteConfirmOpen(true);
              }}
              className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
              title="Delete Item"
            >
              <TypeIcon type="delete" size={13} />
            </button>
          </div>
        </div>

        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => onDelete(content)}
          title="Delete Content?"
          message={`Are you sure you want to delete "${content.title}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      </div>
    );
  }

  // --- GRID VIEW (Smart Previews & Custom Styles) ---
  const isNotes = content.type === "Notes" || content.type === "Other";

  return (
    <div
      data-content-card
      className="group bg-brand-secondary rounded-premium border border-brand-border overflow-hidden shadow-premium-sm hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer animate-fade-in"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("button") && !target.closest("a") && !target.closest("select")) {
          onPreviewClick(content);
        }
      }}
    >
      {/* Top visual block (or notepad notepad styling for Notes type) */}
      {isNotes ? (
        <div className="h-44 w-full bg-amber-50 dark:bg-yellow-950/10 p-5 flex flex-col justify-between border-b border-brand-border select-none relative overflow-hidden">
          {/* Note background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:100%_20px] pointer-events-none opacity-40" />
          <div className="z-10">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-extrabold shadow-premium-sm bg-brand-secondary text-brand-text border border-brand-border/40 uppercase tracking-widest">
              📝 Note Note
            </span>
            <div className="mt-3 font-mono text-[10px] text-brand-sub line-clamp-4 leading-relaxed font-semibold">
              {content.description || "Start typing details inside this note block..."}
            </div>
          </div>
          <div className="z-10 text-[9px] font-extrabold text-brand-muted uppercase tracking-wider mt-2">
            No URL Attached
          </div>
        </div>
      ) : (
        <div className="relative h-44 w-full bg-brand-primary overflow-hidden shrink-0 border-b border-brand-border">
          {thumbnail && !imageError ? (
            <img
              src={thumbnail}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center p-4`}
            >
              {faviconUrl ? (
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner mb-2">
                  <img
                    src={faviconUrl}
                    alt=""
                    className="w-6 h-6 rounded-sm bg-white/5"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner mb-2 text-white">
                  <TypeIcon type={content.type} size={22} />
                </div>
              )}
              <span className="text-white/70 text-[9px] font-extrabold uppercase tracking-widest">
                {content.type}
              </span>
            </div>
          )}

          {/* Type Badge Overlay */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold shadow-premium-sm backdrop-blur-md bg-brand-secondary/95 text-brand-text border border-brand-border/40">
              <span className={`text-${style.accentColor}`}>
                <TypeIcon type={content.type} size={11} />
              </span>
              {content.type}
            </span>
          </div>

          {/* Action icon triggers on Hover */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(content);
              }}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition-all shadow-premium-sm hover:scale-105 ${
                content.pinned
                  ? "bg-brand-accent border-brand-accent text-white opacity-100"
                  : "bg-brand-secondary/90 border-brand-borderAccent text-brand-sub hover:bg-brand-secondary hover:text-brand-text"
              }`}
              title={content.pinned ? "Unpin content" : "Pin content"}
            >
              <TypeIcon type="pin" size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(content);
              }}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition-all shadow-premium-sm hover:scale-105 ${
                content.favorite
                  ? "bg-yellow-500 border-yellow-500 text-white opacity-100"
                  : "bg-brand-secondary/90 border-brand-borderAccent text-brand-sub hover:bg-brand-secondary hover:text-brand-text"
              }`}
              title={content.favorite ? "Unfavorite" : "Favorite"}
            >
              <TypeIcon
                type={content.favorite ? "star-filled" : "star-outline"}
                size={12}
                className={content.favorite ? "text-white" : "text-brand-sub"}
              />
            </button>
          </div>
        </div>
      )}

      {/* Card Content body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Title */}
          <h3
            className="text-sm font-bold text-brand-text leading-snug group-hover:text-brand-accent transition-colors line-clamp-2"
            title={content.title}
          >
            {highlightText(content.title, searchQuery)}
          </h3>

          {/* Smart Previews metadata indicators */}
          {(githubMeta || youtubeMeta || articleMeta) && (
            <div className="flex items-center gap-2 py-1 flex-wrap border-b border-brand-border pb-2">
              {githubMeta && (
                <>
                  <span className="text-[9px] font-bold text-brand-muted uppercase">Owner: {githubMeta.owner}</span>
                  <span className="text-[9px] font-extrabold text-brand-accent bg-brand-accentLight border border-brand-accent/25 px-1.5 py-0.5 rounded">
                    ★ {githubMeta.stars}
                  </span>
                  <span className="text-[9px] font-bold text-brand-sub">{githubMeta.language}</span>
                </>
              )}
              {youtubeMeta && (
                <>
                  <span className="text-[9px] font-bold text-brand-muted uppercase">Channel: {youtubeMeta.channel}</span>
                  <span className="text-[9px] font-extrabold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                    {youtubeMeta.duration}
                  </span>
                </>
              )}
              {articleMeta && (
                <>
                  <span className="text-[9px] font-bold text-brand-muted uppercase">Author: {articleMeta.author}</span>
                </>
              )}
            </div>
          )}

          {/* Description */}
          {!isNotes && (
            <p className="text-xs text-brand-sub line-clamp-3 leading-relaxed whitespace-pre-wrap">
              {content.description ? highlightText(content.description, searchQuery) : "No description provided."}
            </p>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded bg-brand-primary hover:bg-brand-borderAccent px-2 py-0.5 text-[9px] font-bold text-brand-sub border border-brand-border transition-colors cursor-pointer"
                >
                  #{highlightText(tag, searchQuery)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta details footer */}
        <div className="mt-4 pt-3.5 border-t border-brand-border space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-brand-muted font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <TypeIcon type="calendar" size={10} />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <TypeIcon type="clock" size={10} />
              <span>{computeReadingTime()}</span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            {collectionName ? (
              <span
                className="text-[9px] font-extrabold text-brand-accent bg-brand-accentLight border border-brand-accent/20 rounded-lg px-2.5 py-0.5 truncate max-w-[125px] block"
                title={collectionName}
              >
                📁 {highlightText(collectionName, searchQuery)}
              </span>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  content.status === "Completed"
                    ? "bg-green-500"
                    : content.status === "Reading"
                    ? "bg-yellow-500"
                    : "bg-slate-400"
                }`}
              />
              <select
                value={content.status}
                onChange={(e) => onStatusChange(content, e.target.value as ReadingStatus)}
                className="text-[9px] rounded-lg border border-brand-border bg-brand-primary px-2 py-0.5 outline-none font-bold text-brand-sub cursor-pointer hover:bg-brand-secondary transition-colors"
                title="Change status"
              >
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick preview action row */}
      <div className="px-5 py-3 border-t border-brand-border bg-brand-primary/30 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => onPreviewClick(content)}
          className="text-xs font-bold text-brand-accent hover:text-brand-accentHover flex items-center gap-1 transition-colors outline-none"
        >
          Quick Preview &rarr;
        </button>

        <div className="flex items-center gap-1">
          {content.link && (
            <a
              href={content.link.startsWith("http") ? content.link : `https://${content.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-primary rounded-lg transition-all"
              title="Open Link"
            >
              <TypeIcon type="open" size={13} />
            </a>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(content);
            }}
            className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-primary rounded-lg transition-all"
            title="Edit Item"
          >
            <TypeIcon type="edit" size={13} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 text-brand-muted hover:text-brand-text hover:bg-brand-primary rounded-lg transition-all"
            title="Copy URL"
          >
            <TypeIcon type="share" size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteConfirmOpen(true);
            }}
            className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
            title="Delete Item"
          >
            <TypeIcon type="delete" size={13} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => onDelete(content)}
        title="Delete Content?"
        message={`Are you sure you want to delete "${content.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

export default ContentCard;
