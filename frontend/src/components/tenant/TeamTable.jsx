import React from 'react';
import { PauseCircle, ShieldCheck } from 'lucide-react';

const TeamTable = ({ members, onRoleChange, onStatusToggle }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {['Member', 'Email', 'Role', 'Workspace', 'Status', 'Actions'].map((label) => (
              <th key={label} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50/80">
              <td className="px-5 py-4 text-sm font-semibold text-slate-900">{member.name}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{member.email}</td>
              <td className="px-5 py-4">
                <select value={member.role} onChange={(e) => onRoleChange(member.id, e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400">
                  {['Owner', 'Admin', 'Editor', 'Reviewer', 'Viewer'].map((role) => <option key={role}>{role}</option>)}
                </select>
              </td>
              <td className="px-5 py-4 text-sm text-slate-600">{member.workspace}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : member.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {member.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="inline-flex gap-2">
                  <button type="button" onClick={() => onStatusToggle(member.id, member.status === 'Suspended' ? 'Active' : 'Suspended')} className="rounded-lg border border-slate-200 p-2 text-amber-700 hover:bg-amber-50">
                    <PauseCircle size={15} />
                  </button>
                  <button type="button" className="rounded-lg border border-slate-200 p-2 text-emerald-700 hover:bg-emerald-50">
                    <ShieldCheck size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TeamTable;
