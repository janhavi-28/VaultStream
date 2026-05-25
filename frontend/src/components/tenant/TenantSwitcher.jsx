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
      <div className="hidden min-w-0 sm:block pr-2">
        <p className="truncate text-sm font-semibold text-slate-900">{currentTenant.name}</p>
        <p className="text-xs text-slate-500">{currentTenant.plan} workspace</p>
      </div>
    </div>
  );
};

export default TenantSwitcher;
