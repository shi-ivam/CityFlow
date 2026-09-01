import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Zap, Search, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { db } from '../../db/transitDb.js';

export default function AdminPerformance({ selectedCity = 'delhi' }) {
  const routes = db.getCollection(selectedCity, 'routes');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('punctuality');
  const [sortAsc, setSortAsc] = useState(false);

  const performanceData = useMemo(() => {
    return routes.map((r, i) => {
      const punctuality = Math.min(99, Math.round(84 + (i * 7) % 15));
      const onTimeDepartures = Math.round(punctuality * 0.48);
      const delayMins = (punctuality > 92 ? 1.2 : (100 - punctuality) * 0.4).toFixed(1);
      const dailyRidership = Math.round(4200 + ((i * 1321) % 5500));
      const evSharePct = Math.round(55 + (i * 9) % 45);

      return {
        ...r,
        punctuality,
        onTimeDepartures,
        delayMins,
        dailyRidership,
        evSharePct
      };
    });
  }, [routes]);

  const filtered = useMemo(() => {
    let list = performanceData.filter(r => 
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    list.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [performanceData, searchQuery, sortKey, sortAsc]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Service Reliability Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Corridor On-Time Performance & Ridership Metrics
          </h1>
          <p className="text-xs text-muted-foreground">
            Corridor-level schedule adherence, mean headway variances, and passenger throughput rankings.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Network Average: 91.4% Punctuality</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="text-muted-foreground uppercase text-[10px] font-bold">On-Time Performance</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">91.4%</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">±3 min schedule adherence</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="text-muted-foreground uppercase text-[10px] font-bold">Total Daily Ridership</div>
          <div className="text-2xl font-bold text-foreground mt-1">142,850</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Across {routes.length} corridors</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="text-muted-foreground uppercase text-[10px] font-bold">Mean Corridor Delay</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">2.4 min</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Low traffic peak variance</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="text-muted-foreground uppercase text-[10px] font-bold">Electric Fleet Share</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">68.2%</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Zero-emission operations</div>
        </div>
      </div>

      {/* Corridor Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <span className="font-bold text-foreground uppercase tracking-wider">
            Corridor Reliability Scorecard ({filtered.length})
          </span>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter corridor code or name..."
              className="w-full pl-8 pr-2 py-1 rounded bg-muted/50 border border-input text-xs font-sans outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-muted/20 border-b border-border text-[11px] text-muted-foreground uppercase">
              <tr>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('code')}>
                  <div className="flex items-center space-x-1">
                    <span>Route</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Corridor Name</th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('punctuality')}>
                  <div className="flex items-center space-x-1">
                    <span>Punctuality</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('delayMins')}>
                  <div className="flex items-center space-x-1">
                    <span>Mean Delay</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('dailyRidership')}>
                  <div className="flex items-center space-x-1">
                    <span>Daily Passengers</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">EV Fleet %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted text-foreground">
                      {r.code}
                    </span>
                  </td>
                  <td className="p-3 font-sans text-xs">
                    <div className="font-semibold text-foreground">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{r.lengthKm} km • Every {r.frequencyMins} mins</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${r.punctuality >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${r.punctuality}%` }}
                        />
                      </div>
                      <span className={`font-bold ${r.punctuality >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {r.punctuality}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    +{r.delayMins} min
                  </td>
                  <td className="p-3 font-mono">
                    {r.dailyRidership.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">
                      {r.evSharePct}% EV
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

