import React, { useState } from 'react';
import {
  DriverProfile,
  ShiftDurationResponse,
  ShiftChangeRequest,
} from '../../../services/api';
import { DriverShiftDuration } from '../DriverShiftDuration';
import { ShiftChangeHistory } from '../ShiftChangeHistory';
import { QrCode, Shield, CheckCircle2, User, Building, Award, Phone } from 'lucide-react';

interface Module1ShiftDutyProps {
  driverProfile: DriverProfile | null;
  shiftData: ShiftDurationResponse | null;
  shiftRequests: ShiftChangeRequest[];
  onRefresh: () => void;
  onRequestShiftChange: () => void;
}

export const Module1ShiftDuty: React.FC<Module1ShiftDutyProps> = ({
  driverProfile,
  shiftData,
  shiftRequests,
  onRefresh,
  onRequestShiftChange,
}) => {
  const [operationalStatus, setOperationalStatus] = useState<string>('ON_DUTY');
  const [custodyVerified, setCustodyVerified] = useState<boolean>(true);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Driver Identification & Digital Custody Verification Badge */}
      <div className="bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              Driver Custody & Duty Protocol
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-mono text-[10px] font-semibold rounded border border-border">
            M1 Verified
          </span>
        </div>

        {/* Driver Profile Summary */}
        {driverProfile && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
            <div className="p-2 bg-secondary/50 rounded border border-border">
              <span className="text-[10px] text-muted-foreground block">Pilot ID</span>
              <strong className="text-foreground font-bold">{driverProfile.driverId}</strong>
            </div>
            <div className="p-2 bg-secondary/50 rounded border border-border">
              <span className="text-[10px] text-muted-foreground block">Depot</span>
              <strong className="text-foreground">{driverProfile.depot}</strong>
            </div>
            <div className="p-2 bg-secondary/50 rounded border border-border">
              <span className="text-[10px] text-muted-foreground block">License</span>
              <strong className="text-foreground">{driverProfile.licenseNumber}</strong>
            </div>
            <div className="p-2 bg-secondary/50 rounded border border-border">
              <span className="text-[10px] text-muted-foreground block">Exp Level</span>
              <strong className="text-foreground">{driverProfile.experienceYears} Years</strong>
            </div>
          </div>
        )}

        {/* Operational Status Selector */}
        <div className="space-y-2 mb-3">
          <label className="text-[11px] font-mono text-muted-foreground block">
            OPERATIONAL STATUS STATE MACHINE:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 font-mono text-xs">
            {[
              { id: 'ON_DUTY', label: 'On Duty' },
              { id: 'AVAILABLE', label: 'Available' },
              { id: 'ON_BREAK', label: 'On Break' },
              { id: 'BACKUP', label: 'Standby' },
              { id: 'REST_REQUIRED', label: 'Rest Req.' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setOperationalStatus(st.id)}
                className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer border text-[11px] font-semibold ${
                  operationalStatus === st.id
                    ? 'bg-foreground text-background border-foreground font-bold'
                    : 'bg-secondary/40 hover:bg-secondary text-foreground border-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Badge / Custody Protocol QR Check-in */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-foreground" />
            <div className="text-xs font-mono">
              <span className="text-foreground font-semibold">Bus Custody: </span>
              <span className={custodyVerified ? 'text-foreground' : 'text-muted-foreground'}>
                {custodyVerified ? 'Verified at Depot Gate' : 'Pending Verification'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className="px-2.5 py-1 bg-secondary hover:bg-accent text-foreground rounded border border-border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQrModal ? 'Hide Badge' : 'Digital QR Badge'}</span>
          </button>
        </div>

        {/* QR Code Expansion */}
        {showQrModal && (
          <div className="mt-3 p-3 bg-secondary/70 border border-border rounded flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-24 bg-card border-2 border-foreground rounded flex items-center justify-center font-mono text-xs">
              <div className="space-y-1 text-center">
                <QrCode className="w-12 h-12 mx-auto text-foreground" />
                <div className="text-[9px] font-mono font-bold text-foreground">
                  {driverProfile?.driverId || 'DRV-7402'}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Scan at Depot Departure / Arrival Terminal Gate for automated custody check-in.
            </div>
            <button
              onClick={() => setCustodyVerified(!custodyVerified)}
              className="px-3 py-1 bg-foreground text-background font-mono text-xs font-bold rounded cursor-pointer"
            >
              {custodyVerified ? 'Re-verify Custody' : 'Confirm Custody Check-in'}
            </button>
          </div>
        )}
      </div>

      {/* 2. Active Shift Duration Monitor */}
      {shiftData && <DriverShiftDuration initialShift={shiftData} />}

      {/* 3. Shift Change Request History & Submission */}
      <ShiftChangeHistory
        requests={shiftRequests}
        onRefresh={onRefresh}
        onRequestNew={onRequestShiftChange}
      />
    </div>
  );
};
