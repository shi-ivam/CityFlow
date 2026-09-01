import React, { useState, useEffect } from 'react';
import { Search, X, Bus, Users, MapPin, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearchModal({
  isOpen,
  onClose,
  busFleet = [],
  crewMembers = [],
  routes = [],
  dutyAssignments = [],
  activeConflicts = []
}) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search items across domains
  const filteredBuses = q ? busFleet.filter(b => 
    b.busNumber?.toLowerCase().includes(q) || 
    b.id?.toLowerCase().includes(q) || 
    b.status?.toLowerCase().includes(q)
  ) : busFleet.slice(0, 3);

  const filteredDrivers = q ? crewMembers.filter(c => 
    c.name?.toLowerCase().includes(q) || 
    c.id?.toLowerCase().includes(q) || 
    c.licenseNumber?.toLowerCase().includes(q)
  ) : crewMembers.slice(0, 3);

  const filteredRoutes = q ? routes.filter(r => 
    r.code?.toLowerCase().includes(q) || 
    r.name?.toLowerCase().includes(q) || 
    r.id?.toLowerCase().includes(q)
  ) : routes.slice(0, 3);

  const filteredConflicts = q ? activeConflicts.filter(c => 
    c.description?.toLowerCase().includes(q) || 
    c.type?.toLowerCase().includes(q) || 
    c.crewId?.toLowerCase().includes(q)
  ) : activeConflicts.slice(0, 3);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-modal overflow-hidden flex flex-col font-sans">
        
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-muted/30">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search buses, drivers, routes, schedules, alerts... (Type to filter)"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm font-sans"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground text-xs mr-2"
            >
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          
          {/* Active Conflicts / Critical Alerts */}
          {filteredConflicts.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-500 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Operational Alerts & Conflicts ({filteredConflicts.length})</span>
              </div>
              <div className="space-y-1">
                {filteredConflicts.map((c, i) => (
                  <div
                    key={c.id || i}
                    onClick={() => handleNavigate('/admin/conflicts')}
                    className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <div>
                        <div className="text-xs font-mono font-semibold text-foreground">{c.type} — {c.crewId || 'Network'}</div>
                        <div className="text-xs text-muted-foreground">{c.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buses / Fleet */}
          {filteredBuses.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-primary" />
                <span>Fleet Buses ({filteredBuses.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredBuses.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleNavigate('/admin/fleet')}
                    className="p-2.5 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                        {b.busNumber || b.id}
                      </span>
                      <div>
                        <div className="text-xs font-medium text-foreground">{b.capacity} Seats</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{b.status}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drivers */}
          {filteredDrivers.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Crew & Drivers ({filteredDrivers.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredDrivers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleNavigate('/admin/drivers')}
                    className="p-2.5 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center border border-primary/20">
                        {c.name ? c.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{c.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{c.id} • {c.licenseNumber}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Routes */}
          {filteredRoutes.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Route Corridors ({filteredRoutes.length})</span>
              </div>
              <div className="space-y-1">
                {filteredRoutes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleNavigate('/admin/routes')}
                    className="p-2.5 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        Route {r.code}
                      </span>
                      <div>
                        <div className="text-xs font-medium text-foreground">{r.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{r.lengthKm} km Corridor</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredBuses.length === 0 && filteredDrivers.length === 0 && filteredRoutes.length === 0 && filteredConflicts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm font-sans">
              No matching transit assets or records found for "<span className="font-mono text-foreground">{query}</span>".
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-border bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center space-x-3">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <span>CityFlow Dispatch Command HUD</span>
        </div>

      </div>
    </div>
  );
}
