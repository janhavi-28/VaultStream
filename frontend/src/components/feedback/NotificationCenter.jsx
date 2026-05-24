import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const typeStyles = {
  success: { bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />, dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />, dot: 'bg-amber-500' },
  error:   { bg: 'bg-rose-50 border-rose-200',   icon: <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />,   dot: 'bg-rose-500' },
  info:    { bg: 'bg-sky-50 border-sky-200',      icon: <Info size={15} className="text-sky-500 shrink-0 mt-0.5" />,              dot: 'bg-sky-500' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, remove, markAllRead, clearAll } = useNotifications();

  // Only show sticky (backend-saved) notifications in the bell dropdown
  const bellNotifications = notifications.filter((n) => n.sticky);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) markAllRead();
        }}
        className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-indigo-600"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">{bellNotifications.length} update{bellNotifications.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearAll} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600" title="Clear all">
                <Trash2 size={15} />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[460px] overflow-y-auto p-3">
            {bellNotifications.length > 0 ? (
              <div className="space-y-2">
                {bellNotifications.map((item) => {
                  const style = typeStyles[item.type] || typeStyles.info;
                  return (
                    <div key={item.id} className={`rounded-2xl border p-3 ${style.bg} ${!item.read ? 'ring-1 ring-inset ring-indigo-200' : ''}`}>
                      <div className="flex items-start gap-2">
                        {style.icon}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-900 leading-tight">{item.title}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{timeAgo(item.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{item.message}</p>
                        </div>
                        <button type="button" onClick={() => remove(item.id)} className="rounded-full p-1 text-slate-300 hover:bg-white hover:text-slate-600 shrink-0">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
