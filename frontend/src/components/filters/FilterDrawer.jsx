import React, { useState } from 'react';
import { BookmarkPlus, SlidersHorizontal, Trash2, X } from 'lucide-react';

const FilterDrawer = ({
  open,
  onClose,
  filters,
  statusOptions,
  categoryOptions,
  toggleStatus,
  setFilter,
  clearAllFilters,
  savedFilters,
  applySavedFilter,
  removeSavedFilter,
  saveCurrentFilter,
}) => {
  const [filterName, setFilterName] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <SlidersHorizontal size={14} />
              Filters
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Refine library results</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Review state</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={`rounded-full px-3 py-2 text-sm font-medium ${filters.statuses.includes(status) ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {status[0].toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Upload date</label>
              <select value={filters.dateRange} onChange={(e) => setFilter('date', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                <option value="any">Any time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">File size</label>
              <select value={filters.sizeRange} onChange={(e) => setFilter('size', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                <option value="any">Any size</option>
                <option value="small">Under 100 MB</option>
                <option value="medium">100 MB to 1 GB</option>
                <option value="large">Over 1 GB</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Duration</label>
              <select value={filters.durationRange} onChange={(e) => setFilter('duration', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                <option value="any">Any duration</option>
                <option value="short">Under 5 min</option>
                <option value="medium">5 to 30 min</option>
                <option value="long">Over 30 min</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                <option value="any">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Saved filters</h3>
            <div className="mt-3 flex gap-2">
              <input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Filter name" className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-sky-400" />
              <button
                type="button"
                onClick={() => {
                  saveCurrentFilter(filterName);
                  setFilterName('');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <BookmarkPlus size={14} />
                Save
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {savedFilters.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <button type="button" onClick={() => applySavedFilter(item.query)} className="text-sm font-medium text-slate-700 hover:text-sky-700">
                    {item.name}
                  </button>
                  <button type="button" onClick={() => removeSavedFilter(item.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" onClick={clearAllFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
