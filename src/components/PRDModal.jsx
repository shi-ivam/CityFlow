import React from 'react';
import { FileText, Layers, Database, Shield, GitBranch, ExternalLink, X } from 'lucide-react';

export default function PRDModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0c1424] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#0f1930] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-display font-bold text-white">
                  TransitFlow System Architecture & PRD Blueprint
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  V-02 MASTER SPEC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Single Operational Picture: Crew-to-Bus Assignment & Spatial Route Planning
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="./TransitFlow_Presentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono font-bold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Slide Deck</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg font-bold transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRD Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm font-sans leading-relaxed">
          
          {/* Section 1 */}
          <div className="space-y-2 border-b border-white/10 pb-5">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>1. System Architecture & Dual-View Paradigm</span>
            </h4>
            <p className="text-xs text-slate-300">
              TransitFlow eliminates the historic silo between bus route planning and crew duty scheduling. Spatial GIS changes immediately re-validate shift rosters, and driver rest constraints dynamically test route viability.
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 font-mono text-xs text-slate-300">
              <pre>{`React Frontend (Leaflet GIS + Gantt Schedule) <---> Node.js Solver Engine <---> PostgreSQL + PostGIS`}</pre>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 border-b border-white/10 pb-5">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>2. Linked vs. Unlinked Duty Scheduling Rules</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1 text-xs">
                <span className="font-bold text-sky-300 uppercase font-mono">Linked Duty (Solid Blue)</span>
                <p>A single crew member is locked to a single bus for the entire shift duration across routes (1:1 continuous shift).</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs">
                <span className="font-bold text-amber-300 uppercase font-mono">Unlinked Duty (Dashed Amber)</span>
                <p>Crew members switch buses or routes at designated interchange hubs. Requires a mandatory 15-minute handoff buffer.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2 border-b border-white/10 pb-5">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>3. Mandated Rest Period Verification (11-Hour Rule)</span>
            </h4>
            <p className="text-xs text-slate-300">
              Every driver must receive a minimum continuous rest period of 11 hours between duty blocks. Assignments scheduled with less than 11 hours of rest are flagged as critical safety violations and trigger the automated 3-tier fallback solver.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>4. Automated 3-Tier Fallback Solver Protocol</span>
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <strong className="text-brand-300">Tier 1: Standby Auto-Assign</strong> &rarr; Queries the reserve standby pool for qualified drivers with &ge; 11h rest.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <strong className="text-amber-300">Tier 2: Duty Deconstruction</strong> &rarr; Splits continuous shift into an unlinked duty at an interchange hub with 15m handoff buffer.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                <strong className="text-rose-300">Tier 3: Dispatch Lock</strong> &rarr; Locks dispatch confirmation in UNASSIGNED_CONFLICT state, requiring supervisor override.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#090e1c] p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-mono text-xs font-bold transition"
          >
            Close Specification
          </button>
        </div>

      </div>
    </div>
  );
}
