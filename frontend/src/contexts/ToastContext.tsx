import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-slide-in {
          from {
            transform: translateY(1.5rem) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-toast {
          animation: toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgClass = "bg-white border-slate-200 text-slate-800";
          let icon = "ℹ️";
          if (toast.type === "success") {
            bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
            icon = "✅";
          } else if (toast.type === "error") {
            bgClass = "bg-red-50 border-red-200 text-red-800";
            icon = "❌";
          } else if (toast.type === "warning") {
            bgClass = "bg-amber-50 border-amber-200 text-amber-800";
            icon = "⚠️";
          }

          return (
            <div
              key={toast.id}
              className={`animate-toast flex items-start gap-3 p-4 rounded-xl border shadow-lg text-sm font-medium ${bgClass}`}
            >
              <span className="text-base flex-shrink-0">{icon}</span>
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 font-bold ml-1"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
