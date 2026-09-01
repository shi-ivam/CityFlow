import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

export default function AdminOverrideModal({
  isOpen,
  onClose,
  title = "ADMIN OVERRIDE WARNING",
  warningMessage = "Selected driver has consecutive long route assignments.",
  onConfirmOverride
}) {
  const [reason, setReason] = useState('Operational necessity during peak corridor demand');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirmOverride) {
      onConfirmOverride(reason);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-card border border-rose-500/40 rounded-xl shadow-modal overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-rose-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-mono font-bold uppercase text-foreground">
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-800 dark:text-rose-300">
            ⚠ {warningMessage}
          </div>

          <div>
            <label className="block text-[11px] font-mono text-muted-foreground uppercase mb-1">
              Admin Operational Override Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter operational reason for log audit..."
              className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-xs font-mono text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between text-xs font-mono">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground font-medium"
          >
            Cancel Change
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm transition-all"
          >
            Confirm Admin Override
          </button>
        </div>

      </div>
    </div>
  );
}
