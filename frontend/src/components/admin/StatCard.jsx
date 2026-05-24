import React from 'react';

const tones = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  slate: 'bg-slate-50 text-slate-700 ring-slate-200',
};

const StatCard = ({ icon: Icon, label, value, change, tone = 'slate' }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        {change ? <p className="mt-2 text-sm text-slate-500">{change}</p> : null}
      </div>
      {Icon ? (
        <div className={`rounded-2xl p-3 ring-1 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      ) : null}
    </div>
  </div>
);

export default StatCard;
