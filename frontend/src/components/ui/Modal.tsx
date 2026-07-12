import type { ReactNode } from "react";
import { TypeIcon } from "./TypeIcon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent background scrolling when modal is open
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-premium border border-brand-border bg-brand-secondary p-6 shadow-premium-lg">
        <div className="mb-5 flex items-center justify-between border-b border-brand-border pb-3.5">
          {title ? (
            <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
              <span>{title}</span>
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-primary hover:text-brand-text transition-colors"
            aria-label="Close modal"
          >
            <TypeIcon type="close" size={16} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
