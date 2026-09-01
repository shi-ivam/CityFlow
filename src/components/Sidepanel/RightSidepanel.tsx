import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isDriverListOpen, setIsDriverListOpen] = useState<boolean>(false);

  return (
    <aside className="w-full h-full flex flex-col justify-between p-5 sm:p-6 bg-card border-l border-border select-none font-sans">
      
      {/* Top Brand Block: Minimal */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
            LIVE NETWORK
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            CITYFLOW
          </h1>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
            3.0
          </span>
        </div>
      </div>

      {/* 3 Essential Metric Cards (Section 11, 15) */}
      <div className="grid grid-cols-3 gap-2.5 my-6">
        <div className="p-3 rounded-xl bg-secondary/40 border border-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
            ACTIVE
          </span>
          <span className="text-lg font-bold font-mono text-foreground mt-1">
            {activeBuses.length || 10}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-secondary/40 border border-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
            ON-TIME
          </span>
          <span className="text-lg font-bold font-mono text-foreground mt-1">
            96.4%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-secondary/40 border border-border flex flex-col justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
            HEADWAY
          </span>
          <span className="text-lg font-bold font-mono text-foreground mt-1">
            6.2m
          </span>
        </div>
      </div>

      {/* Direct Action Buttons: Minimal & Crisp (Section 11, 12) */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {/* CONTROL ROOM Action Button */}
        <a
          href="/admin"
          onClick={(e) => {
            if (onNavigateAdmin) {
              e.preventDefault();
              onNavigateAdmin();
            }
          }}
          className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4" />
            <span>CONTROL ROOM</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* DRIVERS Dropdown / Action */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <button
            onClick={() => setIsDriverListOpen(!isDriverListOpen)}
            className="w-full flex items-center justify-between py-3 px-4 text-foreground font-sans text-sm font-bold hover:bg-muted/40 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>DRIVERS</span>
            </div>
            {isDriverListOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {isDriverListOpen && (
            <div className="p-2 border-t border-border space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
              {activeBuses.slice(0, 5).map((bus) => (
                <button
                  key={bus.id}
                  disabled={isTransitioning}
                  onClick={() => {
                    if (onSelectDriverForTransition) onSelectDriverForTransition(bus.driverId, bus.id);
                    else if (onNavigateDriver) onNavigateDriver(bus.driverId);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{bus.driverName}</span>
                  <span className="text-[10px] text-muted-foreground">Route {bus.routeCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Single Minimal Status Line */}
      <div className="pt-3 border-t border-border font-mono text-[10px] text-muted-foreground flex items-center justify-between">
        <span>● Active System</span>
        <span>v3.0</span>
      </div>

    </aside>
  );
};

export default RightSidepanel;
