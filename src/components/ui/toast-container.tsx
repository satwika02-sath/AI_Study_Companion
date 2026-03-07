'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, Toast, ToastType } from '@/context/toast-context';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
};

const borders: Record<ToastType, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
  warning: 'border-l-amber-500',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-white border-l-4 ${borders[toast.type]} shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl px-4 py-3.5 max-w-xs w-full pointer-events-auto`}
    >
      {icons[toast.type]}
      <p className="text-sm font-semibold text-slate-800 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-1 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();
  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
