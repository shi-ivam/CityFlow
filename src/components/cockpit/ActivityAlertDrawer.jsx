import React from 'react';
import { Bell, X, Activity, Radio, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function ActivityAlertDrawer({
  isOpen,
  onClose,
  events = [],
  onClearEvents
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in select-none font-sans">
      <div className="w-full max-w-sm bg-[#111827] border-l border-[#1f2937] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-[#0e1422] border-b border-[#1f2937] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Operational Activity Feed</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearEvents}
              className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#1f2937]"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1f2937]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {events.length > 0 ? (
            events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg bg-[#0b0f19] border border-[#1f2937] space-y-1 text-xs transition-colors hover:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      ev.severity === 'critical' ? 'bg-rose-500 animate-ping' : 
                      ev.severity === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">{ev.type}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{ev.timestamp}</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed font-sans">{ev.message}</p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              No recent activity logged.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#0e1422] border-t border-[#1f2937] text-center text-[10px] font-mono text-slate-400">
          Telemetry Stream • 124 pings/sec
        </div>

      </div>
    </div>
  );
}
