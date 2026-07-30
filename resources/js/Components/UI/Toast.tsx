import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration ?? 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const styleMap = {
    success: {
      bg: 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/40',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-slate-900/95 border-amber-500/50 text-amber-300 shadow-amber-950/40',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/95 border-indigo-500/50 text-indigo-300 shadow-indigo-950/40',
      icon: <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
    },
  };

  const currentStyle = styleMap[toast.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all transform translate-y-0 opacity-100 max-w-md w-full pointer-events-auto animate-slide-in ${currentStyle.bg}`}
      role="alert"
    >
      <div className="pt-0.5">{currentStyle.icon}</div>
      <div className="flex-1 min-w-0">
        <h5 className="font-extrabold text-sm text-white">{toast.title}</h5>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
        aria-label="Tutup Notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none no-print">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
