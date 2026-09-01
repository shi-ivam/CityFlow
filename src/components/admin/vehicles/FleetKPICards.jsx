import React from 'react';
import { Bus, CheckCircle2, Clock, Wrench, ShieldAlert, Zap, Activity } from 'lucide-react';

export default function FleetKPICards({ 
  busFleet = [], 
  activeFilter = 'ALL', 
  onSelectFilter 
}) {
  const total = busFleet.length;
  const inService = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const standby = busFleet.filter(b => b.status === 'STANDBY_READY' || b.status === 'AVAILABLE').length;
  const maintenance = busFleet.filter(b => b.status === 'MAINTENANCE').length;
  const moving = busFleet.filter(b => b.status === 'IN_SERVICE' && (b.speedKmH > 0)).length;
  const maintenanceDueSoon = busFleet.filter(b => (b.nextServiceDate && (new Date(b.nextServiceDate) - new Date() < 15 * 86400000))).length;
  
  const utilizationPct = total > 0 ? ((inService / total) * 100).toFixed(1) : 0;
  const availabilityPct = total > 0 ? (((inService + standby) / total) * 100).toFixed(1) : 0;

  const cards = [
    {
      id: 'ALL',
      label: 'TOTAL FLEET',
      value: total,
      subtext: '100% registered assets',
      icon: Bus,
      color: 'text-foreground',
      borderActive: 'border-primary ring-1 ring-primary/30',
      badge: 'All Assets',
    },
    {
      id: 'IN_SERVICE',
      label: 'IN SERVICE',
      value: inService,
      subtext: `${utilizationPct}% fleet utilization`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      borderActive: 'border-emerald-500 ring-1 ring-emerald-500/30',
      badge: `${moving} Moving`,
    },
    {
      id: 'STANDBY_READY',
      label: 'STANDBY',
      value: standby,
      subtext: 'Ready for emergency dispatch',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      borderActive: 'border-amber-500 ring-1 ring-amber-500/30',
      badge: 'Depot Reserve',
    },
    {
      id: 'MAINTENANCE',
      label: 'MAINTENANCE',
      value: maintenance,
      subtext: maintenance === 0 ? '0 critical issues' : `${maintenance} in workshop`,
      icon: Wrench,
      color: 'text-rose-600 dark:text-rose-400',
      borderActive: 'border-rose-500 ring-1 ring-rose-500/30',
      badge: `${maintenanceDueSoon} Due Soon`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`text-left p-4 rounded-lg bg-card border transition-all cursor-pointer relative overflow-hidden group hover:border-foreground/30 shadow-xs ${
              isSelected ? card.borderActive : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
                {card.badge}
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <div className={`text-3xl font-bold font-mono tracking-tight ${card.color}`}>
                {card.value}
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between font-sans">
              <span>{card.subtext}</span>
              <Icon className="w-4 h-4 opacity-30 group-hover:opacity-70 transition-opacity" />
            </div>

            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
