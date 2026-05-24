import React, { useMemo, useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { PlayCircle, LogOut, Menu, Settings as SettingsIcon, User, UploadCloud, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import TenantSwitcher from '../components/tenant/TenantSwitcher';
import NotificationCenter from '../components/feedback/NotificationCenter';
import BottomNavigation from '../components/navigation/BottomNavigation';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const DashboardLayout = ({ navigationParams }) => {
  const { user, logout, role } = useAuth();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const shortcuts = useMemo(() => [{ combo: 'ctrl+b', handler: () => setSidebarOpen((prev) => !prev) }], []);
  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm transition-opacity lg:hidden" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center border-b border-gray-100 px-6 shrink-0">
          <NavLink to={`/${role}/dashboard`} onClick={() => setSidebarOpen(false)} className="relative z-10 flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
              <PlayCircle size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">VaultStream</span>
          </NavLink>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
          {navigationParams.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => {
                  const isWatchActive = item.name === 'Watch' && (window.location.pathname.startsWith('/viewer/dashboard') || window.location.pathname.startsWith('/viewer/watch'));
                  const active = isActive || isWatchActive;
                  return `relative z-10 flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    active ? 'border border-indigo-100 bg-indigo-50 font-medium text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`;
                }}
              >
                {({ isActive }) => {
                  const isWatchActive = item.name === 'Watch' && (window.location.pathname.startsWith('/viewer/dashboard') || window.location.pathname.startsWith('/viewer/watch'));
                  const active = isActive || isWatchActive;
                  return (
                    <>
                      <Icon size={18} className={active ? 'text-indigo-600' : 'text-gray-500'} />
                      {item.name}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>

        {role !== 'viewer' && (
          <div className="border-t border-gray-100 p-4 shrink-0">
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md shrink-0">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-ml-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
              <Menu size={24} />
            </button>
            <div className="min-w-0">
              {role === 'viewer' ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-1.5 shadow-sm">
                  <Building2 size={16} className="text-indigo-600 shrink-0" />
                  <span className="truncate text-sm font-bold text-slate-800">{currentTenant?.name || 'VaultStream'}</span>
                </div>
              ) : (
                <TenantSwitcher />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            {role !== 'viewer' && role !== 'editor' && <NotificationCenter />}
            
            {role === 'viewer' || role === 'editor' ? (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-3 md:gap-4 md:pl-4 lg:pl-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 font-bold text-indigo-700 shadow-sm shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                  <div className="hidden sm:flex sm:flex-col sm:items-start">
                    <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">{user?.name || 'User'}</span>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 ring-1 ring-inset ring-indigo-600/10 capitalize">
                      {role}
                    </span>
                  </div>
                  <span className="sm:hidden inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 ring-1 ring-inset ring-indigo-600/10 capitalize">
                    {role}
                  </span>
                </div>
                
                {(role === 'viewer' || role === 'editor') && (
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <LogOut size={14} className="shrink-0" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-3 md:gap-4 md:pl-4 lg:pl-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 font-bold text-indigo-700 shadow-sm shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                  <div className="hidden sm:flex sm:flex-col sm:items-start">
                    <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">{user?.name || 'Admin'}</span>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 ring-1 ring-inset ring-indigo-600/10 capitalize">
                      {role}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pb-24 flex-1 overflow-y-auto py-4 md:py-6 lg:pb-8 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl ultrawide:max-w-[1720px]">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNavigation navigationParams={navigationParams} />
    </div>
  );
};

export default DashboardLayout;
