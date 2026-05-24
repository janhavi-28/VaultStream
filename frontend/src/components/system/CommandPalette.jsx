import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = ({ open, onClose, role }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const commands = useMemo(() => {
    const base = [
      { label: 'Home', path: '/' },
      { label: 'Login', path: '/login' },
    ];
    if (role) {
      base.push({ label: 'Dashboard', path: `/${role}/dashboard` });
      base.push({ label: 'Settings', path: `/${role}/settings` });
    }
    return base;
  }, [role]);

  const filtered = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-20" onClick={onClose}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a command..."
          aria-label="Command palette"
          className="w-full border-b border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <ul className="max-h-72 overflow-y-auto p-2">
          {filtered.map((item) => (
            <li key={item.path}>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
