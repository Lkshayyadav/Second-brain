import { useEffect } from "react";
import type { Content } from "../../types/content";
import type { Collection } from "../../types/collection";
import { getYoutubeVideoId, getFavicon, getDomain, getTypeStyle } from "../../utils/thumbnail";
import { TypeIcon } from "../ui/TypeIcon";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  collections: Collection[];
}

export function PreviewModal({ isOpen, onClose, content, collections }: PreviewModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !content) return null;

  const collectionName = collections.find((c) => c.id === content.collectionId)?.name;
  const style = getTypeStyle(content.type);
  const faviconUrl = getFavicon(content.link);
  const domain = getDomain(content.link);

  const renderMedia = () => {
    const cleanLink = content.link.startsWith("http") ? content.link : `https://${content.link}`;

    if (content.type === "YouTube") {
      const videoId = getYoutubeVideoId(cleanLink);
      if (videoId) {
        return (
          <div className="relative aspect-video w-full rounded-premium overflow-hidden bg-black shadow-inner border border-brand-border">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      }
    }

    if (content.type === "Image" || /\.(jpeg|jpg|gif|png|webp|svg)/i.test(cleanLink)) {
      return (
        <div className="flex items-center justify-center bg-black/90 rounded-premium overflow-hidden max-h-[50vh] border border-brand-border">
          <img
            src={cleanLink}
            alt={content.title}
            className="max-h-[50vh] w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1000&auto=format&fit=crop";
            }}
          />
        </div>
      );
    }

    if (content.type === "PDF") {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-500/5 border border-red-500/20 rounded-premium text-center min-h-[250px]">
          <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-4 animate-pulse">
            <TypeIcon type="PDF" size={40} />
          </div>
          <h4 className="text-sm font-bold text-brand-text mb-1">{content.title}</h4>
          <p className="text-xs text-brand-sub mb-5 max-w-md leading-relaxed">
            This is a PDF document. You can inspect or read the full content by opening it in a new window.
          </p>
          <a
            href={cleanLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-5 py-2 rounded-btn shadow-premium-sm hover:shadow-premium-md transition-all inline-flex items-center gap-2"
          >
            <TypeIcon type="open" size={13} />
            Open PDF Document
          </a>
        </div>
      );
    }

    // Default screenshot preview via thum.io
    if (content.link) {
      return (
        <div className="relative group w-full bg-brand-primary rounded-premium overflow-hidden border border-brand-border shadow-premium-sm flex flex-col">
          <div className="bg-brand-secondary border-b border-brand-border px-4 py-2 flex items-center justify-between text-[10px] text-brand-muted font-bold uppercase tracking-wider">
            <span className="truncate max-w-md flex items-center gap-1.5 text-brand-sub">
              {faviconUrl && <img src={faviconUrl} alt="Favicon" className="w-3.5 h-3.5 rounded-sm bg-white/10" />}
              {domain || "External Link"}
            </span>
            <a
              href={cleanLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:text-brand-accentHover underline flex items-center gap-1"
            >
              Open in new tab <TypeIcon type="open" size={11} />
            </a>
          </div>
          <div className="aspect-video w-full bg-white relative overflow-hidden">
            <img
              src={`https://image.thum.io/get/width/1000/crop/800/${cleanLink}`}
              alt={content.title}
              className="w-full h-full object-cover object-top"
              loading="lazy"
              onError={(e) => {
                const el = e.target as HTMLElement;
                el.style.display = "none";
                const parent = el.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="absolute inset-0 bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center text-white p-8">
                      <div class="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
                        <span class="text-2xl">🔗</span>
                      </div>
                      <span class="font-bold text-sm">${domain || content.title}</span>
                      <span class="text-[10px] text-white/70 mt-1">Live snapshot unavailable</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
        </div>
      );
    }

    // Default Note structure
    return (
      <div className="p-6 bg-brand-primary border border-brand-border rounded-premium min-h-[200px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-lg ${style.bgColor} text-${style.accentColor} border border-brand-borderAccent`}>
              <TypeIcon type={content.type} size={16} />
            </span>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
              {content.type} Note
            </span>
          </div>
          <p className="text-brand-text whitespace-pre-wrap text-sm leading-relaxed">
            {content.description || "No description provided."}
          </p>
        </div>
        <div className="text-[10px] text-brand-muted border-t border-brand-border pt-3.5 mt-5">
          Created: {new Date(content.createdAt).toLocaleString()}
        </div>
      </div>
    );
  };

  const cleanLink = content.link
    ? content.link.startsWith("http")
      ? content.link
      : `https://${content.link}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-4xl bg-brand-secondary rounded-premium shadow-premium-lg border border-brand-border overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate pr-4">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-5 h-5 rounded-sm bg-white/10 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className={`text-${style.accentColor} flex-shrink-0`}>
                <TypeIcon type={content.type} size={16} />
              </span>
            )}
            <h3 className="font-bold text-brand-text text-sm truncate" title={content.title}>
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-brand-primary text-brand-muted hover:text-brand-text rounded-lg transition-colors focus:outline-none"
            aria-label="Close preview"
          >
            <TypeIcon type="close" size={16} />
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {renderMedia()}

          {/* Details / Side attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-brand-border">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-brand-sub text-xs leading-relaxed whitespace-pre-wrap">
                  {content.description || "No description provided."}
                </p>
              </div>

              {cleanLink && (
                <div>
                  <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
                    Resource Link
                  </h4>
                  <a
                    href={cleanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-accent hover:text-brand-accentHover text-xs font-semibold underline truncate block break-all"
                  >
                    {cleanLink}
                  </a>
                </div>
              )}
            </div>

            {/* Right attributes sidebox */}
            <div className="md:col-span-1 space-y-4 bg-brand-primary p-4 rounded-premium border border-brand-border">
              <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div>
                  <span className="font-bold text-brand-muted block uppercase tracking-wider">TYPE</span>
                  <span className={`inline-flex items-center gap-1.5 mt-1 font-bold text-${style.accentColor}`}>
                    <TypeIcon type={content.type} size={12} />
                    {content.type}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-brand-muted block uppercase tracking-wider">STATUS</span>
                  <span className="inline-block mt-1 font-bold text-brand-text bg-brand-secondary border border-brand-border px-2 py-0.5 rounded-lg shadow-premium-sm">
                    {content.status}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-brand-muted block uppercase tracking-wider">CATEGORY</span>
                  <span className="inline-block mt-1 font-semibold text-brand-sub">
                    {content.category || "General"}
                  </span>
                </div>
                {collectionName && (
                  <div>
                    <span className="font-bold text-brand-muted block uppercase tracking-wider">COLLECTION</span>
                    <span className="inline-block mt-1 font-bold text-brand-accent">
                      📁 {collectionName}
                    </span>
                  </div>
                )}
              </div>

              {content.tags && content.tags.length > 0 && (
                <div className="border-t border-brand-border pt-3">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block mb-1.5">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-brand-secondary border border-brand-border rounded px-1.5 py-0.5 text-[9px] font-bold text-brand-sub"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-brand-border pt-3 text-[9px] text-brand-muted space-y-1 font-semibold uppercase tracking-wider">
                <div className="flex justify-between">
                  <span>Saved:</span>
                  <span className="text-brand-sub">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {content.updatedAt !== content.createdAt && (
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="text-brand-sub">
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
