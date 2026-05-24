import React from 'react';

const badgeTone = {
  Active: 'bg-emerald-100 text-emerald-700',
  Suspended: 'bg-rose-100 text-rose-700',
  Healthy: 'bg-emerald-100 text-emerald-700',
  Attention: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  'Needs review': 'bg-amber-100 text-amber-700',
  // Sensitivity / video status
  Safe: 'bg-emerald-100 text-emerald-700',
  Flagged: 'bg-rose-100 text-rose-700',
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-sky-100 text-sky-700',
  Uploading: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const AdminTable = ({ columns, rows, actions }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {column.label}
              </th>
            ))}
            {actions ? <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/80">
              {columns.map((column) => {
                const value = row[column.key];
                return (
                  <td key={column.key} className="px-5 py-4 text-sm text-slate-700">
                    {column.type === 'badge' ? (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone[value] || 'bg-slate-100 text-slate-700'}`}>
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
              {actions ? <td className="px-5 py-4 text-right">{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminTable;
