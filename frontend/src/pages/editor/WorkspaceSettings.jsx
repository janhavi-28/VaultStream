import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import WorkspaceCard from '../../components/tenant/WorkspaceCard';

const WorkspaceSettings = () => {
  const { currentTenant, tenantSettings, updateSettings, tenantWorkspaces, createWorkspace } = useTenant();
  const [workspaceDraft, setWorkspaceDraft] = useState({ name: '', description: '', privacy: 'Private' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Workspace Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Configure workspace defaults and tenant settings for {currentTenant?.name}.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Tenant settings</h2>
          <div className="mt-5 grid gap-4">
            <select value={tenantSettings.moderationMode || ''} onChange={(e) => updateSettings({ moderationMode: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
              {['Balanced', 'Strict', 'Relaxed'].map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={tenantSettings.defaultRole || ''} onChange={(e) => updateSettings({ defaultRole: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
              {['Viewer', 'Reviewer', 'Editor', 'Admin'].map((option) => <option key={option}>{option}</option>)}
            </select>
            <input value={tenantSettings.uploadPolicy || ''} onChange={(e) => updateSettings({ uploadPolicy: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Create workspace</h2>
          <div className="mt-5 grid gap-4">
            <input value={workspaceDraft.name} onChange={(e) => setWorkspaceDraft({ ...workspaceDraft, name: e.target.value })} placeholder="Workspace name" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
            <textarea value={workspaceDraft.description} onChange={(e) => setWorkspaceDraft({ ...workspaceDraft, description: e.target.value })} placeholder="Description" className="min-h-28 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
            <div className="flex gap-3">
              <select value={workspaceDraft.privacy} onChange={(e) => setWorkspaceDraft({ ...workspaceDraft, privacy: e.target.value })} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                {['Private', 'Shared'].map((option) => <option key={option}>{option}</option>)}
              </select>
              <button type="button" onClick={() => { createWorkspace(workspaceDraft); setWorkspaceDraft({ name: '', description: '', privacy: 'Private' }); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
                <PlusCircle size={16} />
                Create
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenantWorkspaces.map((workspace) => <WorkspaceCard key={workspace.id} workspace={workspace} />)}
      </section>
    </div>
  );
};

export default WorkspaceSettings;
