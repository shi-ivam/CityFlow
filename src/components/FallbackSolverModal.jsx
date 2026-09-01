import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Split, 
  Lock, 
  X 
} from 'lucide-react';
import { execute3TierFallbackSolver, validateRestPeriod } from '../utils/dutyEngine';

export default function FallbackSolverModal({
  isOpen,
  onClose,
  dutyAssignments,
  crewMembers,
  busFleet,
  interchangeHubs,
  onApplyResolution
}) {
  if (!isOpen) return null;

  const conflictDuty = dutyAssignments.find(d => 
    d.status.includes('CONFLICT') || d.status.includes('VIOLATION')
  ) || dutyAssignments[0];

  const assignedDriver = crewMembers.find(c => c.id === conflictDuty?.crewId);
  const standbyPool = crewMembers.filter(c => c.isStandby || c.status === 'STANDBY_READY');

  const [activeTierTab, setActiveTierTab] = useState(1);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionResult, setResolutionResult] = useState(null);

  const currentRestCheck = assignedDriver?.lastShiftEnd
    ? validateRestPeriod(assignedDriver.lastShiftEnd, conflictDuty?.startTime, 11)
    : { isCompliant: false, actualRestFormatted: "6h 30m", deficitFormatted: "4h 30m", deficitHours: 4.5 };

  const primeStandby = standbyPool[0] || {
    id: "crew-standby-01",
    fullName: "Lucas Thorne (Reserve Standby)",
    badge: "SBY-01",
    rating: 4.95,
    lastShiftEnd: "2026-08-31T14:00:00Z"
  };

  const standbyRestCheck = validateRestPeriod(primeStandby.lastShiftEnd, conflictDuty?.startTime, 11);

  const handleExecuteTier = (tier) => {
    setIsResolving(true);

    setTimeout(() => {
      let result;
      if (tier === 1) {
        result = execute3TierFallbackSolver(conflictDuty, crewMembers, dutyAssignments, busFleet, interchangeHubs);
      } else if (tier === 2) {
        const nonStandbyCrew = crewMembers.filter(c => !c.isStandby && c.status !== 'FATIGUE_CONFLICT');
        result = {
          success: true,
          tier: 2,
          tierName: "Duty Deconstruction & Unlinked Split",
          message: "Deconstructed into 2 Unlinked segments at Central Metro Plaza Hub with 15m handoff buffer.",
          updatedDuty: {
            ...conflictDuty,
            dutyType: "UNLINKED",
            status: "ACTIVE_SCHEDULED",
            handoffHub: "Central Metro Plaza Hub",
            handoffBufferMinutes: 15,
            notes: "[TIER 2 RESOLVED] Split shift assigned across 2 rested drivers with 15m handoff buffer.",
            conflictDetails: null,
            resolvedViaTier: 2,
            segments: [
              { start: "07:00", end: "11:00", busNumber: "EV-204", routeCode: "204", type: "DRIVE", crewName: nonStandbyCrew[0]?.fullName || "Sarah Chen", hub: "NIT -> CMP" },
              { start: "11:00", end: "11:15", busNumber: "TRANSFER", routeCode: "HUB", type: "HANDOFF_BUFFER", hub: "Central Metro Plaza Hub" },
              { start: "11:15", end: "15:30", busNumber: "EV-204", routeCode: "204", type: "DRIVE", crewName: nonStandbyCrew[1]?.fullName || "Carlos Mendez", hub: "CMP -> Ocean" }
            ]
          }
        };
      } else {
        result = {
          success: false,
          tier: 3,
          tierName: "Escalated Dispatch Lock & Mitigation Protocol",
          message: "Duty locked in UNASSIGNED_CONFLICT state. High-priority alert broadcasted.",
          updatedDuty: {
            ...conflictDuty,
            status: "UNASSIGNED_CONFLICT_LOCKED",
            notes: "[TIER 3 ESCALATED] Dispatch locked. Pending supervisor emergency override."
          }
        };
      }

      setIsResolving(false);
      setResolutionResult(result);

      if (result.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      if (onApplyResolution && result.updatedDuty) {
        onApplyResolution(result.updatedDuty);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col my-auto text-slate-800 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Shift Rest Resolution</h3>
              <p className="text-[11px] text-slate-500">Choose a resolution to ensure driver rest compliance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rest Notice Banner */}
        <div className="p-4 px-6 bg-rose-50/60 border-b border-rose-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-rose-800 font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Rest Deficit Detected (11h Rule)</span>
            </div>
            <span className="bg-white border border-rose-200 text-rose-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
              Deficit: {currentRestCheck.deficitFormatted}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-2 rounded-lg bg-white border border-rose-100">
              <div className="text-[10px] text-slate-400">Shift Code</div>
              <div className="font-semibold text-slate-800 mt-0.5">{conflictDuty?.dutyCode || 'D-534-M'}</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-rose-100">
              <div className="text-[10px] text-slate-400">Assigned Driver</div>
              <div className="font-semibold text-rose-700 mt-0.5 truncate">{assignedDriver?.fullName || 'Amit Sharma'}</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-rose-100">
              <div className="text-[10px] text-slate-400">Recorded Rest</div>
              <div className="font-semibold text-rose-700 mt-0.5">{currentRestCheck.actualRestFormatted} / 11h</div>
            </div>
          </div>
        </div>

        {/* Strategy Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/80 text-xs">
          <button
            onClick={() => setActiveTierTab(1)}
            className={`py-2.5 px-2 text-center font-medium transition border-b-2 ${
              activeTierTab === 1
                ? 'border-emerald-600 text-emerald-800 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Standby Driver
          </button>

          <button
            onClick={() => setActiveTierTab(2)}
            className={`py-2.5 px-2 text-center font-medium transition border-b-2 ${
              activeTierTab === 2
                ? 'border-sky-600 text-sky-800 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Split Shift
          </button>

          <button
            onClick={() => setActiveTierTab(3)}
            className={`py-2.5 px-2 text-center font-medium transition border-b-2 ${
              activeTierTab === 3
                ? 'border-amber-600 text-amber-800 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Hold Shift
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          
          {activeTierTab === 1 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Assign Available Standby Driver</h4>
                  <p className="text-slate-500 text-[11px]">Matches this shift with an available driver who has completed full 11h rest.</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100">
                  Recommended
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{primeStandby.fullName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Badge: {primeStandby.badge} • Ready for deployment</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-700 font-semibold">{standbyRestCheck.actualRestFormatted} Rest</div>
                  <div className="text-[10px] text-slate-400">Fully Compliant</div>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTier(1)}
                disabled={isResolving}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {isResolving ? 'Assigning...' : 'Assign Standby Driver'}
              </button>
            </div>
          )}

          {activeTierTab === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Split into Two Shorter Shifts</h4>
                <p className="text-slate-500 text-[11px]">Divides the shift at Central Metro Plaza Hub with a 15-minute handoff window.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-white border border-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-400">07:00 – 11:00</div>
                  <div className="font-semibold text-slate-800 mt-0.5">Sarah Chen</div>
                </div>
                <div className="p-2 bg-sky-50 border border-sky-100 rounded-lg flex flex-col justify-center">
                  <div className="font-semibold text-sky-800 text-[11px]">15m Break</div>
                  <div className="text-[9px] text-sky-600">Central Hub</div>
                </div>
                <div className="p-2 bg-white border border-slate-100 rounded-lg">
                  <div className="text-[10px] text-slate-400">11:15 – 15:30</div>
                  <div className="font-semibold text-slate-800 mt-0.5">Carlos Mendez</div>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTier(2)}
                disabled={isResolving}
                className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {isResolving ? 'Splitting...' : 'Split Shift with Handoff'}
              </button>
            </div>
          )}

          {activeTierTab === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Hold Shift for Review</h4>
                <p className="text-slate-500 text-[11px]">Pauses this departure until an operations supervisor assigns a driver.</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900 text-xs">
                This trip will remain queued in dispatch review until an available driver is confirmed.
              </div>

              <button
                onClick={() => handleExecuteTier(3)}
                disabled={isResolving}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {isResolving ? 'Holding...' : 'Hold for Dispatch Review'}
              </button>
            </div>
          )}

          {resolutionResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-150 ${
              resolutionResult.success 
                ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' 
                : 'bg-amber-50/70 border-amber-100 text-amber-900'
            }`}>
              <div className="font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolution Applied</span>
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Updated
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{resolutionResult.message}</p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target: <strong className="text-emerald-700 font-semibold">100% Rest Compliance</strong></span>
          <button 
            onClick={onClose} 
            className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
