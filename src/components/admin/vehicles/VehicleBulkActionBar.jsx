import React from 'react';
import { 
  CheckSquare, 
  Route, 
  UserCheck, 
  Wrench, 
  Download, 
  X, 
  RefreshCw,
  Power
} from 'lucide-react';

export default function VehicleBulkActionBar({
  selectedCount = 0,
  onClearSelection,
  onBulkAssignRoute,
  onBulkAssignDriver,
  onBulkChangeStatus,
  onBulkScheduleMaintenance,
  onBulkExport
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border-2 border-primary text-foreground px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-4 font-mono text-xs animate-in slide-in-from-bottom-4 duration-200">
      
      {/* Selected Counter */}
      <div className="flex items-center space-x-2 border-r border-border pr-3">
        <CheckSquare className="w-4 h-4 text-primary" />
        <span className="font-bold text-foreground">
          {selectedCount} {selectedCount === 1 ? 'vehicle' : 'vehicles'} selected
        </span>
      </div>

      {/* Bulk Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onBulkAssignRoute}
          className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted border border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Route className="w-3.5 h-3.5 text-primary" />
          <span>Assign Route</span>
        </button>

        <button
          onClick={onBulkAssignDriver}
          className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted border border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Assign Driver</span>
        </button>

        <button
          onClick={onBulkChangeStatus}
          className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted border border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Power className="w-3.5 h-3.5 text-amber-500" />
          <span>Change Status</span>
        </button>

        <button
          onClick={onBulkScheduleMaintenance}
          className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted border border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-rose-500" />
          <span>Schedule Maintenance</span>
        </button>

        <button
          onClick={onBulkExport}
          className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted border border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Export</span>
        </button>
      </div>

      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer border-l border-border pl-2"
        title="Deselect All"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  );
}
