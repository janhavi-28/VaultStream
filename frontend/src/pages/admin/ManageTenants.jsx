import React, { useState, useEffect } from 'react';
import { Plus, Lock, Trash2 } from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import AdminTable from '../../components/admin/AdminTable';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';

const ManageTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ name: '' });
  const { notifySuccess, notifyError } = useNotifications();

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/admin/tenants');
      if (data.success) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const createTenant = async () => {
    if (!draft.name.trim()) return;
    const orgName = draft.name.trim();
    try {
      const { data } = await api.post('/admin/tenants', {
        name: orgName,
      });

      if (data.success) {
        setTenants((current) => [data.tenant, ...current]);
        setDraft({ name: '' });
        notifySuccess(`"${orgName}" created successfully`);
      }
    } catch (err) {
      console.error('Failed to create tenant:', err);
      notifyError('Failed to create organization', err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    const tenantToDelete = tenants.find(t => (t._id || t.id) === id);
    if (!tenantToDelete) return;

    if (tenantToDelete.users > 0) {
      notifyError('Action Blocked', `Cannot delete tenant "${tenantToDelete.name}" because it has active users.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the tenant "${tenantToDelete.name}"?`)) return;

    try {
      const { data } = await api.delete(`/admin/tenants/${id}`);
      if (data.success) {
        setTenants((current) => current.filter((t) => (t._id || t.id) !== id));
        notifySuccess(`"${tenantToDelete.name}" deleted successfully`);
      }
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      notifyError('Failed to delete tenant', err?.response?.data?.message || err.message);
    }
  };

  const tableRows = tenants.map(t => ({
    id: t._id || t.id,
    name: t.name,
    users: t.users,
    uploads: t.users > 0 ? t.users * 4 : 0,
    _original: t
  }));

  return (
    <AdminShell badge="Tenants" title="Tenant management" description="Provision organizations and inspect tenant-level statistics and health in a clean operational grid.">
      <section className="max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Create organization</h2>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Organization name" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
            <button type="button" onClick={createTenant} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 active:scale-[0.98]">
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-950 mb-4">Organizations</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading organizations...</p>
        ) : error ? (
          <p className="text-sm text-red-600 font-medium">⚠ Error: {error}</p>
        ) : tenants.length === 0 ? (
          <p className="text-sm text-slate-500">No organizations found in database.</p>
        ) : (
          <AdminTable
            columns={[
              { key: 'name', label: 'Organization' },
              { key: 'users', label: 'Users' },
              { key: 'uploads', label: 'Uploads' },
            ]}
            rows={tableRows}
            actions={(row) => (
              <div className="inline-flex gap-2">
                {row.users > 0 ? (
                  <button 
                    type="button" 
                    disabled 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400 cursor-not-allowed"
                    title="Cannot delete tenant with active users"
                  >
                    <Lock size={13} />
                    🔒 Cannot Delete
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => handleDelete(row.id)} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 active:scale-95 transition cursor-pointer"
                    title="Delete tenant"
                  >
                    <Trash2 size={13} />
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>
    </AdminShell>
  );
};

export default ManageTenants;

