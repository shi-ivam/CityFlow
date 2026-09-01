import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ChevronDown, ChevronUp, Search, Activity } from 'lucide-react';
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
    <aside className="w-full h-full flex flex-col justify-between p-6 md:p-8 bg-card border-l border-border select-none overflow-y-auto font-sans">
      {/* Top Context Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-foreground inline-block animate-pulse" />
          <span>Transit Control Hub</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Command Portals</h2>
        <p className="text-xs text-muted-foreground">
          Select a driver to view active duty cockpit or supervisory admin controls.
        </p>
      </div>

      {/* Main Action Portals Deck */}
      <div className="my-6 space-y-4">
        {/* 1. Driver Portal with Clean Dropdown */}
        <div className="border-2 border-border bg-secondary/30 rounded-lg overflow-hidden transition-all shadow-sm">
          {/* Driver Portal Toggle Button */}
          <button
            onClick={() => setIsDriverDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 bg-secondary/60 hover:bg-accent text-foreground font-mono text-base font-bold uppercase tracking-wider transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-foreground text-background flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">Driver Portal</div>
                <div className="text-[11px] font-normal text-muted-foreground capitalize font-sans">
                  Select Active Driver
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground">
              {isDriverDropdownOpen ? (
                <ChevronUp className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </div>
          </button>

          {/* Clean, Streamlined Driver List Dropdown */}
          {isDriverDropdownOpen && (
            <div className="p-2.5 bg-card border-t border-border space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Optional Minimal Filter */}
              {driverList.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search driver or route..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-secondary text-foreground text-xs font-mono rounded border border-border focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              )}

              {/* Simple Driver Rows: Driver Name (Left) & Route (Right) */}
              <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
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
                      className="w-full text-left px-3 py-2 bg-secondary/30 hover:bg-foreground hover:text-background rounded border border-border/50 transition-all duration-150 cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <span className="font-semibold text-xs text-foreground group-hover:text-background truncate">
                        {driver.name}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-muted-foreground group-hover:text-background/80 shrink-0">
                        Route {driver.routeCode}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Admin Portal Button */}
        <a
          href="/admin"
          onClick={(e) => {
            if (onNavigateAdmin) {
              e.preventDefault();
              onNavigateAdmin();
            }
          }}
          className="w-full flex items-center justify-center gap-4 py-5 px-6 rounded-lg bg-foreground text-background font-mono text-base font-bold uppercase tracking-wider shadow-md hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer text-center border-2 border-foreground"
        >
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <span>Admin Portal</span>
        </a>
      </div>

      {/* Footer System Info */}
      <div className="pt-4 border-t border-border font-mono text-[11px] text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-foreground animate-pulse" />
          <span>METROPOLITAN TRANSIT</span>
        </div>
        <span>v1.0.4 PROD</span>
      </div>
    </aside>
  );
};

export default RightSidepanel;
