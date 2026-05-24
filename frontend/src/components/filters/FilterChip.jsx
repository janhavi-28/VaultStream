import React from 'react';
import { X } from 'lucide-react';

const FilterChip = ({ label, onRemove }) => (
  <button
    type="button"
    onClick={onRemove}
    className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
  >
    {label}
    <X size={12} />
  </button>
);

export default FilterChip;
