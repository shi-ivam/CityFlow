import React from 'react';
import { calculateFleetMetrics } from '../../../services/vehicleService';

export default function FleetKPICards({ 
  busFleet = [], 
  activeFilter = 'ALL', 
  onSelectFilter 
}) {
  const metrics = calculateFleetMetrics(busFleet);

  const stats = [
    {
      id: 'ALL',
      label: 'Total Fleet',
      value: metrics.total,
      detail: 'Registered assets'
    },
    {
      id: 'IN_SERVICE',
      label: 'In Service',
      value: metrics.inService,
      detail: `${metrics.moving} active on routes`,
      highlight: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'STANDBY_READY',
      label: 'Standby Reserve',
      value: metrics.standby,
      detail: 'Available for dispatch',
      highlight: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'MAINTENANCE',
      label: 'Workshop & Inspection',
      value: metrics.maintenance,
      detail: metrics.maintenanceDueSoon > 0 ? `${metrics.maintenanceDueSoon} due this week` : '0 critical faults',
      highlight: metrics.maintenance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
      {stats.map((item) => {
        const isSelected = activeFilter === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectFilter && onSelectFilter(isSelected ? 'ALL' : item.id)}
            className={`text-left p-5 rounded-xl transition-all duration-150 cursor-pointer border ${
              isSelected 
                ? 'bg-card border-foreground/30 shadow-xs' 
                : 'bg-card/60 hover:bg-card border-border/60 hover:border-border'
            }`}
          >
            <div className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
              {item.label}
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <span className={`text-3xl font-light font-mono tracking-tight ${item.highlight || 'text-foreground'}`}>
                {item.value}
              </span>
            </div>

            <div className="text-xs text-muted-foreground mt-1 font-sans">
              {item.detail}
            </div>
          </button>
        );
      })}
    </div>
  );
}
