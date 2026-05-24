import React from 'react';

const SortDropdown = ({ value, options, onChange }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default SortDropdown;
