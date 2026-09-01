import React from 'react';
import { Layers, Database, Shield, GitBranch, ExternalLink, X } from 'lucide-react';

export default function PRDModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[8px] w-full max-w-3xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col my-auto animate-fade-in font-sans">
        
        {/* Header */}
        <div className="bg-[#FBFBFA] p-4 px-6 border-b border-[#EAEAEA] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA]"></span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#111111]">
                TransitFlow Architecture & PRD Blueprint
              </h3>
              <p className="text-[11px] text-[#787774] font-mono">
                Single Operational Picture: Crew Assignment & Spatial GIS
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="./TransitFlow_Presentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-[4px] bg-[#F7F6F3] border border-[#EAEAEA] text-[#111111] text-xs font-mono font-medium hover:bg-[#EAEAEA] transition"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Slides</span>
            </a>

            <button
              onClick={onClose}
              className="p-1 rounded-[4px] text-[#787774] hover:text-[#111111] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-[#111111] text-xs font-sans leading-relaxed">
          
          <div className="space-y-1.5 border-b border-[#EAEAEA] pb-4">
            <h4 className="font-serif font-bold text-sm text-[#111111] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>1. System Architecture & Dual-View Paradigm</span>
            </h4>
            <p className="text-[#787774]">
              TransitFlow unifies crew scheduling and spatial route planning into a single reactive operational state. Changes in spatial routes immediately update duty rosters, and crew constraints dynamically flag route viability.
            </p>
          </div>

          <div className="space-y-2 border-b border-[#EAEAEA] pb-4">
            <h4 className="font-serif font-bold text-sm text-[#111111] flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              <span>2. Linked vs. Unlinked Duty Rules</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-[4px] bg-[#E1F3FE]/40 border border-[#BCDFF6]">
                <div className="font-bold text-[#1F6C9F]">Linked Duty (Solid Blue)</div>
                <div className="text-[#787774] mt-0.5">Crew member locked 1:1 to single bus for continuous shift.</div>
              </div>
              <div className="p-2.5 rounded-[4px] bg-[#FBF3DB]/40 border border-[#F3E4BA]">
                <div className="font-bold text-[#956400]">Unlinked Duty (Dashed Amber)</div>
                <div className="text-[#787774] mt-0.5">Crew switches bus at interchange hub. 15-minute handoff buffer required.</div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 border-b border-[#EAEAEA] pb-4">
            <h4 className="font-serif font-bold text-sm text-[#111111] flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>3. Mandated Rest Period Verification</span>
            </h4>
            <p className="text-[#787774]">
              Mandatory minimum 11 hours continuous rest required between shift blocks. Violations drop assignments into conflict state and trigger the 3-tier fallback solver.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-serif font-bold text-sm text-[#111111] flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>4. Automated 3-Tier Fallback Protocol</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="p-2 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA]">
                <strong>Tier 1: Standby Auto-Assign</strong> &rarr; Queries standby pool for &ge;11h rested drivers.
              </div>
              <div className="p-2 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA]">
                <strong>Tier 2: Duty Deconstruction</strong> &rarr; Splits shift into unlinked duty at interchange hub (15m buffer).
              </div>
              <div className="p-2 rounded-[4px] bg-[#FBFBFA] border border-[#EAEAEA]">
                <strong>Tier 3: Dispatch Lock</strong> &rarr; Locks dispatch in UNASSIGNED_CONFLICT state until supervisor authorization.
              </div>
            </div>
          </div>

        </div>

        <div className="bg-[#FBFBFA] p-3 px-6 border-t border-[#EAEAEA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-[4px] bg-[#111111] text-white font-mono text-xs font-semibold hover:bg-[#333333] transition active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
