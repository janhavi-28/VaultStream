import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, User, Mail, Calendar, Settings as SettingsIcon, 
  Plus, Copy, Trash2, AlertCircle, CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('api_keys');
  
  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_prod_************************xyz',
      fullKey: 'sk_prod_abcdef1234567890xyz',
      lastUsed: '5/21/2026'
    }
  ]);
  const [copiedId, setCopiedId] = useState(null);
  
  // Key Creation State
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `sk_prod_************************${randomSuffix}`,
      fullKey: `sk_prod_${Math.random().toString(36).substring(2, 15)}${randomSuffix}`,
      lastUsed: 'Never'
    };
    setApiKeys([newKey, ...apiKeys]);
    setIsCreatingKey(false);
    setNewKeyName('');
  };

  const handleDeleteKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleCopy = (id, fullKey) => {
    navigator.clipboard.writeText(fullKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface font-sans selection:bg-primary-container/30">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium mb-8"
        >
          <ChevronLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-on-surface mb-2">Settings</h1>
          <p className="text-on-surface-variant">Manage your account preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
                }`}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveTab('api_keys')}
                className={`text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'api_keys' 
                    ? 'bg-primary text-on-primary' 
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
                }`}
              >
                API Keys
              </button>
              <button className="text-left px-4 py-2.5 rounded-lg font-medium text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors">
                Notifications
              </button>
              <button className="text-left px-4 py-2.5 rounded-lg font-medium text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors">
                Billing
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-[0px_10px_15px_-3px_rgba(15,23,42,0.05)]">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-xl font-bold text-on-surface mb-8">Profile Information</h2>
                  
                  {/* Profile Picture */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-on-surface-variant mb-4">Profile Picture</h3>
                    <div className="flex items-center gap-6">
                      <img 
                        src="https://i.pravatar.cc/150?img=33" 
                        alt="John Doe" 
                        className="w-16 h-16 rounded-full border border-outline-variant"
                      />
                      <button className="px-4 py-2 text-sm font-medium bg-surface border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container transition-colors shadow-sm">
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                        <User size={16} />
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        defaultValue="John Doe"
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                        <Mail size={16} />
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        defaultValue="atharvakolekar007@gmail.com"
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="mb-8 space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant">Role</label>
                    <div className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3">
                      <div className="font-semibold text-on-surface mb-1">Admin</div>
                      <div className="text-sm text-on-surface-variant">Full access to all platform features</div>
                    </div>
                  </div>

                  <hr className="border-t border-outline-variant mb-8" />

                  {/* Account Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Account Created</span>
                        <span className="text-on-surface font-medium flex items-center gap-2">
                          <Calendar size={16} className="text-outline" />
                          May 21, 2026
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-on-surface-variant">Last Login</span>
                        <span className="text-on-surface font-medium">May 21, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api_keys' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-on-surface">API Keys</h2>
                    {!isCreatingKey && (
                      <button 
                        onClick={() => setIsCreatingKey(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                      >
                        <Plus size={18} />
                        Create Key
                      </button>
                    )}
                  </div>

                  {/* Create Key Form */}
                  {isCreatingKey && (
                    <div className="mb-8 bg-surface-container-low border border-outline-variant rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="text-sm font-semibold text-on-surface block mb-2">Key Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Production API"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCreateKey}
                            disabled={!newKeyName.trim()}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Create Key
                          </button>
                          <button 
                            onClick={() => {
                              setIsCreatingKey(false);
                              setNewKeyName('');
                            }}
                            className="px-5 py-2.5 bg-surface hover:bg-surface-container border border-outline-variant text-on-surface font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keys List */}
                  <div className="space-y-4 mb-8">
                    {apiKeys.length === 0 ? (
                      <div className="text-center py-10 bg-surface-container-low border border-dashed border-outline-variant rounded-xl text-on-surface-variant">
                        No API keys generated yet.
                      </div>
                    ) : (
                      apiKeys.map((item) => (
                        <div key={item.id} className="bg-surface border border-outline-variant rounded-xl p-5 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <h3 className="font-semibold text-on-surface">{item.name}</h3>
                              
                              <div className="flex items-center gap-2 max-w-lg">
                                <code className="flex-1 bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface-variant font-mono truncate">
                                  {item.key}
                                </code>
                                <button 
                                  onClick={() => handleCopy(item.id, item.fullKey)}
                                  className="p-2 text-outline hover:text-primary hover:bg-primary-container/10 rounded-md transition-colors"
                                  title="Copy to clipboard"
                                >
                                  {copiedId === item.id ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                                </button>
                              </div>
                              
                              <div className="text-sm text-outline">
                                Last used: {item.lastUsed}
                              </div>
                            </div>

                            <button 
                              onClick={() => handleDeleteKey(item.id)}
                              className="p-2.5 text-error border border-error/20 hover:bg-error-container hover:border-error-container rounded-lg transition-colors flex-shrink-0 bg-surface"
                              title="Delete API Key"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Info Banner */}
                  <div className="bg-secondary-container/30 border border-secondary/30 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="text-secondary shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-on-secondary-container">
                      Keep your API keys secret. If you suspect a key has been compromised, revoke it immediately by deleting it and generating a new one.
                    </p>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
