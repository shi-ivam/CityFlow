import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ScheduleMaintenanceModal({
  isOpen,
  onClose,
  vehicle,
  onSaveMaintenance
}) {
  if (!isOpen || !vehicle) return null;

  const [issue, setIssue] = useState('Periodic 10,000 km Brake & Regen Calibration');
  const [priority, setPriority] = useState('MEDIUM');
  const [workshop, setWorkshop] = useState(vehicle.depot || 'Kashmere Gate Workshop Bay 3');
  const [technician, setTechnician] = useState('Devendra S. (Senior EV Tech)');
  const [estCompletion, setEstCompletion] = useState('2026-09-05');
  const [cost, setCost] = useState('₹6,500');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveMaintenance({
      vehicleId: vehicle.id,
      issue,
      priority,
      workshop,
      technician,
      estCompletion,
      cost,
      status: 'SCHEDULED'
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-foreground">
      <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-sm font-bold font-mono text-foreground">
                Schedule Workshop Service: {vehicle.busNumber}
              </h2>
              <p className="text-xs text-muted-foreground">
                Dispatch asset to maintenance bay and log work order ticket.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs">
          
          {/* Issue Description */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
              Inspection / Service Description
            </label>
            <input
              type="text"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none font-bold"
            />
          </div>

          {/* Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                Work Order Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none font-bold"
              >
                <option value="CRITICAL">Critical (Immediate Out-of-Service)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium (Scheduled)</option>
                <option value="LOW">Low (Routine Check)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                Estimated Completion
              </label>
              <input
                type="date"
                value={estCompletion}
                onChange={(e) => setEstCompletion(e.target.value)}
                className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
              />
            </div>
          </div>

          {/* Workshop & Technician */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                Assigned Workshop Bay
              </label>
              <input
                type="text"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                Lead Technician
              </label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-[10px] text-muted-foreground uppercase mb-1 font-bold">
              Estimated Parts &amp; Labour Cost
            </label>
            <input
              type="text"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:opacity-90 transition cursor-pointer flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Issue Work Order</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
