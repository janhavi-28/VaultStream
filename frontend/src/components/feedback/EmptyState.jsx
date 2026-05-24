import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo, secondaryAction, tone = 'slate' }) => {
  const toneMap = {
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${toneMap[tone]}`}>
        {Icon ? <Icon size={28} /> : null}
      </div>
      <h3 className="mt-5 text-2xl font-bold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionTo ? (
          <Link to={actionTo} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            {actionLabel}
          </Link>
        ) : null}
        {secondaryAction}
      </div>
    </div>
  );
};

export default EmptyState;
