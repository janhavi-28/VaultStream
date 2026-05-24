import React from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

const TenantSwitcher = () => {
  const { tenants, currentTenant, switchTenant } = useTenant();
  if (!currentTenant) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="rounded-xl bg-sky-50 p-2 text-sky-700">
        <Building2 size={16} />
      </div>
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold text-slate-900">{currentTenant.name}</p>
        <p className="text-xs text-slate-500">{currentTenant.plan} workspace</p>
      </div>
      <div className="relative">
        <select
          value={currentTenant.id}
          onChange={(event) => switchTenant(event.target.value)}
          className="appearance-none rounded-xl border border-transparent bg-transparent py-1 pl-2 pr-8 text-sm font-medium text-slate-700 outline-none"
        >
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
};

export default TenantSwitcher;
