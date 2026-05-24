import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const toneMap = {
  success: { wrap: 'border-emerald-200 bg-emerald-50', icon: 'text-emerald-600', Icon: CheckCircle2 },
  error: { wrap: 'border-rose-200 bg-rose-50', icon: 'text-rose-600', Icon: AlertTriangle },
  warning: { wrap: 'border-amber-200 bg-amber-50', icon: 'text-amber-600', Icon: Bell },
  info: { wrap: 'border-sky-200 bg-sky-50', icon: 'text-sky-600', Icon: Info },
};

const ToastProvider = () => {
  const { notifications, remove } = useNotifications();
  // Only show transient (non-sticky) notifications as floating toasts.
  // Sticky notifications come from the backend DB and belong in the bell dropdown only.
  const toasts = notifications.filter((n) => !n.sticky).slice(0, 4);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const tone = toneMap[toast.type] || toneMap.info;
        const Icon = tone.Icon;
        return (
          <div key={toast.id} className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-sm animate-in slide-in-from-right-4 fade-in duration-300 ${tone.wrap}`}>
            <div className="flex items-start gap-3">
              <Icon size={18} className={`mt-0.5 shrink-0 ${tone.icon}`} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{toast.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
              </div>
              <button type="button" onClick={() => remove(toast.id)} className="rounded-full p-1 text-slate-400 hover:bg-white/70 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastProvider;
