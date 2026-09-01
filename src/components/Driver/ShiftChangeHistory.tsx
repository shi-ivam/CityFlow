import React from 'react';
import { ShiftChangeRequest } from '../../services/api';
import { FileText, RefreshCw } from 'lucide-react';

interface ShiftChangeHistoryProps {
  requests: ShiftChangeRequest[];
  onRefresh: () => void;
  onRequestNew: () => void;
}

export const ShiftChangeHistory: React.FC<ShiftChangeHistoryProps> = ({
  requests,
  onRefresh,
}) => {
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-foreground" />
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
            Shift Change Requests
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Refresh History"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground font-mono text-xs">
          No previous shift change requests found.
        </div>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {requests.map((req) => {
            const isApproved = req.status === 'APPROVED';
            const isPending = req.status === 'PENDING';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.requestId}
                className="p-3 bg-secondary/40 border border-border rounded text-xs transition-colors font-sans"
              >
                {/* Top: Target Date & Status */}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-foreground font-mono">
                    {req.requestedShiftDate} • {req.requestedShiftType}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                      isApproved
                        ? 'bg-foreground text-background border-foreground'
                        : isPending
                        ? 'bg-secondary text-foreground border-foreground/40'
                        : 'bg-destructive text-destructive-foreground border-destructive'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Reason */}
                <div className="text-muted-foreground text-xs leading-relaxed mb-1">
                  {req.reasonDetails}
                </div>

                {/* Supervisor Remarks */}
                {req.reviewerNotes && (
                  <div className="text-[11px] font-mono text-foreground/80 bg-card p-1.5 rounded border border-border mt-1">
                    <span className="text-muted-foreground mr-1">Desk:</span>
                    {req.reviewerNotes}
                  </div>
                )}

                {/* Footer Date */}
                <div className="mt-1 text-[10px] font-mono text-muted-foreground text-right">
                  Logged on {formatDate(req.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
