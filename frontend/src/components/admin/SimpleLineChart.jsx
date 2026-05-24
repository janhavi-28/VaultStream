import React from 'react';

const SimpleLineChart = ({ title, subtitle, data, stroke = '#8b5cf6', fill = 'rgba(139, 92, 246, 0.12)' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6 flex h-64 w-full items-center justify-center text-sm text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  const width = 520;
  const height = 220;
  const padding = 22;
  const max = Math.max(...data.map((item) => item.value), 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : width;

  const points = data.map((item, index) => {
    const x = padding + index * step;
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { ...item, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
          <path d={areaPath} fill={fill} />
          <path d={linePath} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="5" fill={stroke} />
              <text x={point.x} y={height - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default SimpleLineChart;
