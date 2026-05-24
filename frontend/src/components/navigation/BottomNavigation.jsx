import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNavigation = ({ navigationParams = [] }) => (
  <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden mobile-safe-bottom">
    <div className="scrollbar-hide flex items-stretch gap-1 overflow-x-auto px-2 py-2">
      {navigationParams.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) => {
              const isWatchActive = item.name === 'Watch' && (window.location.pathname.startsWith('/viewer/dashboard') || window.location.pathname.startsWith('/viewer/watch'));
              const active = isActive || isWatchActive;
              return `min-w-[78px] flex-1 rounded-2xl px-3 py-2 text-center text-[11px] font-medium transition ${
                active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`;
            }}
          >
            {({ isActive }) => {
              const isWatchActive = item.name === 'Watch' && (window.location.pathname.startsWith('/viewer/dashboard') || window.location.pathname.startsWith('/viewer/watch'));
              const active = isActive || isWatchActive;
              return (
                <div className="flex flex-col items-center gap-1">
                  <Icon size={18} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="leading-tight">{item.name}</span>
                </div>
              );
            }}
          </NavLink>
        );
      })}
    </div>
  </nav>
);

export default BottomNavigation;
