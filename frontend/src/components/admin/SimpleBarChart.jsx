import React from 'react';

const SimpleBarChart = ({ title, subtitle, data, color = 'bg-sky-500' }) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6 flex h-64 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-full w-full items-end">
              <div className={`w-full rounded-t-2xl ${color}`} style={{ height: `${(item.value / max) * 100}%` }} />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">{item.value}</div>
              <div className="text-xs text-slate-500">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;
