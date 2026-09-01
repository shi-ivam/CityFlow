import React from 'react';
import {
  Clock,
  Activity,
  Navigation,
  AlertTriangle,
  RefreshCw,
  Bus,
  Radio,
} from 'lucide-react';

export type DriverModuleId =
  | 'module1'
  | 'module2'
  | 'module3'
  | 'module4'
  | 'module5'
  | 'module6'
  | 'module7';

export interface DriverModuleDef {
  id: DriverModuleId;
  code: string;
  shortTitle: string;
  fullTitle: string;
  issues: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  completedTodos: number;
  totalTodos: number;
}

export const DRIVER_MODULES: DriverModuleDef[] = [
  {
    id: 'module1',
    code: 'M1',
    shortTitle: 'Shift',
    fullTitle: 'Duty & Shift Management',
    issues: 'Issues #2, #4, #6',
    icon: Clock,
    description: 'Duty clock, shift timer, swap requests, and digital sign-on custody badge',
    completedTodos: 5,
    totalTodos: 6,
  },
  {
    id: 'module2',
    code: 'M2',
    shortTitle: 'Fatigue',
    fullTitle: 'Fatigue & Route Rotation',
    issues: 'Issues #3, #4',
    icon: Activity,
    description: 'Fatigue gauges, route rotation fairness, rest countdown, and workload analytics',
    completedTodos: 4,
    totalTodos: 5,
  },
  {
    id: 'module3',
    code: 'M3',
    shortTitle: 'Trip',
    fullTitle: 'Trip & Passenger Load',
    issues: 'Issues #1, #2, #5, #6',
    icon: Navigation,
    description: 'Turn-by-turn telemetry, next stop ETA, passenger capacity, and stop boarding',
    completedTodos: 2,
    totalTodos: 5,
  },
  {
    id: 'module4',
    code: 'M4',
    shortTitle: 'Overflow',
    fullTitle: 'Passenger Overflow & Detour',
    issues: 'Issues #1, #7',
    icon: AlertTriangle,
    description: '1-tap overflow report, assistance candidate dispatch, and detour rerouting',
    completedTodos: 0,
    totalTodos: 8,
  },
  {
    id: 'module5',
    code: 'M5',
    shortTitle: 'Relief',
    fullTitle: 'Relief & Changeover Protocol',
    issues: 'Issue #8',
    icon: RefreshCw,
    description: '200km segment briefing, approaching relief alert, and digital handover checklist',
    completedTodos: 0,
    totalTodos: 6,
  },
  {
    id: 'module6',
    code: 'M6',
    shortTitle: 'Return',
    fullTitle: 'Return Transit Management',
    issues: 'Issue #8',
    icon: Bus,
    description: 'Post-duty return bus matcher, transit seat reservation, and arrival confirmation',
    completedTodos: 0,
    totalTodos: 6,
  },
  {
    id: 'module7',
    code: 'M7',
    shortTitle: 'Comms',
    fullTitle: 'Comms & Notification Feed',
    issues: 'Issues #1, #4, #6, #7, #8',
    icon: Radio,
    description: 'Real-time alert center drawer, audible chimes, and 1-touch dispatcher 10-codes',
    completedTodos: 0,
    totalTodos: 3,
  },
];

interface DriverModuleMenuProps {
  activeModule: DriverModuleId;
  onSelectModule: (moduleId: DriverModuleId) => void;
}

export const DriverModuleMenu: React.FC<DriverModuleMenuProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const currentDef = DRIVER_MODULES.find((m) => m.id === activeModule) || DRIVER_MODULES[0];

  return (
    <div className="bg-card border border-border rounded p-2.5 sm:p-3 shadow-sm font-sans shrink-0">
      {/* Menu Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border text-xs">
        <span className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
          FEATURES.MD MODULE SELECTOR
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          7 Modules
        </span>
      </div>

      {/* Grid of Square Blocks */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DRIVER_MODULES.map((mod) => {
          const isActive = mod.id === activeModule;
          const Icon = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`aspect-square flex flex-col items-center justify-between p-1 sm:p-1.5 rounded transition-all cursor-pointer border select-none group relative ${
                isActive
                  ? 'bg-foreground text-background border-foreground shadow-md ring-1 ring-foreground/40'
                  : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border hover:border-foreground/30'
              }`}
              title={`${mod.code}: ${mod.fullTitle} (${mod.issues})`}
            >
              {/* Top: Code */}
              <span
                className={`font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-none ${
                  isActive ? 'text-background' : 'text-foreground/80'
                }`}
              >
                {mod.code}
              </span>

              {/* Center: Icon */}
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-background' : 'text-foreground'
                }`}
              />

              {/* Bottom: Short Label */}
              <span
                className={`font-mono text-[8px] sm:text-[9px] font-semibold truncate max-w-full leading-none ${
                  isActive ? 'text-background' : 'text-muted-foreground'
                }`}
              >
                {mod.shortTitle}
              </span>

              {/* Active Indicator Pip */}
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-background rounded-full border border-foreground inline-block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Module Banner Context */}
      <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-xs">
        <div className="min-w-0 pr-2">
          <div className="font-bold text-foreground font-mono text-[11px] truncate">
            {currentDef.code}: {currentDef.fullTitle}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono truncate">
            {currentDef.issues} • {currentDef.description}
          </div>
        </div>
        <div className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 bg-secondary rounded border border-border text-foreground font-semibold">
          {currentDef.completedTodos}/{currentDef.totalTodos} TODOs
        </div>
      </div>
    </div>
  );
};
