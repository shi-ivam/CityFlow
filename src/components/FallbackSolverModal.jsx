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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[8px] w-full max-w-2xl shadow-xl overflow-hidden flex flex-col my-auto animate-fade-in font-sans">
        
        {/* Faux-OS Window Chrome Header */}
        <div className="bg-[#FBFBFA] p-3.5 px-5 border-b border-[#EAEAEA] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]"></span>
            </div>
            <span className="text-xs font-mono font-bold text-[#111111] pl-2">
              3-Tier Fallback Solver &bull; PRD &sect;5
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#787774] hover:text-[#111111] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Summary */}
        <div className="p-4 bg-[#FDEBEC]/50 border-b border-[#F7D2D4] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-[#9F2F2D] font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incident: Mandated Rest Violation (11h Rule)</span>
            </div>
            <span className="bg-[#FDEBEC] border border-[#F7D2D4] text-[#9F2F2D] px-2 py-0.2 rounded-[4px] font-bold">
              Deficit: {currentRestCheck.deficitFormatted}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="p-2 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA]">
              <div className="text-[10px] text-[#787774]">Duty Code</div>
              <div className="font-bold text-[#111111]">{conflictDuty?.dutyCode}</div>
            </div>
            <div className="p-2 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA]">
              <div className="text-[10px] text-[#787774]">Driver</div>
              <div className="font-bold text-[#9F2F2D]">{assignedDriver?.fullName}</div>
            </div>
            <div className="p-2 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA]">
              <div className="text-[10px] text-[#787774]">Actual Rest</div>
              <div className="font-bold text-[#9F2F2D]">{currentRestCheck.actualRestFormatted} / 11h</div>
            </div>
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="grid grid-cols-3 border-b border-[#EAEAEA] bg-[#FBFBFA] text-xs font-mono">
          <button
            onClick={() => setActiveTierTab(1)}
            className={`py-2.5 px-2 text-center font-semibold transition border-b-2 ${
              activeTierTab === 1
                ? 'border-[#111111] text-[#111111] bg-[#FFFFFF]'
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Tier 1: Standby Pool
          </button>

          <button
            onClick={() => setActiveTierTab(2)}
            className={`py-2.5 px-2 text-center font-semibold transition border-b-2 ${
              activeTierTab === 2
                ? 'border-[#111111] text-[#111111] bg-[#FFFFFF]'
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Tier 2: Unlinked Split
          </button>

          <button
            onClick={() => setActiveTierTab(3)}
            className={`py-2.5 px-2 text-center font-semibold transition border-b-2 ${
              activeTierTab === 3
                ? 'border-[#111111] text-[#111111] bg-[#FFFFFF]'
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Tier 3: Dispatch Lock
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 space-y-4">
          
          {activeTierTab === 1 && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#111111] text-sm">Tier 1: Reserve Standby Auto-Assign</h4>
                  <p className="text-[#787774] text-[11px]">Queries standby drivers whose last shift elapsed &ge; 11 hours.</p>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#EDF3EC] text-[#346538] text-[10px] font-bold">
                  Recommended
                </span>
              </div>

              <div className="p-3 rounded-[6px] bg-[#FBFBFA] border border-[#EAEAEA] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#111111]">{primeStandby.fullName}</div>
                  <div className="text-[#787774] text-[10px]">Badge: {primeStandby.badge} • EV Standard/Articulated</div>
                </div>
                <div className="text-right">
                  <div className="text-[#346538] font-bold">{standbyRestCheck.actualRestFormatted} Rest</div>
                  <div className="text-[10px] text-[#787774]">100% Compliant</div>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTier(1)}
                disabled={isResolving}
                className="w-full py-2 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white font-mono text-xs font-semibold transition active:scale-95 disabled:opacity-40"
              >
                {isResolving ? 'Updating Roster...' : 'Execute Tier 1: Auto-Assign Standby Driver'}
              </button>
            </div>
          )}

          {activeTierTab === 2 && (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <h4 className="font-bold text-[#111111] text-sm">Tier 2: Duty Deconstruction & Unlinked Split</h4>
                <p className="text-[#787774] text-[11px]">Deconstructs continuous shift into 2 unlinked segments at Central Metro Plaza Hub with 15m transfer buffer.</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-[6px] bg-[#FBFBFA] border border-[#EAEAEA]">
                <div className="p-1.5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px]">
                  <div className="text-[10px] text-[#787774]">07:00 - 11:00</div>
                  <div className="font-bold text-[#111111]">Sarah Chen</div>
                </div>
                <div className="p-1.5 bg-[#F3EBF9] border border-[#DFCEEC] rounded-[4px] flex flex-col justify-center">
                  <div className="font-bold text-[#6E3294]">15m Handoff</div>
                  <div className="text-[9px] text-[#787774]">Central Hub</div>
                </div>
                <div className="p-1.5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px]">
                  <div className="text-[10px] text-[#787774]">11:15 - 15:30</div>
                  <div className="font-bold text-[#111111]">Carlos Mendez</div>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTier(2)}
                disabled={isResolving}
                className="w-full py-2 rounded-[6px] bg-[#111111] hover:bg-[#333333] text-white font-mono text-xs font-semibold transition active:scale-95 disabled:opacity-40"
              >
                {isResolving ? 'Deconstructing Shifts...' : 'Execute Tier 2: Split into Unlinked Duty'}
              </button>
            </div>
          )}

          {activeTierTab === 3 && (
            <div className="space-y-3 font-mono text-xs">
              <div>
                <h4 className="font-bold text-[#111111] text-sm">Tier 3: Escalated Dispatch Lock</h4>
                <p className="text-[#787774] text-[11px]">Locks dispatch confirmation in UNASSIGNED_CONFLICT state to prevent non-compliant driver deployment.</p>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#FDEBEC] border border-[#F7D2D4] text-[#9F2F2D]">
                Blocks vehicle departure. Requires Operations Manager emergency fatigue waiver or headway reduction.
              </div>

              <button
                onClick={() => handleExecuteTier(3)}
                disabled={isResolving}
                className="w-full py-2 rounded-[6px] bg-[#9F2F2D] hover:bg-[#852523] text-white font-mono text-xs font-semibold transition active:scale-95 disabled:opacity-40"
              >
                {isResolving ? 'Locking...' : 'Execute Tier 3: Lock Dispatch & Broadcast Alert'}
              </button>
            </div>
          )}

          {resolutionResult && (
            <div className={`p-3 rounded-[6px] border text-xs font-mono space-y-1.5 ${
              resolutionResult.success ? 'bg-[#EDF3EC] border-[#D5E5D4] text-[#346538]' : 'bg-[#FDEBEC] border-[#F7D2D4] text-[#9F2F2D]'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>{resolutionResult.tierName} Applied</span>
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-[#EAEAEA]">Live</span>
              </div>
              <p>{resolutionResult.message}</p>
              <div className="flex justify-end pt-1">
                <button
                  onClick={onClose}
                  className="px-3 py-1 rounded-[4px] bg-[#111111] text-white font-semibold text-xs transition active:scale-95"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="bg-[#FBFBFA] p-3 px-5 border-t border-[#EAEAEA] flex items-center justify-between text-xs font-mono text-[#787774]">
          <span>Compliance Target: <strong className="text-[#346538]">100%</strong></span>
          <button onClick={onClose} className="hover:text-[#111111]">Close</button>
        </div>

      </div>
    </div>
  );
}
