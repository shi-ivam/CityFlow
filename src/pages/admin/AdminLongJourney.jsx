import React, { useState } from 'react';
import { Compass, Navigation, Clock, ShieldCheck, MapPin, UserCheck, Bus, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export default function AdminLongJourney({
  crewMembers = [],
  busFleet = [],
  selectedCity = 'delhi'
}) {
  const [selectedDriver1, setSelectedDriver1] = useState(crewMembers[0]?.id || '');
  const [selectedDriver2, setSelectedDriver2] = useState(crewMembers[1]?.id || '');
  const [selectedBus, setSelectedBus] = useState(busFleet[0]?.id || '');
  const [handoffStatus, setHandoffStatus] = useState('SCHEDULED');
  const [progressKm, setProgressKm] = useState(65);

  const d1 = crewMembers.find(c => c.id === selectedDriver1) || crewMembers[0];
  const d2 = crewMembers.find(c => c.id === selectedDriver2) || crewMembers[1];
  const bus = busFleet.find(b => b.id === selectedBus) || busFleet[0];

  const handleSimulateAdvance = () => {
    setProgressKm(prev => {
      const next = prev + 35;
      if (next >= 138 && next < 150) {
        setHandoffStatus('IN_HANDOFF_AT_KOTPUTLI');
      } else if (next >= 280) {
        setHandoffStatus('ARRIVED_JAIPUR');
        return 280;
      } else if (next > 150) {
        setHandoffStatus('LEG2_UNDERWAY');
      }
      return next;
    });
  };

  const handleResetJourney = () => {
    setProgressKm(0);
    setHandoffStatus('SCHEDULED');
  };

  const progressPct = Math.min(100, Math.round((progressKm / 280) * 100));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <Compass className="w-3.5 h-3.5 text-emerald-500" />
            <span>Interstate Corridor Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Long Journey & Midway Relief Station Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Interstate express dispatch (Delhi ISBT → Kotputli Relay → Jaipur Sindhi Camp, 280 km) with statutory crew changeovers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Midway Handoff Mandate: 138 km</span>
          </span>
        </div>
      </div>

      {/* Corridor Progress Bar HUD */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <Bus className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-bold text-foreground text-sm">
              Trip EXP-JP-101 • {bus?.busNumber || 'DL 1PC 4801'} ({bus?.model})
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground">Progress: <strong className="text-foreground">{progressKm} / 280 km</strong> ({progressPct}%)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              handoffStatus === 'IN_HANDOFF_AT_KOTPUTLI' ? 'bg-amber-500/15 text-amber-600 animate-pulse' :
              handoffStatus === 'ARRIVED_JAIPUR' ? 'bg-emerald-500/15 text-emerald-600' :
              'bg-blue-500/15 text-blue-600'
            }`}>
              {handoffStatus}
            </span>
          </div>
        </div>

        {/* Visual Track */}
        <div className="relative pt-6 pb-2">
          <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Key Waypoints */}
          <div className="flex justify-between items-center text-xs font-mono mt-3">
            <div className="text-left">
              <div className="font-bold text-foreground flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Delhi Kashmere Gate ISBT</span>
              </div>
              <div className="text-[10px] text-muted-foreground">KM 0 • Departure 06:00 IST</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                Leg 1: {d1?.name}
              </div>
            </div>

            <div className="text-center px-4 py-1.5 rounded-lg bg-muted/60 border border-border">
              <div className="font-bold text-foreground flex items-center justify-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Kotputli Interchange Relay Station</span>
              </div>
              <div className="text-[10px] text-muted-foreground">KM 138 • Mandatory Driver Handoff Bay #3</div>
              <div className="text-[11px] text-amber-600 font-bold mt-0.5">
                Relief Takeover: {d2?.name}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-foreground flex items-center justify-end space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Jaipur Sindhi Camp Terminal</span>
              </div>
              <div className="text-[10px] text-muted-foreground">KM 280 • Arrival 12:30 IST</div>
              <div className="text-[11px] text-blue-600 font-bold mt-0.5">
                Destination Terminus
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border font-mono text-xs">
          <button
            onClick={handleResetJourney}
            className="px-3 py-1.5 rounded bg-muted hover:bg-muted/80 text-foreground font-bold"
          >
            Reset Simulator
          </button>
          <button
            onClick={handleSimulateAdvance}
            className="px-4 py-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate +35 km Telemetry Teleport</span>
          </button>
        </div>
      </div>

      {/* Crew Handoff Assignment Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        
        {/* Leg 1 Crew Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-sm uppercase">
              Leg 1: Delhi → Kotputli Relay (138 km)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
              EST: 3h 15m
            </span>
          </div>

          <div>
            <label className="block text-muted-foreground font-bold uppercase mb-1">
              Primary Lead Driver
            </label>
            <select
              value={selectedDriver1}
              onChange={(e) => setSelectedDriver1(e.target.value)}
              className="w-full p-2 rounded bg-muted/50 border border-input text-foreground text-xs font-sans outline-none focus:border-primary"
            >
              {crewMembers.slice(0, 25).map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id}) • {d.licenseNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rest Prior to Shift:</span>
              <strong className="text-emerald-600">✓ 13.8 hrs (Legal)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permitted Continuous Driving:</span>
              <strong className="text-foreground">Max 4.5 hrs</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Disembarkation Point:</span>
              <strong className="text-foreground">Kotputli Terminal Bay #03</strong>
            </div>
          </div>
        </div>

        {/* Leg 2 Crew Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-sm uppercase">
              Leg 2: Kotputli Relay → Jaipur (142 km)
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">
              EST: 3h 15m
            </span>
          </div>

          <div>
            <label className="block text-muted-foreground font-bold uppercase mb-1">
              Midway Relief Driver (Stationed at Kotputli)
            </label>
            <select
              value={selectedDriver2}
              onChange={(e) => setSelectedDriver2(e.target.value)}
              className="w-full p-2 rounded bg-muted/50 border border-input text-foreground text-xs font-sans outline-none focus:border-primary"
            >
              {crewMembers.slice(25).map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id}) • {d.licenseNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Standby Rest Verification:</span>
              <strong className="text-emerald-600">✓ 14.5 hrs in Crew Lounge</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Boarding Location:</span>
              <strong className="text-foreground">Kotputli Interchange Bay #03</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Destination Terminus:</span>
              <strong className="text-foreground">Jaipur Sindhi Camp</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

