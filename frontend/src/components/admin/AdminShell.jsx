import React from 'react';

const AdminShell = ({ badge, title, description, actions, children }) => (
  <div className="space-y-6">
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.12),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] px-6 py-8 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {badge ? (
              <div className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm ring-1 ring-sky-100">
                {badge}
              </div>
            ) : null}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
    {children}
  </div>
);

export default AdminShell;
