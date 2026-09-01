import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  UserCheck,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
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
      <div className="bg-card border border-border p-4 rounded-md">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Long-Journey Segment Briefing (&gt;200 km)
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-medium rounded-sm border border-border">
            Relief Protocol
          </span>
        </div>

        <div className="space-y-2 mb-3 font-mono text-xs">
          <div className="p-2.5 bg-secondary/30 rounded-sm border border-border space-y-1">
            <div className="flex justify-between text-foreground font-semibold">
              <span>Segment 1 of 2: Chennai CMBT &mdash; Tindivanam Hub</span>
              <span className="text-muted-foreground">184 / 198 km</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Total Route: 242 km &bull; Relief changeover threshold: 200 km
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-secondary/20 rounded-sm border border-border">
              <span className="text-muted-foreground block">Designated Relief Point</span>
              <strong className="text-foreground font-medium">Tindivanam Central Hub (Bay 4)</strong>
            </div>
            <div className="p-2 bg-secondary/20 rounded-sm border border-border">
              <span className="text-muted-foreground block">Replacement Relief Driver</span>
              <strong className="text-foreground font-medium">DRV-8821 (K. Selvakumar)</strong>
            </div>
          </div>
        </div>

        {/* 2. Approaching Changeover Notification */}
        <div className="p-2.5 bg-secondary/30 rounded-sm border border-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">Approaching Changeover</span>
              <span className="text-[11px] text-muted-foreground">
                12.4 km remaining &bull; Target Arrival: 20:15 IST
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-medium uppercase rounded-sm">
            Relief On-Site
          </span>
        </div>
      </div>

      {/* 3. Handover Checklist & Custody Transfer */}
      <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Handover Checklist & Custody Transfer
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Protocol</span>
        </div>

        {handoverCompleted ? (
          <div className="p-3 bg-secondary/40 rounded-sm border border-border text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-foreground mx-auto" />
            <div className="font-bold text-sm text-foreground">
              HANDOVER EXECUTED & BUS CUSTODY TRANSFERRED
            </div>
            <div className="text-xs text-muted-foreground font-sans">
              Segment 1 marked COMPLETED. 184 km logged to driver record. Bus custody transferred to
              DRV-8821.
            </div>
            <button
              onClick={() => setHandoverCompleted(false)}
              className="mt-2 px-3 py-1.5 bg-secondary hover:bg-accent text-foreground rounded-sm border border-border text-xs cursor-pointer active:scale-[0.98]"
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
                  className="w-full p-2 bg-secondary/20 hover:bg-secondary/40 rounded-sm border border-border flex items-center justify-between text-left cursor-pointer transition-colors active:scale-[0.99]"
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
              className={`w-full py-2.5 font-medium uppercase rounded-sm text-xs transition-all flex items-center justify-center gap-2 ${
                allChecked
                  ? 'bg-foreground text-background cursor-pointer active:scale-[0.98]'
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
      <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Changeover Delay Contingency
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Contingency</span>
        </div>

        {extensionAccepted ? (
          <div className="p-2.5 bg-secondary/40 rounded-sm border border-border text-foreground font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
              <span>Temporary 30-min Duty Extension Approved (Fatigue OK)</span>
            </span>
            <button
              onClick={() => setExtensionAccepted(false)}
              className="text-[10px] underline text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs leading-relaxed font-sans">
              If incoming relief driver is delayed, you can accept a temporary 30-minute extension
              if legal rest limits permit.
            </p>
            <button
              onClick={() => setExtensionAccepted(true)}
              className="px-3 py-1.5 bg-secondary hover:bg-accent text-foreground rounded-sm border border-border text-xs font-medium cursor-pointer transition-colors active:scale-[0.98]"
            >
              Accept Temporary 30-Min Duty Extension
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
