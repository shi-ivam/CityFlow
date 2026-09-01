import React, { useState } from 'react';
import {
  DriverProfile,
  ShiftDurationResponse,
  ShiftChangeRequest,
} from '../../../services/api';
import { DriverShiftDuration } from '../DriverShiftDuration';
import { ShiftChangeHistory } from '../ShiftChangeHistory';
import { QrCode, Shield, User, CheckCircle2 } from 'lucide-react';

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
      <div className="bg-card border border-border/80 p-4 rounded-xl shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cf-primary" />
            <h3 className="font-bold text-xs text-foreground uppercase tracking-wider font-mono">
              Driver Custody & Duty Protocol
            </h3>
          </div>
          <span className="px-2.5 py-0.5 bg-cf-mint text-[#1e3a1e] font-mono text-[10px] font-semibold rounded-full border border-[#bbf7b5] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </div>

        {/* Driver Profile Summary */}
        {driverProfile && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
            <div className="p-2.5 bg-muted/30 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">Pilot ID</span>
              <strong className="text-foreground font-bold">{driverProfile.driverId}</strong>
            </div>
            <div className="p-2.5 bg-muted/30 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">Depot</span>
              <strong className="text-foreground font-medium">{driverProfile.depot}</strong>
            </div>
            <div className="p-2.5 bg-muted/30 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">License</span>
              <strong className="text-foreground font-medium">{driverProfile.licenseNumber}</strong>
            </div>
            <div className="p-2.5 bg-muted/30 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">Experience</span>
              <strong className="text-foreground font-medium">{driverProfile.experienceYears} Years</strong>
            </div>
          </div>
        )}

        {/* Operational Status Selector */}
        <div className="space-y-2 mb-3">
          <label className="text-[11px] font-mono text-muted-foreground block">
            STATUS STATE MACHINE:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 font-mono text-xs">
            {[
              { id: 'ON_DUTY', label: 'On Duty', activeBg: 'bg-cf-primary text-white border-cf-primary' },
              { id: 'AVAILABLE', label: 'Available', activeBg: 'bg-cf-mint text-[#1e3a1e] border-[#bbf7b5]' },
              { id: 'ON_BREAK', label: 'Break', activeBg: 'bg-cf-olive text-[#3b421a] border-[#dce3b8]' },
              { id: 'BACKUP', label: 'Standby', activeBg: 'bg-cf-aqua text-[#133a40] border-[#7ebfc7]' },
              { id: 'REST_REQUIRED', label: 'Rest Req.', activeBg: 'bg-rose-100 text-rose-800 border-rose-200' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setOperationalStatus(st.id)}
                className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border text-[11px] font-medium active:scale-[0.98] ${
                  operationalStatus === st.id
                    ? `${st.activeBg} font-semibold shadow-xs`
                    : 'bg-muted/30 hover:bg-muted text-foreground border-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Badge / Custody Protocol QR Check-in */}
        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cf-primary" />
            <div className="text-xs font-mono">
              <span className="text-foreground font-medium">Bus Custody: </span>
              <span className={custodyVerified ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}>
                {custodyVerified ? 'Verified at Depot' : 'Pending Verification'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className="px-2.5 py-1 bg-muted/60 hover:bg-muted text-foreground rounded-lg border border-border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <QrCode className="w-3.5 h-3.5 text-cf-primary" />
            <span>{showQrModal ? 'Close Badge' : 'Digital QR Badge'}</span>
          </button>
        </div>

        {/* QR Code Expansion */}
        {showQrModal && (
          <div className="mt-3 p-3 bg-muted/30 border border-border rounded-xl flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-24 bg-card border border-border rounded-lg flex items-center justify-center font-mono text-xs shadow-xs">
              <div className="space-y-1 text-center">
                <QrCode className="w-12 h-12 mx-auto text-cf-primary" />
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
              className="px-3 py-1.5 bg-cf-primary text-white font-mono text-xs font-medium rounded-lg hover:bg-cf-primary/90 cursor-pointer active:scale-[0.98]"
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
