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
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in select-none font-sans"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#212227] border-l-2 border-[#8693AB] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#212227] border-b-2 border-[#8693AB]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#AAB9CF]" />
            <h3 className="font-bold text-sm text-[#F1F5F9]">Operational Activity Feed</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearEvents}
              className="text-[10px] font-mono text-[#212227] font-bold hover:bg-[#96A3BC] px-2.5 py-1 rounded-lg bg-[#8693AB] transition active:scale-95 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="text-[#AAB9CF] hover:text-white p-1 rounded-lg hover:bg-[#8693AB]/20 transition cursor-pointer"
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
                className="p-2.5 rounded-xl bg-[#282A31] border border-[#8693AB]/40 text-xs space-y-1 hover:border-[#8693AB] transition shadow-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center space-x-1.5">
                    {ev.severity === 'critical' ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    ) : ev.severity === 'warning' ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                    <span className="font-bold text-[#AAB9CF]">{ev.type}</span>
                  </div>
                  <span className="text-[#8693AB]">{ev.timestamp}</span>
                </div>
                <p className="text-[#F1F5F9] font-medium leading-tight">{ev.message}</p>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#8693AB] space-y-2 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
              <p className="font-semibold text-xs text-[#F1F5F9]">All telemetry streams nominal</p>
              <p className="text-[11px] text-[#8693AB]">No critical dispatches or violations flagged.</p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#212227] border-t-2 border-[#8693AB]/40 flex items-center justify-between text-[10px] font-mono text-[#8693AB]">
          <span>CityFlow Dispatch Telemetry</span>
          <span>Buffer: 50 events</span>
        </div>
      </div>
    </div>
  );
}
