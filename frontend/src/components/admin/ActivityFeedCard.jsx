import React from 'react';

const toneClasses = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-sky-100 text-sky-700',
  danger: 'bg-rose-100 text-rose-700',
};

const ActivityFeedCard = ({ items }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold text-slate-950">Activity feed</h2>
    <p className="mt-1 text-sm text-slate-500">Recent admin events across the platform.</p>
    <div className="mt-5 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className={`mt-0.5 rounded-full px-2 py-1 text-xs font-semibold ${toneClasses[item.type] || toneClasses.info}`}>
            {item.type}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <span className="text-xs text-slate-500">{item.time}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityFeedCard;
