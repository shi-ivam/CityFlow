import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Bus, 
  Route, 
  UserCheck, 
  Wrench, 
  Plus, 
  Download, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  X,
  Command,
  ArrowRight
} from 'lucide-react';

export default function VehicleCommandPalette({
  isOpen,
  onClose,
  busFleet = [],
  routes = [],
  crewMembers = [],
  onSelectVehicle,
  onAddVehicle,
  onOpenMap,
  onOpenMaintenance,
  onOpenCompliance,
  onOpenDispatch,
  onExportCSV
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter commands and search items
  const q = query.toLowerCase();

  const commandItems = [
    {
      id: 'cmd-add-vehicle',
      category: 'ACTIONS',
      title: 'Register New Fleet Asset',
      detail: 'Add a new bus with registration, VIN, and specifications',
      icon: Plus,
      action: () => { onClose(); onAddVehicle(); }
    },
    {
      id: 'cmd-dispatch',
      category: 'ACTIONS',
      title: 'Open Vehicle Dispatch Wizard',
      detail: 'Validate trip readiness and dispatch vehicle to corridor',
      icon: Route,
      action: () => { onClose(); onOpenDispatch(); }
    },
    {
      id: 'cmd-schedule-maint',
      category: 'ACTIONS',
      title: 'Issue Workshop Work Order',
      detail: 'Schedule maintenance, assign technician, and reserve workshop bay',
      icon: Wrench,
      action: () => { onClose(); onOpenMaintenance(); }
    },
    {
      id: 'cmd-export-csv',
      category: 'ACTIONS',
      title: 'Export Fleet Records (CSV)',
      detail: 'Download full fleet roster and telemetry as CSV file',
      icon: Download,
      action: () => { onClose(); onExportCSV(); }
    },
    {
      id: 'cmd-compliance',
      category: 'VIEWS',
      title: 'Compliance & Document Expiry Center',
      detail: 'Monitor RC, Insurance, Fitness, and PUC certificates',
      icon: ShieldCheck,
      action: () => { onClose(); onOpenCompliance(); }
    },
    {
      id: 'cmd-map',
      category: 'VIEWS',
      title: 'Live Fleet Telemetry & GPS Spatial Map',
      detail: 'Track moving and idle buses across Delhi NCR corridors',
      icon: MapPin,
      action: () => { onClose(); onOpenMap(); }
    }
  ];

  // Search matching vehicles
  const matchingVehicles = busFleet.filter(b => 
    b.busNumber.toLowerCase().includes(q) ||
    b.id.toLowerCase().includes(q) ||
    b.type.toLowerCase().includes(q) ||
    (b.assignedRoute && b.assignedRoute.toLowerCase().includes(q)) ||
    (b.assignedDriver && b.assignedDriver.toLowerCase().includes(q)) ||
    (b.depot && b.depot.toLowerCase().includes(q))
  ).slice(0, 6).map(b => ({
    id: `veh-${b.id}`,
    category: 'FLEET ASSETS',
    title: `${b.busNumber} (${b.id})`,
    detail: `${b.type} • ${b.assignedRoute ? `Route ${b.assignedRoute}` : 'Standby'} • ${b.depot || 'ISBT'} • ${b.batteryPct}% SoC`,
    icon: Bus,
    action: () => { onClose(); onSelectVehicle(b); }
  }));

  // Combine items
  const filteredCommands = commandItems.filter(c => 
    c.title.toLowerCase().includes(q) || c.detail.toLowerCase().includes(q)
  );

  const allResults = [...filteredCommands, ...matchingVehicles];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-start justify-center pt-[10vh] p-4 font-sans text-foreground animate-in fade-in duration-150">
      <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col font-mono text-xs animate-in zoom-in-95 duration-150">
        
        {/* Search Bar Input */}
        <div className="p-3.5 border-b border-border flex items-center space-x-3 bg-muted/20">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search vehicles, routes, drivers... (Esc to exit)"
            className="w-full bg-transparent text-sm text-foreground outline-none font-sans placeholder:text-muted-foreground"
          />
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-border/40">
          {allResults.length > 0 ? (
            allResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition ${
                    isSelected ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-sans font-bold">{item.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${
                          isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <div className={`text-[11px] font-sans ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.detail}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground font-sans text-xs">
              No matching commands or fleet assets found for "{query}".
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="p-2.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
          <span className="font-bold text-foreground">CITYFLOW FLEET COMMAND</span>
        </div>

      </div>
    </div>,
    document.body
  );
}
