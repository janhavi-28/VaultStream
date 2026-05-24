import React, { useState } from 'react';
import { X, MailPlus } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

const InviteModal = ({ open, onClose }) => {
  const { inviteMember, tenantWorkspaces } = useTenant();
  const [draft, setDraft] = useState({ email: '', role: 'Viewer', workspace: tenantWorkspaces[0]?.name ?? '' });

  if (!open) return null;

  const handleSubmit = () => {
    if (!draft.email.trim()) return;
    inviteMember(draft);
    setDraft({ email: '', role: 'Viewer', workspace: tenantWorkspaces[0]?.name ?? '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Invite team member</h2>
            <p className="mt-1 text-sm text-slate-500">Send a workspace invite with role-based access.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@company.com" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
          <div className="grid gap-4 sm:grid-cols-2">
            <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
              {['Owner', 'Admin', 'Editor', 'Reviewer', 'Viewer'].map((role) => <option key={role}>{role}</option>)}
            </select>
            <select value={draft.workspace} onChange={(e) => setDraft({ ...draft, workspace: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
              {tenantWorkspaces.map((workspace) => <option key={workspace.id}>{workspace.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            <MailPlus size={16} />
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
