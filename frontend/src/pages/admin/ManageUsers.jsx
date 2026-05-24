import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import AdminTable from '../../components/admin/AdminTable';
import api from '../../api/axios';

const roles = ['Viewer', 'Editor', 'Admin'];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [draft, setDraft] = useState({ name: '', email: '', role: 'Viewer', tenant: '' });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      setRequestsError(null);
      const { data } = await api.get('/admin/editor-requests');
      if (data.success) {
        setPendingRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch editor requests:', error);
      setRequestsError(error?.response?.data?.message || error.message || 'Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const { data } = await api.get('/admin/users');
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsersError(error?.response?.data?.message || error.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/editor-requests/${id}/approve`);
      fetchPendingRequests();
      fetchUsers(); // Refresh active users list to show they are now editors
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/editor-requests/${id}/reject`);
      fetchPendingRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const createUser = async () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    try {
      const { data } = await api.post('/admin/users', {
        name: draft.name,
        email: draft.email,
        role: draft.role.toLowerCase(),
        tenant: draft.tenant,
      });

      if (data.success) {
        setUsers((current) => [data.user, ...current]);
        setDraft({ name: '', email: '', role: 'Viewer', tenant: '' });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert(error?.response?.data?.message || 'Failed to create user');
    }
  };



  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const { data } = await api.delete(`/admin/users/${id}`);
      if (data.success) {
        setUsers((current) => current.filter((user) => user._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Map users list to AdminTable rows
  const tableRows = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Viewer',
    status: user.isActive ? 'Active' : 'Suspended',
    tenant: user.tenantId?.name || 'Independent',
    lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never',
    _original: user
  }));

  return (
    <AdminShell badge="Users" title="User management" description="Create users and remove accounts through a shared admin table.">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Create user</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
          <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
          <input value={draft.tenant} onChange={(e) => setDraft({ ...draft, tenant: e.target.value })} placeholder="Organization" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
          <div className="flex gap-3">
            <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
            <button type="button" onClick={createUser} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 active:scale-[0.98]">
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>
      </section>

      {/* Editor Requests Section */}
      <section className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            Pending Editor Requests
            {pendingRequests.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                {pendingRequests.length}
              </span>
            )}
          </h2>
          <button onClick={fetchPendingRequests} className="text-xs text-indigo-600 hover:underline">Refresh</button>
        </div>
        {loadingRequests ? (
          <p className="text-sm text-slate-500">Loading requests...</p>
        ) : requestsError ? (
          <p className="text-sm text-red-600 font-medium">⚠ Error: {requestsError}</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No pending editor requests.</p>
        ) : (
          <AdminTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Current Role' },
              { key: 'createdAt', label: 'Requested At' },
            ]}
            rows={pendingRequests.map(r => ({ ...r, id: r._id, createdAt: new Date(r.updatedAt).toLocaleDateString() }))}
            actions={(row) => (
              <div className="inline-flex gap-2">
                <button type="button" onClick={() => handleApprove(row.id)} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-emerald-700 hover:bg-emerald-50 active:scale-95" title="Approve Request">
                  <CheckCircle size={15} />
                </button>
                <button type="button" onClick={() => handleReject(row.id)} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-rose-700 hover:bg-rose-50 active:scale-95" title="Reject Request">
                  <XCircle size={15} />
                </button>
              </div>
            )}
          />
        )}
      </section>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-950 mb-4">System Users</h2>
        {loadingUsers ? (
          <p className="text-sm text-slate-500">Loading system users...</p>
        ) : usersError ? (
          <p className="text-sm text-red-600 font-medium">⚠ Error: {usersError}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found in database.</p>
        ) : (
          <AdminTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              { key: 'status', label: 'Status', type: 'badge' },
              { key: 'tenant', label: 'Tenant' },
              { key: 'lastActive', label: 'Last Active' },
            ]}
            rows={tableRows}
            actions={(row) => (
              <div className="inline-flex gap-2">
                <button type="button" onClick={() => deleteUser(row.id)} className="cursor-pointer rounded-lg border border-slate-200 p-2 text-rose-700 hover:bg-rose-50 active:scale-95" title="Delete user" aria-label={`Delete user ${row.name}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          />
        )}
      </div>
    </AdminShell>
  );
};

export default ManageUsers;
