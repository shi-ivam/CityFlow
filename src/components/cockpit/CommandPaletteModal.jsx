import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Bus, 
  Users, 
  Route, 
  AlertTriangle, 
  Play, 
  Pause, 
  Layers, 
  Calendar,
  Sparkles,
  Command
} from 'lucide-react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  buses = [],
  drivers = [],
  routes = [],
  duties = [],
  onSelectBus,
  onSelectRoute,
  onSelectDuty,
  onOpenConflicts,
  onToggleSimulating,
  isSimulating,
  onSelectDivision,
  onShowToast
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle trigger
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search matches
  const matchedBuses = buses.filter(b => b.id.toLowerCase().includes(q) || b.regNumber.toLowerCase().includes(q));
  const matchedDrivers = drivers.filter(d => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
  const matchedRoutes = routes.filter(r => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
  const matchedDuties = duties.filter(d => d.id.toLowerCase().includes(q) || d.dutyCode.toLowerCase().includes(q));

  const quickCommands = [
    {
      id: 'cmd-sim',
      title: isSimulating ? 'Pause Dispatch Simulation' : 'Start Live Dispatch Simulation',
      icon: isSimulating ? Pause : Play,
      color: 'text-emerald-400',
      action: () => {
        onToggleSimulating();
        onClose();
      }
    },
    {
      id: 'cmd-conflicts',
      title: 'Open Mission-Critical Conflict Engine',
      icon: AlertTriangle,
      color: 'text-rose-400',
      action: () => {
        onOpenConflicts();
        onClose();
      }
    },
    {
      id: 'cmd-div-central',
      title: 'Switch to Delhi Central Division',
      icon: Layers,
      color: 'text-indigo-400',
      action: () => {
        onSelectDivision('delhi_central');
        onClose();
        onShowToast('Switched to Delhi Central Division');
      }
    },
    {
      id: 'cmd-div-south',
      title: 'Switch to Delhi South Division',
      icon: Layers,
      color: 'text-indigo-400',
      action: () => {
        onSelectDivision('delhi_south');
        onClose();
        onShowToast('Switched to Delhi South Division');
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in select-none font-sans">
      <div className="w-full max-w-xl bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#1f2937] flex items-center space-x-3 bg-[#0e1422]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search buses, drivers, routes, duties, or quick commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1f2937] text-slate-400 border border-slate-700">ESC</kbd>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          
          {/* Quick Commands */}
          {(!query || 'simulation conflicts division'.includes(q)) && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Quick Operations Commands
              </div>
              <div className="space-y-0.5">
                {quickCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-slate-200 hover:bg-[#1a2333] hover:text-white transition"
                    >
                      <Icon className={`w-3.5 h-3.5 ${cmd.color}`} />
                      <span>{cmd.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Buses */}
          {matchedBuses.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Fleet Buses ({matchedBuses.length})
              </div>
              <div className="space-y-0.5">
                {matchedBuses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBus(b.id);
                      onClose();
                      onShowToast(`Focused on Bus ${b.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1a2333] transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Bus className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono font-bold text-white">{b.id}</span>
                      <span className="text-slate-400 text-[11px]">({b.regNumber})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{b.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Drivers */}
          {matchedDrivers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Crew & Drivers ({matchedDrivers.length})
              </div>
              <div className="space-y-0.5">
                {matchedDrivers.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onClose();
                      onShowToast(`Selected Driver ${d.name} (${d.id})`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1a2333] transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-white">{d.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({d.id})</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{d.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Routes */}
          {matchedRoutes.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Corridor Routes ({matchedRoutes.length})
              </div>
              <div className="space-y-0.5">
                {matchedRoutes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRoute(r.id);
                      onClose();
                      onShowToast(`Selected Route ${r.name}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1a2333] transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Route className="w-3.5 h-3.5" style={{ color: r.color }} />
                      <span className="font-bold text-white">{r.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{r.lengthKm} km</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Duties */}
          {matchedDuties.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Duty Rosters ({matchedDuties.length})
              </div>
              <div className="space-y-0.5">
                {matchedDuties.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectDuty(d);
                      onClose();
                      onShowToast(`Inspected duty ${d.dutyCode}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1a2333] transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono font-bold text-white">{d.dutyCode}</span>
                      <span className="text-[11px] text-slate-400">({d.startTime} – {d.endTime})</span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300">{d.busId} • {d.driverId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query && matchedBuses.length === 0 && matchedDrivers.length === 0 && matchedRoutes.length === 0 && matchedDuties.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No operational records found matching "{query}"
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#0e1422] border-t border-[#1f2937] text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>Navigate: ↑ ↓ • Select: Enter • Close: ESC</span>
          <span>CityFlow Operations HUD</span>
        </div>

      </div>
    </div>
  );
}
