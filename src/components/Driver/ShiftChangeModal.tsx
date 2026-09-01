import React, { useState } from 'react';
import {
  DriverSummary,
  DriverProfile,
  ShiftChangeRequestPayload,
  submitShiftChangeRequest,
  ShiftChangeRequest,
} from '../../services/api';
import { X, Send, AlertCircle } from 'lucide-react';

interface ShiftChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverProfile: DriverProfile;
  allDrivers: DriverSummary[];
  onRequestSubmitted: (newRequest: ShiftChangeRequest) => void;
}

export const ShiftChangeModal: React.FC<ShiftChangeModalProps> = ({
  isOpen,
  onClose,
  driverProfile,
  allDrivers,
  onRequestSubmitted,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [targetDate, setTargetDate] = useState<string>(tomorrowStr);
  const [shiftType, setShiftType] = useState<'MORNING' | 'AFTERNOON' | 'NIGHT' | 'REST_OFF'>('MORNING');
  const [reasonCategory, setReasonCategory] = useState<
    'MEDICAL' | 'PERSONAL' | 'FATIGUE_PREVENTION' | 'FAMILY_EMERGENCY' | 'ROSTER_PREFERENCE'
  >('FATIGUE_PREVENTION');
  const [reasonDetails, setReasonDetails] = useState<string>('');
  const [targetDriverId, setTargetDriverId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const peerDrivers = allDrivers.filter((d) => d.driverId !== driverProfile.driverId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonDetails.trim()) {
      setErrorMessage('Please provide a brief justification for the shift change request.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: ShiftChangeRequestPayload = {
        requestedShiftDate: targetDate,
        requestedShiftType: shiftType,
        reasonCategory: reasonCategory,
        reasonDetails: reasonDetails.trim(),
        targetDriverId: targetDriverId ? targetDriverId : null,
      };

      const result = await submitShiftChangeRequest(driverProfile.driverId, payload);
      onRequestSubmitted(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit shift change request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-lg bg-card border border-border shadow-xl p-6 rounded relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
          <div className="w-6 h-6 bg-foreground text-background flex items-center justify-center font-mono font-bold text-xs rounded-sm">
            CF
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight text-foreground">
              Request Shift Change
            </h2>
            <div className="text-xs text-muted-foreground font-mono">
              {driverProfile.name} • {driverProfile.driverId} (Route {driverProfile.assignedRouteCode})
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono flex items-center gap-2 rounded">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Target Date & Shift Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                min={tomorrowStr}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full bg-secondary border border-border text-foreground font-mono text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Preferred Shift Slot
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as any)}
                className="w-full bg-secondary border border-border text-foreground font-mono text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
              >
                <option value="MORNING">Morning (06:00 - 14:00)</option>
                <option value="AFTERNOON">Afternoon (14:00 - 22:00)</option>
                <option value="NIGHT">Night (22:00 - 06:00)</option>
                <option value="REST_OFF">Rest Day Off (Recovery)</option>
              </select>
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Reason Category
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value as any)}
              className="w-full bg-secondary border border-border text-foreground text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
            >
              <option value="FATIGUE_PREVENTION">Fatigue Prevention & Recovery</option>
              <option value="MEDICAL">Medical / Health Reasons</option>
              <option value="FAMILY_EMERGENCY">Family Emergency</option>
              <option value="PERSONAL">Personal Engagement</option>
              <option value="ROSTER_PREFERENCE">Mutual Shift Swap</option>
            </select>
          </div>

          {/* Mutual Swap Peer Driver */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Swap Partner (Optional)
            </label>
            <select
              value={targetDriverId}
              onChange={(e) => setTargetDriverId(e.target.value)}
              className="w-full bg-secondary border border-border text-foreground text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
            >
              <option value="">-- Open Rostering Pool --</option>
              {peerDrivers.map((p) => (
                <option key={p.driverId} value={p.driverId}>
                  {p.name} ({p.driverId} • Route {p.assignedRouteCode})
                </option>
              ))}
            </select>
          </div>

          {/* Reason Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Reason & Details
            </label>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={3}
              placeholder="Brief explanation for shift adjustment..."
              required
              className="w-full bg-secondary border border-border text-foreground font-sans text-xs p-3 rounded focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-accent text-foreground font-mono text-xs font-semibold rounded border border-border transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider rounded hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
