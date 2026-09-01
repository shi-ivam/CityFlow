import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';

export default function AlertToastContainer({
  alerts = [],
  onDismissAlert,
  onResolveAlertAction
}) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[3500] space-y-2.5 max-w-sm w-full font-sans pointer-events-none">
      {alerts.map((alert) => {
        const isSuccess = alert.type === 'SUCCESS';
        const isCritical = alert.type === 'CRITICAL';
        const isWarning = alert.type === 'WARNING';

        return (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border shadow-2xl pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'bg-emerald-950/90 text-white border-emerald-500/50 dark:bg-emerald-950/95'
                : isCritical
                ? 'bg-rose-950/90 text-white border-rose-500/50 dark:bg-rose-950/95'
                : 'bg-amber-950/90 text-white border-amber-500/50 dark:bg-amber-950/95'
            }`}
          >
            <div className="flex items-start justify-between space-x-2">
              <div className="flex items-start space-x-2.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : isCritical ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-0.5">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {alert.title}
                  </div>
                  <div className="text-xs font-medium leading-snug">
                    {alert.message}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDismissAlert && onDismissAlert(alert.id)}
                className="p-1 text-white/60 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Trigger Button */}
            {alert.actionLabel && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-end">
                <button
                  onClick={() => onResolveAlertAction && onResolveAlertAction(alert)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
                    isSuccess
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : isCritical
                      ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm'
                      : 'bg-amber-600 text-white hover:bg-amber-500'
                  }`}
                >
                  <span>{alert.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
