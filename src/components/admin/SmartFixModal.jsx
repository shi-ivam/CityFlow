import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';

export default function SmartFixModal({
  isOpen,
  onClose,
  issueData = null,
  onAcceptRecommendation,
  onChooseManually
}) {
  if (!isOpen || !issueData) return null;

  const isDriverIssue = issueData.title?.includes('DRIVER') || issueData.type === 'DRIVER';
  const isOverflowIssue = issueData.title?.includes('OVERFLOW') || issueData.type === 'OVERFLOW';
  const isBreakdownIssue = issueData.title?.includes('BREAKDOWN') || issueData.type === 'BREAKDOWN';
  const isConflictIssue = issueData.title?.includes('CONFLICT') || issueData.type === 'CONFLICT';

  return (
    <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-card border border-primary/40 rounded-xl shadow-modal overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-primary/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-sm font-mono font-bold uppercase text-foreground">
              CITYFLOW AUTOMATED SOLUTION
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnosis & Analysis Box */}
        <div className="p-5 space-y-4 font-sans">
          
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-800 dark:text-amber-300">
            <div className="font-bold flex items-center space-x-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>DETECTED ISSUE: {issueData.title}</span>
            </div>
            <div>{issueData.message || issueData.description}</div>
          </div>

          {/* CityFlow AI Recommendation Card */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 border-b border-emerald-500/20 pb-2">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>RECOMMENDED SOLUTION</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-[10px]">100% OPTIMAL</span>
            </div>

            {isDriverIssue && (
              <div className="space-y-1 text-xs">
                <div className="font-bold text-foreground text-sm">Assign Driver: Amit Sharma (DRV-SBY-01)</div>
                <div className="text-muted-foreground text-[11px] space-y-0.5">
                  <div>✓ 11h Rest Period Complete (Last duty ended 14h ago)</div>
                  <div>✓ Low Accumulated Workload (3.2h this shift)</div>
                  <div>✓ Verified Long/Medium Corridor Rotation Rules</div>
                </div>
              </div>
            )}

            {isOverflowIssue && (
              <div className="space-y-1 text-xs">
                <div className="font-bold text-foreground text-sm">Dispatch Standby EV Bus: DL 01 SBY 001</div>
                <div className="text-muted-foreground text-[11px] space-y-0.5">
                  <div>✓ Located 2.4 km away at Kashmere Gate Hub (ETA 6 mins)</div>
                  <div>✓ 60 Passenger Seats (Clears 22 waiting overflow)</div>
                  <div>✓ 100% Battery Charge • Zero Route Impact</div>
                </div>
              </div>
            )}

            {isBreakdownIssue && (
              <div className="space-y-1 text-xs">
                <div className="font-bold text-foreground text-sm">Substitute Replacement Bus: DL 1PC 7314</div>
                <div className="text-muted-foreground text-[11px] space-y-0.5">
                  <div>✓ Available immediately at nearest depot</div>
                  <div>✓ Compatible 55-seat CNG capacity</div>
                  <div>✓ Driver reassignment scheduled automatically</div>
                </div>
              </div>
            )}

            {isConflictIssue && (
              <div className="space-y-1 text-xs">
                <div className="font-bold text-foreground text-sm">Adjust Schedule Timing: Move Route 725 to 08:38 AM</div>
                <div className="text-muted-foreground text-[11px] space-y-0.5">
                  <div>✓ Eliminates 08:32 AM corridor bottleneck at Rajiv Chowk</div>
                  <div>✓ Maintains 6-minute headway buffer between buses</div>
                  <div>✓ 0% impact on downstream interchange connections</div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Action Buttons: ACCEPT vs CHOOSE MANUALLY */}
        <div className="p-4 border-t border-border bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs">
          <button
            onClick={() => {
              onClose();
              if (onChooseManually) onChooseManually(issueData);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-card border border-border text-foreground hover:bg-accent font-medium transition-colors"
          >
            Choose Manually
          </button>

          <button
            onClick={() => {
              if (onAcceptRecommendation) onAcceptRecommendation(issueData);
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <span>Accept Recommendation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
