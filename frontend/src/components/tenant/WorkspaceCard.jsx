import React from 'react';
import { Lock, Users } from 'lucide-react';

const WorkspaceCard = ({ workspace }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{workspace.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{workspace.description}</p>
      </div>
      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{workspace.privacy}</span>
    </div>
    <div className="mt-5 flex items-center gap-4 text-sm text-slate-600">
      <span className="inline-flex items-center gap-2"><Users size={14} /> {workspace.members} members</span>
      <span className="inline-flex items-center gap-2"><Lock size={14} /> {workspace.privacy} access</span>
    </div>
  </article>
);

export default WorkspaceCard;
