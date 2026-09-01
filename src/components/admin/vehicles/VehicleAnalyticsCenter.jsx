import React, { useState } from 'react';
import { BarChart3, TrendingUp, Zap, Clock, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function VehicleAnalyticsCenter({ busFleet = [], onOpenVehicleDrawer }) {
  const [rankingMetric, setRankingMetric] = useState('utilization');

  const rankedVehicles = [...busFleet].sort((a, b) => {
    if (rankingMetric === 'utilization') {
      return (b.status === 'IN_SERVICE' ? 92 : 30) - (a.status === 'IN_SERVICE' ? 92 : 30);
    } else if (rankingMetric === 'mileage') {
      return (b.odometerKm || 0) - (a.odometerKm || 0);
    } else if (rankingMetric === 'battery') {
      return (b.batteryPct || 0) - (a.batteryPct || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Insights KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-lg shadow-xs space-y-1">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">AVERAGE FLEET UTILIZATION</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">87.5%</div>
          <div className="text-[11px] text-muted-foreground flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>+4.2% vs previous week</span>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs space-y-1">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">ENERGY CONSUMPTION RATE</div>
          <div className="text-2xl font-bold text-foreground">1.18 kWh/km</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>Optimal thermal conditioning</span>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs space-y-1">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">AVERAGE WORKSHOP DOWNTIME</div>
          <div className="text-2xl font-bold text-foreground">0.3 hrs/day</div>
          <div className="text-[11px] text-muted-foreground">99.2% mechanical uptime</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs space-y-1">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">CORRIDOR SCHEDULE ADHERENCE</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">96.8%</div>
          <div className="text-[11px] text-muted-foreground">On-time transit departures</div>
        </div>
      </div>

      {/* Fleet Ranking Table */}
      <div className="bg-card border border-border rounded-lg shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-foreground uppercase flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Fleet Performance &amp; Productivity Ranking</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Rank operational transit assets by revenue utilization, mileage, and energy efficiency.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-muted-foreground">Rank by:</span>
            <select
              value={rankingMetric}
              onChange={(e) => setRankingMetric(e.target.value)}
              className="p-1.5 rounded bg-muted/40 border border-input text-foreground outline-none font-bold"
            >
              <option value="utilization">Revenue Utilization (%)</option>
              <option value="mileage">Cumulative Odometer (km)</option>
              <option value="battery">Battery SoC Health (%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px]">
                <th className="p-3">Rank</th>
                <th className="p-3">Asset ID</th>
                <th className="p-3">Registration</th>
                <th className="p-3">Vehicle Type</th>
                <th className="p-3">Assigned Route</th>
                <th className="p-3">Utilization</th>
                <th className="p-3">Odometer</th>
                <th className="p-3">Battery Health</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-sans text-xs">
              {rankedVehicles.map((bus, idx) => {
                const util = bus.status === 'IN_SERVICE' ? 92 : 28;
                return (
                  <tr 
                    key={bus.id} 
                    onClick={() => onOpenVehicleDrawer && onOpenVehicleDrawer(bus)}
                    className="hover:bg-muted/30 transition cursor-pointer"
                  >
                    <td className="p-3 font-mono font-bold text-foreground">#{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-primary">{bus.id}</td>
                    <td className="p-3 font-mono font-bold text-foreground">{bus.busNumber}</td>
                    <td className="p-3 text-muted-foreground">{bus.type}</td>
                    <td className="p-3 font-mono font-bold text-foreground">
                      {bus.assignedRoute ? `Route ${bus.assignedRoute}` : 'Depot Standby'}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{util}%</td>
                    <td className="p-3 font-mono text-foreground">{((bus.odometerKm || 50000) / 1000).toFixed(1)}k km</td>
                    <td className="p-3 font-mono text-emerald-600">{bus.batteryPct}%</td>
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bus.status === 'IN_SERVICE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
