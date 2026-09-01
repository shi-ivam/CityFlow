import React, { useState } from 'react';
import {
  RefreshCw,
  MapPin,
  Clock,
  UserCheck,
  CheckSquare,
  Square,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Fuel,
  FileCheck,
} from 'lucide-react';

interface Module5DriverReliefProps {
  driverName?: string;
  driverId?: string;
}

export const Module5DriverRelief: React.FC<Module5DriverReliefProps> = ({
  driverName = 'M. Rajesh',
  driverId = 'DRV-7402',
}) => {
  const [handoverCompleted, setHandoverCompleted] = useState<boolean>(false);
  const [showExtensionPrompt, setShowExtensionPrompt] = useState<boolean>(false);
  const [extensionAccepted, setExtensionAccepted] = useState<boolean>(false);

  // Handover checklist states
  const [checklist, setChecklist] = useState({
    odometer: true,
    fuel: true,
    cabin: true,
    defects: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Long-Journey Segment Briefing (>200 km Threshold) */}
      <div className="bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Long-Journey Segment Briefing (&gt;200 km)
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-semibold rounded border border-border">
            Issue #8 Relief Core
          </span>
        </div>

        <div className="space-y-2 mb-3 font-mono text-xs">
          <div className="p-2.5 bg-secondary/50 rounded border border-border space-y-1">
            <div className="flex justify-between text-foreground font-bold">
              <span>Segment 1 of 2: Chennai CMBT ⇄ Tindivanam Hub</span>
              <span className="text-muted-foreground">184 / 198 km</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Total Route Distance: 242 km • Driver changeover threshold: 200 km
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-secondary/30 rounded border border-border">
              <span className="text-muted-foreground block">Designated Relief Point</span>
              <strong className="text-foreground">Tindivanam Central Hub (Bay 4)</strong>
            </div>
            <div className="p-2 bg-secondary/30 rounded border border-border">
              <span className="text-muted-foreground block">Replacement Relief Driver</span>
              <strong className="text-foreground">DRV-8821 (K. Selvakumar)</strong>
            </div>
          </div>
        </div>

        {/* 2. Approaching Changeover Notification Radar */}
        <div className="p-2.5 bg-secondary/80 rounded border border-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground shrink-0" />
            <div>
              <span className="font-bold text-foreground block">Approaching Changeover</span>
              <span className="text-[11px] text-muted-foreground">
                12.4 km remaining • Target Arrival: 20:15 IST
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-bold uppercase rounded">
            Relief On-Site
          </span>
        </div>
      </div>

      {/* 3. Handover Checklist & Custody Transfer (Outgoing Driver) */}
      <div className="bg-card border border-border p-4 rounded shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Handover Checklist & Custody Transfer
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Stop Protocol</span>
        </div>

        {handoverCompleted ? (
          <div className="p-3 bg-secondary/60 rounded border border-foreground/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-foreground mx-auto" />
            <div className="font-bold text-sm text-foreground">
              HANDOVER EXECUTED & BUS CUSTODY TRANSFERRED
            </div>
            <div className="text-xs text-muted-foreground">
              Segment 1 marked COMPLETED. 184 km logged to your driving record. Custody transferred to
              DRV-8821.
            </div>
            <button
              onClick={() => setHandoverCompleted(false)}
              className="mt-2 px-3 py-1.5 bg-secondary hover:bg-accent text-foreground rounded border border-border text-xs cursor-pointer"
            >
              Reset Handover Flow
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              {[
                { key: 'odometer', label: 'Odometer Reading Verified (148,920 km)' },
                { key: 'fuel', label: 'Fuel / Energy Level Logged (78% / 180L Tank)' },
                { key: 'cabin', label: 'Passenger Cabin Clean & First Aid Kit Present' },
                { key: 'defects', label: 'No Mechanical Defects or Incident Reports' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                  className="w-full p-2 bg-secondary/30 hover:bg-secondary/60 rounded border border-border flex items-center justify-between text-left cursor-pointer transition-colors"
                >
                  <span className="text-foreground">{item.label}</span>
                  {checklist[item.key as keyof typeof checklist] ? (
                    <CheckSquare className="w-4 h-4 text-foreground shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={!allChecked}
              onClick={() => setHandoverCompleted(true)}
              className={`w-full py-2.5 font-bold uppercase rounded text-xs transition-all flex items-center justify-center gap-2 ${
                allChecked
                  ? 'bg-foreground text-background cursor-pointer hover:opacity-90'
                  : 'bg-secondary text-muted-foreground border border-border cursor-not-allowed'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Complete Segment & Handover Bus</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Relief Delays & Temporary Duty Extension Prompt */}
      <div className="bg-card border border-border p-4 rounded shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Changeover Delay Contingency
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Contingency Rule</span>
        </div>

        {extensionAccepted ? (
          <div className="p-2.5 bg-secondary/60 rounded border border-border text-foreground font-semibold flex items-center justify-between">
            <span>✓ Temporary 30-min Duty Extension Approved (Fatigue OK)</span>
            <button
              onClick={() => setExtensionAccepted(false)}
              className="text-[10px] underline text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs leading-relaxed">
              If the incoming relief driver is delayed, you can accept a temporary 30-minute duty
              extension if continuous driving limits permit.
            </p>
            <button
              onClick={() => setExtensionAccepted(true)}
              className="px-3 py-1.5 bg-secondary hover:bg-accent text-foreground rounded border border-border text-xs font-semibold cursor-pointer transition-colors"
            >
              Accept Temporary 30-Min Duty Extension
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
