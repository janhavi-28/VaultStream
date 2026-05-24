import React, { useState } from 'react';
import { MailPlus } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import InviteModal from '../../components/tenant/InviteModal';

const InviteMembers = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { currentTenant, tenantInvites } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Invite Members</h1>
          <p className="mt-2 text-sm text-slate-500">Manage pending and accepted invites for {currentTenant?.name}.</p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          <MailPlus size={16} />
          New invite
        </button>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Email', 'Role', 'Workspace', 'Status', 'Sent'].map((label) => (
                  <th key={label} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenantInvites.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{invite.email}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{invite.role}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{invite.workspace}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${invite.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{invite.status}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-500">{invite.sentAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <InviteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default InviteMembers;
