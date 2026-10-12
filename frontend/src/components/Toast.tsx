import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md animate-fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl transition-all ${
          isSuccess
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            : isError
            ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
        <span className="text-xs font-medium flex-1">{toast.message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
