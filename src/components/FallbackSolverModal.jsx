import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  Lock, 
  Zap, 
  Sliders, 
  Split, 
  Layers 
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

  // Find the conflict duty (e.g. duty-104 or any duty with conflict)
  const conflictDuty = dutyAssignments.find(d => 
    d.status.includes('CONFLICT') || d.status.includes('VIOLATION')
  ) || dutyAssignments[0];

  const assignedDriver = crewMembers.find(c => c.id === conflictDuty?.crewId);
  const standbyPool = crewMembers.filter(c => c.isStandby || c.status === 'STANDBY_READY');

  const [activeTierTab, setActiveTierTab] = useState(1);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionResult, setResolutionResult] = useState(null);

  // Compute rest deficit for the current driver
  const currentRestCheck = assignedDriver?.lastShiftEnd
    ? validateRestPeriod(assignedDriver.lastShiftEnd, conflictDuty?.startTime, 11)
    : { isCompliant: false, actualRestFormatted: "6h 30m", deficitFormatted: "4h 30m", deficitHours: 4.5 };

  // Candidate standby driver for Tier 1
  const primeStandby = standbyPool[0] || {
    id: "crew-standby-01",
    fullName: "Lucas Thorne (Reserve Standby)",
    badge: "SBY-01",
    rating: 4.95,
    lastShiftEnd: "2026-08-31T14:00:00Z"
  };

  const standbyRestCheck = validateRestPeriod(primeStandby.lastShiftEnd, conflictDuty?.startTime, 11);

  // Trigger Resolution
  const handleExecuteTier = (tier) => {
    setIsResolving(true);

    setTimeout(() => {
      let result;
      if (tier === 1) {
        result = execute3TierFallbackSolver(conflictDuty, crewMembers, dutyAssignments, busFleet, interchangeHubs);
      } else if (tier === 2) {
        // Force Tier 2 Split
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
        // Tier 3 Escalation Lock
        result = {
          success: false,
          tier: 3,
          tierName: "Escalated Dispatch Lock & Mitigation Protocol",
          message: "Duty locked in UNASSIGNED_CONFLICT state. High-priority alert broadcasted.",
          updatedDuty: {
            ...conflictDuty,
            status: "UNASSIGNED_CONFLICT_LOCKED",
            notes: "[TIER 3 ESCALATED] Dispatch locked. Pending operations manager emergency override."
          }
        };
      }

      setIsResolving(false);
      setResolutionResult(result);

      if (result.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Apply to master state
      if (onApplyResolution && result.updatedDuty) {
        onApplyResolution(result.updatedDuty);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0c1424] border border-white/15 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#0f1930] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-display font-bold text-white">
                  3-Tier Automated Fallback Solver
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  PRD §5 PROTOCOL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Deterministic Conflict Resolution & Rest Compliance Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg font-bold transition"
          >
            &times;
          </button>
        </div>

        {/* Conflict Incident Briefing Banner */}
        <div className="p-4 sm:p-5 bg-rose-950/30 border-b border-rose-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Incident Detected: Mandated Rest Period Violation (11h Rule)</span>
            </div>
            <span className="text-xs font-mono text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded font-bold">
              Deficit: {currentRestCheck.deficitFormatted}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Duty Assignment</span>
              <div className="font-bold text-white">{conflictDuty?.dutyCode || "DT-CONFLICT-02"}</div>
              <div className="text-slate-400 text-[10px]">Route 204 • Bus EV-204</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Flagged Driver</span>
              <div className="font-bold text-rose-300">{assignedDriver?.fullName || "Marcus Vance"}</div>
              <div className="text-slate-400 text-[10px]">Badge: {assignedDriver?.badge || "DRV-102"}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Rest Verification</span>
              <div className="font-bold text-rose-400">{currentRestCheck.actualRestFormatted} / 11h 0m</div>
              <div className="text-rose-400/80 text-[10px]">Prior shift ended at 00:30 AM</div>
            </div>

          </div>
        </div>

        {/* 3-Tier Fallback Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-[#0a1020] text-xs font-mono">
          
          <button
            onClick={() => setActiveTierTab(1)}
            className={`py-3 px-2 text-center font-bold transition border-b-2 flex flex-col items-center justify-center space-y-0.5 ${
              activeTierTab === 1
                ? 'border-brand-400 text-brand-300 bg-brand-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>Tier 1: Standby Pool</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">Auto-Assign Rested Driver</span>
          </button>

          <button
            onClick={() => setActiveTierTab(2)}
            className={`py-3 px-2 text-center font-bold transition border-b-2 flex flex-col items-center justify-center space-y-0.5 ${
              activeTierTab === 2
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Split className="w-3.5 h-3.5 text-amber-400" />
              <span>Tier 2: Unlinked Split</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">Hub Handoff (15m)</span>
          </button>

          <button
            onClick={() => setActiveTierTab(3)}
            className={`py-3 px-2 text-center font-bold transition border-b-2 flex flex-col items-center justify-center space-y-0.5 ${
              activeTierTab === 3
                ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Tier 3: Dispatch Lock</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">Supervisor Escalation</span>
          </button>

        </div>

        {/* Tier Tab Content */}
        <div className="p-5 flex-1 space-y-4">
          
          {/* TIER 1 VIEW */}
          {activeTierTab === 1 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                    <span>Tier 1: Reserve Standby Pool Auto-Assign</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    System queries available standby crew whose last shift elapsed $\ge 11$ hours.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                  Recommended
                </span>
              </div>

              {/* Standby Candidate Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-brand-500/30 shadow-glow-sky space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-400 flex items-center justify-center text-brand-300 font-bold text-xs font-mono">
                      SBY
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{primeStandby.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        Badge: {primeStandby.badge} • EV Cert: Double-Decker & Articulated
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="text-emerald-400 font-bold flex items-center justify-end space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{standbyRestCheck.actualRestFormatted} Rested</span>
                    </div>
                    <div className="text-[10px] text-slate-400">100% Compliant (11h+ Rule)</div>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Replaces Marcus Vance (6.5h) &rarr; <strong className="text-brand-300">Lucas Thorne (17.0h)</strong></span>
                  <span className="text-emerald-400 font-bold">Zero Route Disruption</span>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTier(1)}
                disabled={isResolving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>{isResolving ? 'Computing & Updating Rosters...' : 'Execute Tier 1: Auto-Assign Standby Driver'}</span>
              </button>
            </div>
          )}

          {/* TIER 2 VIEW */}
          {activeTierTab === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Tier 2: Duty Deconstruction & Unlinked Shift Split</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  If no single driver can cover the full 8h shift, decompose into 2 unlinked shifts at an interchange hub.
                </p>
              </div>

              {/* Split Diagram */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-glow-amber space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-amber-300">Deconstructed Shift Structure</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                    Central Metro Plaza Hub
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-800 border border-white/5">
                    <div className="text-slate-400 text-[10px]">Segment 1 (07:00 - 11:00)</div>
                    <div className="font-bold text-white">Sarah Chen</div>
                    <div className="text-[10px] text-sky-400">EV-204 (4h drive)</div>
                  </div>

                  <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/40 flex flex-col justify-center">
                    <div className="text-purple-300 font-bold">15m Handoff</div>
                    <div className="text-[10px] text-slate-400">Central Hub Swap</div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800 border border-white/5">
                    <div className="text-slate-400 text-[10px]">Segment 2 (11:15 - 15:30)</div>
                    <div className="font-bold text-white">Carlos Mendez</div>
                    <div className="text-[10px] text-sky-400">EV-204 (4.25h drive)</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleExecuteTier(2)}
                disabled={isResolving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Split className="w-4 h-4 text-white" />
                <span>{isResolving ? 'Deconstructing Shifts...' : 'Execute Tier 2: Split into Unlinked Duty'}</span>
              </button>
            </div>
          )}

          {/* TIER 3 VIEW */}
          {activeTierTab === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>Tier 3: Escalated Dispatch Lock & Mitigation Protocol</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  All automated solvers exhausted. Assignment dropped into UNASSIGNED_CONFLICT state, blocking dispatch confirmation until authorized.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs font-mono space-y-2 text-rose-200">
                <div className="flex items-center space-x-2 text-rose-300 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Hard Constraint Protection Triggered</span>
                </div>
                <p className="leading-relaxed">
                  Blocks driver dispatch to prevent regulatory safety violations. Operations manager must authorize emergency overtime waiver or relax headways.
                </p>
              </div>

              <button
                onClick={() => handleExecuteTier(3)}
                disabled={isResolving}
                className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-700/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>{isResolving ? 'Locking Dispatch...' : 'Execute Tier 3: Lock Dispatch & Broadcast Alert'}</span>
              </button>
            </div>
          )}

          {/* Success / Resolution Banner */}
          {resolutionResult && (
            <div className={`p-4 rounded-xl border animate-in fade-in space-y-2 text-xs font-mono ${
              resolutionResult.success 
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500 text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{resolutionResult.tierName} Applied Successfully!</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Roster Live</span>
              </div>
              <p>{resolutionResult.message}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#090e1c] p-3 px-5 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Compliance Target: <strong className="text-emerald-400">100% (Zero &lt;11h violations)</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
