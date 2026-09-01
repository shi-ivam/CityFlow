import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Activity, Wrench, Radio, FileText, UserCheck } from 'lucide-react';
import { calculateFleetReadinessScore } from '../../../services/vehicleService';

export default function FleetReadinessModal({ isOpen, onClose, busFleet = [], crewMembers = [] }) {
  if (!isOpen) return null;

  const readiness = calculateFleetReadinessScore(busFleet, crewMembers);
  const { breakdown } = readiness;

  const factors = [
    {
      title: 'Operational Availability',
      weight: '30%',
      score: breakdown.operationalAvailability,
      desc: 'Proportion of total fleet currently in active revenue service or standby reserve',
      icon: Activity,
      color: 'bg-emerald-500'
    },
    {
      title: 'Maintenance Readiness',
      weight: '20%',
      score: breakdown.maintenanceReadiness,
      desc: 'Vehicles clear of open workshop work orders or overdue periodic brake checks',
      icon: Wrench,
      color: 'bg-blue-500'
    },
    {
      title: 'Telemetry Connectivity',
      weight: '20%',
      score: breakdown.telemetryConnectivity,
      desc: 'Real-time GPS AVL transponders transmitting live location updates',
      icon: Radio,
      color: 'bg-purple-500'
    },
    {
      title: 'Document & Legal Compliance',
      weight: '15%',
      score: breakdown.complianceScore,
      desc: 'Vehicles holding valid RC, Insurance, MVD Fitness, and PUC certificates',
      icon: FileText,
      color: 'bg-amber-500'
    },
    {
      title: 'Crew & Driver Coverage',
      weight: '15%',
      score: breakdown.driverCoverage,
      desc: 'Ratio of active corridor routes paired with rested, certified drivers',
      icon: UserCheck,
      color: 'bg-emerald-600'
    }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-foreground">
      <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-sm font-bold font-mono text-foreground">
                Fleet Readiness Index Calculation
              </h2>
              <p className="text-[11px] text-muted-foreground font-sans">
                Transparent multi-factor weighted scoring methodology.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Banner */}
        <div className="p-5 border-b border-border bg-muted/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold">COMPOSITE READINESS SCORE</div>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {readiness.totalScore}%
            </div>
            <div className="text-[11px] text-muted-foreground font-sans mt-1">
              Meets Delhi Transport Department standard for peak corridor operation.
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        {/* Breakdown Factors */}
        <div className="p-5 space-y-4 font-sans max-h-[50vh] overflow-y-auto">
          {factors.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="space-y-1.5 p-3 bg-muted/20 border border-border rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-bold text-foreground font-mono">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{f.title}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({f.weight} weight)</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">{f.score}%</span>
                </div>

                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: `${f.score}%` }} className={`${f.color} h-full rounded-full`} />
                </div>

                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
