import React, { createContext, useContext, useMemo, useState } from 'react';
import { inviteSeed, teamMembersSeed, tenantOrganizations, tenantSettingsSeed, workspaceCatalog } from '../data/tenantMockData';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const [tenants] = useState(tenantOrganizations);
  const [currentTenantId, setCurrentTenantId] = useState(tenantOrganizations[0]?.id ?? null);
  const [teamMembers, setTeamMembers] = useState(teamMembersSeed);
  const [invites, setInvites] = useState(inviteSeed);
  const [workspaces, setWorkspaces] = useState(workspaceCatalog);
  const [tenantSettings, setTenantSettings] = useState(tenantSettingsSeed);

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === currentTenantId) ?? tenants[0] ?? null,
    [currentTenantId, tenants],
  );

  const tenantMembers = useMemo(
    () => teamMembers.filter((member) => member.tenantId === currentTenant?.id),
    [currentTenant?.id, teamMembers],
  );

  const tenantInvites = useMemo(
    () => invites.filter((invite) => invite.tenantId === currentTenant?.id),
    [currentTenant?.id, invites],
  );

  const tenantWorkspaces = useMemo(
    () => workspaces.filter((workspace) => workspace.tenantId === currentTenant?.id),
    [currentTenant?.id, workspaces],
  );

  const switchTenant = (tenantId) => setCurrentTenantId(tenantId);

  const inviteMember = ({ email, role, workspace }) => {
    if (!currentTenant) return;
    setInvites((current) => [
      {
        id: `inv-${Date.now()}`,
        tenantId: currentTenant.id,
        email,
        role,
        workspace,
        status: 'Pending',
        sentAt: 'Just now',
      },
      ...current,
    ]);
  };

  const updateMemberRole = (memberId, role) => {
    setTeamMembers((current) => current.map((member) => (member.id === memberId ? { ...member, role } : member)));
  };

  const updateMemberStatus = (memberId, status) => {
    setTeamMembers((current) => current.map((member) => (member.id === memberId ? { ...member, status } : member)));
  };

  const createWorkspace = ({ name, description, privacy }) => {
    if (!currentTenant) return;
    setWorkspaces((current) => [
      {
        id: `ws-${Date.now()}`,
        tenantId: currentTenant.id,
        name,
        description,
        privacy,
        members: 1,
      },
      ...current,
    ]);
  };

  const updateSettings = (nextSettings) => {
    if (!currentTenant) return;
    setTenantSettings((current) => ({
      ...current,
      [currentTenant.id]: {
        ...current[currentTenant.id],
        ...nextSettings,
      },
    }));
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        currentTenantId,
        switchTenant,
        tenantMembers,
        tenantInvites,
        tenantWorkspaces,
        inviteMember,
        updateMemberRole,
        updateMemberStatus,
        createWorkspace,
        tenantSettings: tenantSettings[currentTenant?.id] ?? {},
        updateSettings,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};
