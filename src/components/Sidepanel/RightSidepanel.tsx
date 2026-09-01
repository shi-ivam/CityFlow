import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Activity, 
  Bus, 
  Clock, 
  ArrowRight,
  Zap,
  MapPin
} from 'lucide-react';
import { ActiveBus } from '../../types/transit';

interface RightSidepanelProps {
  activeBuses?: ActiveBus[];
  onSelectDriverForTransition?: (driverId: string, busId: string) => void;
  onNavigateDriver?: (driverId?: string) => void;
  onNavigateAdmin?: () => void;
  isTransitioning?: boolean;
}

export const RightSidepanel: React.FC<RightSidepanelProps> = ({
  activeBuses = [],
  onSelectDriverForTransition,
  onNavigateDriver,
  onNavigateAdmin,
  isTransitioning = false,
}) => {
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique driver list with name and route code
  const driverList = activeBuses.map((bus) => ({
    driverId: bus.driverId,
    name: bus.driverName,
    busId: bus.id,
    routeCode: bus.routeCode,
    speed: bus.speedKmH,
    status: bus.status
  }));

  // Filter drivers based on simple name or route search
  const filteredDrivers = driverList.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.routeCode.toLowerCase().includes(q) ||
      `route ${d.routeCode}`.toLowerCase().includes(q)
    );
  });

  const handleSelectDriver = (driverId: string, busId: string) => {
    if (onSelectDriverForTransition) {
      onSelectDriverForTransition(driverId, busId);
    } else if (onNavigateDriver) {
      onNavigateDriver(driverId);
    }
  };

  return (
    <aside className="w-full h-full flex flex-col justify-between p-5 md:p-6 bg-card border-l border-border select-none overflow-y-auto font-sans shadow-xs">
      
      {/* Top Context Header with Lavender-Grey Styling */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
            Network Operations Center
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-sans">
          CityFlow <span className="text-primary font-mono text-sm px-1.5 py-0.5 rounded bg-primary/10">3.0</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-Time Transit Scheduling & Fleet Telemetry Engine
        </p>
      </div>

      {/* Live Operational Metric Chips */}
      <div className="grid grid-cols-3 gap-2 my-4">
        <div className="p-2.5 rounded-xl bg-secondary/50 border border-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Active Fleet</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-base font-bold font-mono text-foreground">{activeBuses.length}</span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-secondary/50 border border-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">On-Time</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-base font-bold font-mono text-foreground">96.4%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-secondary/50 border border-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Headway</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-base font-bold font-mono text-foreground">6.2m</span>
          </div>
        </div>
      </div>

      {/* Main Action Portals Deck */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-center">
        
        {/* 1. Admin Control Room Primary Action Button */}
        <a
          href="/admin"
          onClick={(e) => {
            if (onNavigateAdmin) {
              e.preventDefault();
              onNavigateAdmin();
            }
          }}
          className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight">Transit Control Room</div>
              <div className="text-[11px] font-normal text-primary-foreground/80 font-mono">
                Launch Mission Cockpit & Gantt
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* 2. Driver Portal with Clean Dropdown */}
        <div className="border border-border bg-secondary/40 rounded-xl overflow-hidden transition-all shadow-2xs">
          {/* Driver Portal Toggle Button */}
          <button
            onClick={() => setIsDriverDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-3.5 bg-card hover:bg-muted/60 text-foreground font-sans text-sm font-bold transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Driver Shift Portal</div>
                <div className="text-[11px] font-normal text-muted-foreground font-mono">
                  Select Active Driver Pilot
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-muted-foreground group-hover:text-foreground">
              {isDriverDropdownOpen ? (
                <ChevronUp className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </div>
          </button>

          {/* Streamlined Driver List Dropdown */}
          {isDriverDropdownOpen && (
            <div className="p-2.5 bg-card border-t border-border space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Filter Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search driver name or route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-secondary text-foreground text-xs font-mono rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Driver Rows */}
              <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5 font-mono text-xs">
                {filteredDrivers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground font-mono">
                    No drivers found
                  </div>
                ) : (
                  filteredDrivers.map((driver) => (
                    <button
                      key={driver.driverId}
                      disabled={isTransitioning}
                      onClick={() => handleSelectDriver(driver.driverId, driver.busId)}
                      className="w-full text-left px-3 py-2 bg-card hover:bg-primary/10 rounded-lg border border-border hover:border-primary/40 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-foreground group-hover:text-primary truncate">
                          {driver.name}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground shrink-0">
                        {driver.routeCode}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer System Info in Lavender-Grey */}
      <div className="pt-3 border-t border-border font-mono text-[10px] text-muted-foreground flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>CITYFLOW METROPOLITAN ENGINE</span>
        </div>
        <span>v3.2 PROD</span>
      </div>

    </aside>
  );
};

export default RightSidepanel;
