import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ValidationAlert = ({ alerts, onDismiss }) => {
  if (!alerts.length) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-950">Some files were skipped</h3>
            <div className="mt-2 space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl bg-white/70 px-3 py-2 text-sm text-amber-900">
                  <span className="font-medium">{alert.fileName}</span>
                  <span className="text-amber-700">: {alert.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-2 text-amber-700 transition hover:bg-amber-100 hover:text-amber-900"
          aria-label="Dismiss validation alerts"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ValidationAlert;
