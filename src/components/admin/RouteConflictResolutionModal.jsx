import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, MapPin, ArrowRight, X, Sparkles, RefreshCw } from 'lucide-react';
import { suggestConflictResolution } from '../../services/routeConflictService';

export default function RouteConflictResolutionModal({
  isOpen,
  onClose,
  conflictData = null,
  routes = [],
  onApplyResolution
}) {
  if (!isOpen || !conflictData) return null;

  const routeA = routes.find(r => r.id === conflictData.routeAId || r.code === conflictData.routeACode);
  const routeB = routes.find(r => r.id === conflictData.routeBId || r.code === conflictData.routeBCode);

  const options = suggestConflictResolution(conflictData, routeA, routeB);
  const [selectedOptionId, setSelectedOptionId] = useState('opt-1');

  const handleApply = () => {
    const chosenOption = options.find(o => o.id === selectedOptionId);
    if (chosenOption && onApplyResolution) {
      onApplyResolution(conflictData, chosenOption);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-card border border-rose-500/40 rounded-xl shadow-modal overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-rose-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-mono font-bold uppercase text-foreground">
              RESOLVE GEOGRAPHIC ROUTE OVERLAP
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conflict Data Box */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold text-sm">
              Route {conflictData.routeACode} ↔ Route {conflictData.routeBCode}
            </div>
            <div>Shared Corridor: <strong>{conflictData.sharedCorridorText}</strong></div>
            <div>Shared Distance: <strong>{conflictData.sharedKm} km</strong> ({conflictData.overlapPctA}% Overlap)</div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-2 font-mono text-xs">
            <div className="font-bold text-muted-foreground uppercase text-[10px]">Select Resolution Solution:</div>

            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedOptionId === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-foreground shadow-xs'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{opt.title}</span>
                  {selectedOptionId === opt.id && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-[11px] mt-1 text-muted-foreground font-sans">{opt.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between font-mono text-xs">
          <button onClick={onClose} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground">
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="px-5 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5 active:scale-95"
          >
            <span>Apply Solution</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
