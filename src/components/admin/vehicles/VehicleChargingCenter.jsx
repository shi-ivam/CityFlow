import React, { useState } from 'react';
import { Zap, BatteryCharging, CheckCircle2, Clock, AlertTriangle, Play, Square } from 'lucide-react';

export default function VehicleChargingCenter({ busFleet = [], onUpdateVehicle }) {
  // Filter EV vehicles
  const evFleet = busFleet.filter(b => b.fuelType === 'ELECTRIC' || b.type.toLowerCase().includes('ev'));

  // Local charging state
  const [chargingBays, setChargingBays] = useState([
    { id: 'BAY-01', depot: 'Kashmere Gate ISBT', busId: 'bus-101', busNumber: 'DL 1PC 4821', status: 'CHARGING', powerKw: 120, batteryPct: 78, estMinutes: 22 },
    { id: 'BAY-02', depot: 'Kashmere Gate ISBT', busId: null, busNumber: null, status: 'AVAILABLE', powerKw: 0, batteryPct: null, estMinutes: 0 },
    { id: 'BAY-03', depot: 'Anand Vihar Hub', busId: 'bus-201', busNumber: 'MH 12 KT 7421', status: 'CHARGING', powerKw: 150, batteryPct: 62, estMinutes: 38 },
    { id: 'BAY-04', depot: 'Dwarka Sector 21', busId: null, busNumber: null, status: 'AVAILABLE', powerKw: 0, batteryPct: null, estMinutes: 0 },
  ]);

  const handleToggleCharging = (bayId) => {
    setChargingBays(prev => prev.map(bay => {
      if (bay.id === bayId) {
        if (bay.status === 'CHARGING') {
          return { ...bay, status: 'COMPLETED', powerKw: 0, estMinutes: 0 };
        } else if (bay.status === 'AVAILABLE') {
          const availableBus = evFleet.find(b => b.batteryPct < 85);
          if (availableBus) {
            return {
              ...bay,
              busId: availableBus.id,
              busNumber: availableBus.busNumber,
              status: 'CHARGING',
              powerKw: 120,
              batteryPct: availableBus.batteryPct,
              estMinutes: Math.round(((100 - availableBus.batteryPct) / 100) * 60)
            };
          }
        }
      }
      return bay;
    }));
  };

  const activeChargers = chargingBays.filter(b => b.status === 'CHARGING').length;
  const totalPowerKw = chargingBays.reduce((acc, b) => acc + (b.powerKw || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Energy Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">TOTAL EV ASSETS</div>
          <div className="text-2xl font-bold text-foreground mt-1">{evFleet.length} Buses</div>
          <div className="text-[11px] text-muted-foreground mt-1">100% Zero-Emission Fleet</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">ACTIVE CHARGING SESSIONS</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeChargers} Bays</div>
          <div className="text-[11px] text-muted-foreground mt-1">{totalPowerKw} kW Total Grid Draw</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">FLEET ENERGY EFFICIENCY</div>
          <div className="text-2xl font-bold text-foreground mt-1">1.18 kWh/km</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">-8% vs standard DTC benchmark</div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg shadow-xs">
          <div className="text-[10px] text-muted-foreground uppercase font-bold">AVERAGE FLEET BATTERY</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {evFleet.length > 0 ? Math.round(evFleet.reduce((a, b) => a + (b.batteryPct || 90), 0) / evFleet.length) : 85}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Optimal thermal range (24°C)</div>
        </div>
      </div>

      {/* Charging Bay Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-foreground uppercase flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Depot DC Fast Charging Terminals (150 kW CCS-2)</span>
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            {chargingBays.filter(b => b.status === 'AVAILABLE').length} of {chargingBays.length} Bays Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {chargingBays.map(bay => {
            const isCharging = bay.status === 'CHARGING';
            const isAvailable = bay.status === 'AVAILABLE';

            return (
              <div key={bay.id} className="p-4 bg-card border border-border rounded-lg space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <span className="font-bold text-base text-foreground">{bay.id}</span>
                    <span className="text-[11px] text-muted-foreground ml-2">({bay.depot})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCharging ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 animate-pulse' :
                    isAvailable ? 'bg-muted text-muted-foreground border border-border' :
                    'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                  }`}>
                    {bay.status}
                  </span>
                </div>

                {bay.busNumber ? (
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Vehicle: {bay.busNumber}</span>
                      <span className="text-emerald-600">{bay.powerKw} kW Rate</span>
                    </div>

                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${bay.batteryPct}%` }} className="bg-emerald-500 h-full" />
                    </div>

                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>State of Charge: {bay.batteryPct}%</span>
                      <span>Est. Completion: ~{bay.estMinutes} mins</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground font-sans text-xs">
                    Charger bay is ready for incoming EV depot connection.
                  </div>
                )}

                <div className="pt-2 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleToggleCharging(bay.id)}
                    className={`px-3 py-1.5 rounded font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      isCharging 
                        ? 'bg-rose-600 text-white hover:opacity-90' 
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {isCharging ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isCharging ? 'Stop Session' : 'Assign & Start Charging'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
