import React, { useState } from 'react';
import { Bell, CheckCircle2, Copy, Globe2, Lock, Plus, Server, Shield, Trash2, Key } from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import api from '../../api/axios.js';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_prod_************************xyz',
      fullKey: 'sk_prod_abcdef1234567890xyz',
      created: 'May 21, 2026',
    },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordStatus({ type: '', message: '' });
    
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.response?.data?.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Globe2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'api_keys', label: 'API Keys', icon: Server },
  ];

  const createKey = () => {
    if (!newKeyName.trim()) return;
    const suffix = Math.random().toString(36).slice(2, 5);
    setApiKeys((current) => [
      {
        id: Date.now(),
        name: newKeyName,
        key: `sk_prod_************************${suffix}`,
        fullKey: `sk_prod_${Math.random().toString(36).slice(2, 15)}${suffix}`,
        created: 'Just now',
      },
      ...current,
    ]);
    setNewKeyName('');
  };

  const copyKey = (id, value) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <AdminShell badge="Settings" title="System settings" description="Tune platform policy, security controls, alerts, and admin API credentials from one operations settings panel.">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 space-y-1 md:w-64">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {activeTab === 'platform' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Platform controls</h2>
                <p className="mt-1 text-sm text-slate-500">Set default moderation, retention, and tenant behavior.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">Auto-approve low-risk videos</div>
                  <div className="mt-1 text-sm text-slate-500">Bypass manual moderation for low sensitivity uploads.</div>
                  <input type="checkbox" defaultChecked className="mt-4 h-5 w-5 rounded border-slate-300 text-indigo-600" />
                </label>
                <label className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">Tenant quota warnings</div>
                  <div className="mt-1 text-sm text-slate-500">Alert admins when storage usage crosses soft limits.</div>
                  <input type="checkbox" defaultChecked className="mt-4 h-5 w-5 rounded border-slate-300 text-indigo-600" />
                </label>
              </div>
            </div>
          ) : null}

          {activeTab === 'security' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Security controls</h2>
                <p className="mt-1 text-sm text-slate-500">Manage authentication and operational hardening.</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-slate-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Enforce 2FA for admins</div>
                      <div className="text-sm text-slate-500">Require second-factor authentication for all admin accounts.</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">Session timeout</div>
                  <div className="mt-1 text-sm text-slate-500">Automatically expire admin sessions after 30 minutes of inactivity.</div>
                </div>
              </div>
              
              <div className="rounded-2xl border border-slate-200 p-6 mt-6 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Key size={20} className="text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {passwordStatus.message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${passwordStatus.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                      {passwordStatus.message}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      required 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      required 
                      minLength={6}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 transition-all mt-2"
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          ) : null}

          {activeTab === 'notifications' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">Alert preferences</h2>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-indigo-600" />
                <div>
                  <div className="font-semibold text-slate-900">Critical platform alerts</div>
                  <div className="text-sm text-slate-500">Downtime, processing failures, and auth incidents.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-indigo-600" />
                <div>
                  <div className="font-semibold text-slate-900">Moderation digest</div>
                  <div className="text-sm text-slate-500">Daily rollup of queued and high-risk content.</div>
                </div>
              </label>
            </div>
          ) : null}

          {activeTab === 'api_keys' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">API credentials</h2>
                <p className="mt-1 text-sm text-slate-500">Manage admin API keys for integrations and automation.</p>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" />
                <button onClick={createKey} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
                  <Plus size={16} />
                  Create key
                </button>
              </div>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{apiKey.name}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{apiKey.key}</code>
                          <button onClick={() => copyKey(apiKey.id, apiKey.fullKey)} className="text-slate-500 hover:text-indigo-600">
                            {copiedId === apiKey.id ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Copy size={15} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{apiKey.created}</span>
                        <button onClick={() => setApiKeys((current) => current.filter((item) => item.id !== apiKey.id))} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
};

export default SystemSettings;
