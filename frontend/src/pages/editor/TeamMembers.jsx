import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import TeamTable from '../../components/tenant/TeamTable';
import InviteModal from '../../components/tenant/InviteModal';

const TeamMembers = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { currentTenant, tenantMembers, updateMemberRole, updateMemberStatus } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Team Members</h1>
          <p className="mt-2 text-sm text-slate-500">Manage membership and role assignments for {currentTenant?.name}.</p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          <UserPlus size={16} />
          Invite member
        </button>
      </div>
      <TeamTable members={tenantMembers} onRoleChange={updateMemberRole} onStatusToggle={updateMemberStatus} />
      <InviteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default TeamMembers;
