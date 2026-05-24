import React from 'react';
import { BarChart3, Building2, FolderKanban, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import WorkspaceCard from '../../components/tenant/WorkspaceCard';

const TenantDashboard = () => {
  const { currentTenant, tenantMembers, tenantInvites, tenantWorkspaces } = useTenant();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm ring-1 ring-sky-100">
                <Building2 size={14} />
                Tenant dashboard
              </div>
              <h1 className="mt-4 text-3xl font-bold text-slate-950">{currentTenant?.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Switch organizations from the header and keep workspaces, members, invites, and uploads isolated by tenant.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/editor/team" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Team members</Link>
              <Link to="/editor/invites" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Invite members</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Plan', value: currentTenant?.plan, icon: Building2 },
          { label: 'Team members', value: tenantMembers.length, icon: Users },
          { label: 'Workspaces', value: tenantWorkspaces.length, icon: FolderKanban },
          { label: 'Pending invites', value: tenantInvites.filter((invite) => invite.status === 'Pending').length, icon: BarChart3 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 ring-1 ring-sky-200"><Icon size={20} /></div>
              </div>
            </div>
          );
        })}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Workspaces</h2>
            <p className="mt-1 text-sm text-slate-500">Collaborative spaces scoped to the active organization.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tenantWorkspaces.map((workspace) => <WorkspaceCard key={workspace.id} workspace={workspace} />)}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Isolation model</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <p>Uploads are tagged to the active tenant.</p>
            <p>Library and editor dashboard now filter data per organization.</p>
            <p>Members, invites, settings, and workspaces all resolve from tenant context.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TenantDashboard;
