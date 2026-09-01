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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
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
      color: 'text-[#8693AB]',
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
      color: 'text-[#8693AB]',
      action: () => {
        onSelectDivision('delhi_south');
        onClose();
        onShowToast('Switched to Delhi South Division');
      }
    }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in select-none font-sans"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#212227' }}
        className="w-full max-w-xl bg-[#212227] border-2 border-[#8693AB] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#8693AB]/40 flex items-center space-x-3 bg-[#AAB9CF]">
          <Search className="w-5 h-5 text-[#212227] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fleet, crew, routes, duties, or commands..."
            className="flex-1 bg-transparent text-[#212227] placeholder-[#212227]/70 text-sm font-semibold outline-hidden"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-[#212227] hover:opacity-75 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-[#212227] text-[#AAB9CF] text-[10px] font-mono font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 divide-y divide-[#8693AB]/20 text-xs">
          
          {/* Quick Operations Commands */}
          {!query && (
            <div className="pt-1">
              <div className="text-[10px] font-mono uppercase text-[#8693AB] font-bold px-2 mb-1.5 tracking-wider">
                Quick Operations Commands
              </div>
              <div className="space-y-0.5">
                {quickCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#8693AB]/20 text-left transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${cmd.color}`} />
                        <span className="font-medium text-[#F1F5F9] group-hover:text-white">{cmd.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8693AB]">EXECUTE</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Buses */}
          {matchedBuses.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase text-[#8693AB] font-bold px-2 mb-1.5 tracking-wider">
                Vehicles &amp; Fleet ({matchedBuses.length})
              </div>
              <div className="space-y-0.5">
                {matchedBuses.map(bus => (
                  <button
                    key={bus.id}
                    onClick={() => {
                      if (onSelectBus) onSelectBus(bus.id);
                      onClose();
                      onShowToast(`Focusing vehicle telemetry on ${bus.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#8693AB]/20 text-left transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bus className="w-4 h-4 text-[#8693AB]" />
                      <span className="font-bold font-mono text-[#F1F5F9]">{bus.id}</span>
                      <span className="text-[#8693AB] truncate">{bus.model}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{bus.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Drivers */}
          {matchedDrivers.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase text-[#8693AB] font-bold px-2 mb-1.5 tracking-wider">
                Crew &amp; Drivers ({matchedDrivers.length})
              </div>
              <div className="space-y-0.5">
                {matchedDrivers.map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => {
                      onClose();
                      onShowToast(`Driver ${driver.name} selected. Shift duty active.`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#8693AB]/20 text-left transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4 text-[#8693AB]" />
                      <span className="font-bold text-[#F1F5F9]">{driver.name}</span>
                      <span className="text-[#8693AB] font-mono text-[10px]">({driver.id})</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8693AB]">{driver.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Routes */}
          {matchedRoutes.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase text-[#8693AB] font-bold px-2 mb-1.5 tracking-wider">
                Routes &amp; Corridors ({matchedRoutes.length})
              </div>
              <div className="space-y-0.5">
                {matchedRoutes.map(route => (
                  <button
                    key={route.id}
                    onClick={() => {
                      if (onSelectRoute) onSelectRoute(route.id);
                      onClose();
                      onShowToast(`Focusing corridor on ${route.name}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#8693AB]/20 text-left transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Route className="w-4 h-4" style={{ color: route.color }} />
                      <span className="font-bold text-[#F1F5F9]">{route.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8693AB]">{route.lengthKm} km</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Duties */}
          {matchedDuties.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase text-[#8693AB] font-bold px-2 mb-1.5 tracking-wider">
                Duty Assignments ({matchedDuties.length})
              </div>
              <div className="space-y-0.5">
                {matchedDuties.map(duty => (
                  <button
                    key={duty.id}
                    onClick={() => {
                      if (onSelectDuty) onSelectDuty(duty);
                      onClose();
                      onShowToast(`Selected duty ${duty.dutyCode} (${duty.startTime} - ${duty.endTime})`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#8693AB]/20 text-left transition group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4 text-[#8693AB]" />
                      <span className="font-bold font-mono text-[#F1F5F9]">{duty.dutyCode}</span>
                      <span className="text-[#8693AB] font-mono text-[10px]">{duty.startTime} - {duty.endTime}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400">{duty.driverId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query && matchedBuses.length === 0 && matchedDrivers.length === 0 && matchedRoutes.length === 0 && matchedDuties.length === 0 && (
            <div className="p-8 text-center text-[#8693AB]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm text-[#F1F5F9]">No operational assets matching "{query}"</p>
              <p className="text-[11px] mt-1 text-[#8693AB]">Try searching for "104", "Verma", "Route 42", or "DT-104"</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-2.5 bg-[#212227] border-t border-[#8693AB]/30 flex items-center justify-between text-[10px] font-mono text-[#8693AB]">
          <span>CityFlow Command Palette</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
