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
  shortTitle: string;
  fullTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DRIVER_MODULES: DriverModuleDef[] = [
  {
    id: 'module1',
    shortTitle: 'Shift',
    fullTitle: 'Duty & Shift Management',
    icon: Clock,
  },
  {
    id: 'module2',
    shortTitle: 'Fatigue',
    fullTitle: 'Fatigue & Route Rotation',
    icon: Activity,
  },
  {
    id: 'module3',
    shortTitle: 'Trip',
    fullTitle: 'Trip & Passenger Load',
    icon: Navigation,
  },
  {
    id: 'module4',
    shortTitle: 'Overflow',
    fullTitle: 'Passenger Overflow & Detour',
    icon: AlertTriangle,
  },
  {
    id: 'module5',
    shortTitle: 'Relief',
    fullTitle: 'Relief & Changeover Protocol',
    icon: RefreshCw,
  },
  {
    id: 'module6',
    shortTitle: 'Return',
    fullTitle: 'Return Transit Management',
    icon: Bus,
  },
  {
    id: 'module7',
    shortTitle: 'Comms',
    fullTitle: 'Comms & Notification Feed',
    icon: Radio,
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
  return (
    <div className="bg-card border border-border rounded-xl p-2 sm:p-2.5 select-none font-sans shrink-0 shadow-xs">
      {/* Grid of Square Blocks */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DRIVER_MODULES.map((mod) => {
          const isActive = mod.id === activeModule;
          const Icon = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`aspect-square flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-lg transition-all cursor-pointer border select-none active:scale-[0.97] ${
                isActive
                  ? 'bg-cf-primary text-white border-cf-primary font-semibold shadow-xs'
                  : 'bg-muted/30 hover:bg-cf-sky/30 text-muted-foreground hover:text-foreground border-border'
              }`}
              title={mod.fullTitle}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-cf-primary'}`} />
              <span className="text-[10px] sm:text-xs font-mono tracking-tight leading-none text-center">
                {mod.shortTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
