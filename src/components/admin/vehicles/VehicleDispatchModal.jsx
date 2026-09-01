import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Route, 
  Bus, 
  UserCheck, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  Check
} from 'lucide-react';
import { validateTripReadiness } from '../../../services/vehicleService';

export default function VehicleDispatchModal({
  isOpen,
  onClose,
  busFleet = [],
  routes = [],
  crewMembers = [],
  selectedVehicle = null,
  onConfirmDispatch
}) {
  const [vehicleId, setVehicleId] = useState(selectedVehicle?.id || busFleet[0]?.id || 'bus-101');
  const [routeCode, setRouteCode] = useState(routes[0]?.code || '534');
  const [driverId, setDriverId] = useState(crewMembers[0]?.id || 'DRV-1042');
  const [shiftTime, setShiftTime] = useState('06:00 → 14:00 IST (Morning Peak)');
  const [depot, setDepot] = useState('Kashmere Gate ISBT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [dispatchedData, setDispatchedData] = useState(null);

  // Initialize selection when opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      if (selectedVehicle) {
        setVehicleId(selectedVehicle.id);
        if (selectedVehicle.assignedRoute) setRouteCode(selectedVehicle.assignedRoute);
        if (selectedVehicle.driverId) setDriverId(selectedVehicle.driverId);
        if (selectedVehicle.depot) setDepot(selectedVehicle.depot);
      } else if (busFleet.length > 0) {
        setVehicleId(busFleet[0].id);
      }
    }
  }, [selectedVehicle, isOpen, busFleet]);

  // Lock body scroll cleanly while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentVehicle = busFleet.find(b => b.id === vehicleId) || busFleet[0] || {
    id: 'bus-101',
    busNumber: 'DL 1PC 4821',
    batteryPct: 85,
    rangeKm: 180,
    status: 'STANDBY_READY'
  };

  const currentRoute = routes.find(r => r.code === routeCode) || routes[0] || {
    code: '534',
    name: 'Mehrauli ⇄ Anand Vihar',
    lengthKm: 38.4
  };

  const currentDriver = crewMembers.find(c => c.id === driverId) || crewMembers[0] || {
    id: 'DRV-1042',
    name: 'Rajesh Kumar',
    fullName: 'Rajesh Kumar',
    badge: 'DL-DRV-1042'
  };

  const readiness = validateTripReadiness(currentVehicle, currentRoute, currentDriver);

  // Hard blocking condition: Vehicle in workshop maintenance
  const isMaintenanceBlocked = currentVehicle.status === 'MAINTENANCE';
  const isRangeInsufficient = readiness.availableRangeKm < readiness.requiredRangeKm;
  const canDispatch = !isMaintenanceBlocked && !isRangeInsufficient;

  const handleDispatch = (e) => {
    e.preventDefault();
    if (!canDispatch || isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      vehicleId: currentVehicle.id,
      assignedRoute: currentRoute.code,
      driverId: currentDriver.id,
      assignedDriver: currentDriver.fullName || currentDriver.name,
      depot: depot || currentVehicle.depot || 'Kashmere Gate ISBT',
      shiftTime
    };

    setTimeout(() => {
      onConfirmDispatch(payload);
      setDispatchedData(payload);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans text-foreground"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-modal-title"
    >
      
      {/* 1. Backdrop Overlay (Blocks all interactions with background and map) */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Modal Dialog Card (Strictly 3-part layout: Fixed Header, Scrollable Content, Fixed Footer) */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* ================= FIXED HEADER ================= */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-border/60 bg-card flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Delhi Dispatch Control</span>
            </div>
            <h2 id="dispatch-modal-title" className="text-xl sm:text-2xl font-light tracking-tight text-foreground">
              Vehicle Dispatch &amp; Trip Readiness
            </h2>
            <p className="text-xs text-muted-foreground font-light">
              Validate vehicle, route, driver, and safety reserve before active deployment.
            </p>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SCROLLABLE CONTENT BODY ================= */}
        {!isSuccess ? (
          <form onSubmit={handleDispatch} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            
            {/* Top Row: Vehicle & Route Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Bus Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground uppercase tracking-wider">
                  Select Bus Asset
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-card border border-border/70 text-foreground outline-none text-xs font-mono focus:border-foreground/50 transition shadow-xs cursor-pointer"
                >
                  {busFleet.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} • {b.batteryPct}% Battery ({b.status === 'IN_SERVICE' ? 'Active' : b.status === 'MAINTENANCE' ? 'Workshop' : 'Standby'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Route Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground uppercase tracking-wider">
                  Corridor Route
                </label>
                <select
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-card border border-border/70 text-foreground outline-none text-xs font-mono focus:border-foreground/50 transition shadow-xs cursor-pointer"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.code}>
                      Route {r.code} ({r.name} • {r.lengthKm} km)
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Range & Safety Reserve Card */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 font-mono font-bold text-foreground">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>RANGE &amp; SAFETY RESERVE</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  !isRangeInsufficient
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  {!isRangeInsufficient ? '✓ RANGE SAFE' : '✕ RANGE INSUFFICIENT'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-card rounded-lg border border-border/50">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Route Distance</div>
                  <div className="text-sm font-mono font-bold text-foreground mt-0.5">{currentRoute.lengthKm} km</div>
                </div>
                <div className="p-2.5 bg-card rounded-lg border border-border/50">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Safety Buffer</div>
                  <div className="text-sm font-mono font-bold text-foreground mt-0.5">+15 km</div>
                </div>
                <div className="p-2.5 bg-card rounded-lg border border-border/50">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Available Range</div>
                  <div className={`text-sm font-mono font-bold mt-0.5 ${
                    isRangeInsufficient ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {readiness.availableRangeKm} km
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-muted-foreground flex justify-between px-1">
                <span>Required: <strong>{readiness.requiredRangeKm} km</strong></span>
                <span>Available: <strong className="text-foreground">{readiness.availableRangeKm} km ({currentVehicle.batteryPct}%)</strong></span>
              </div>
            </div>

            {/* Second Row: Driver & Shift Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Driver */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground uppercase tracking-wider">
                  Duty Driver
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-card border border-border/70 text-foreground outline-none text-xs font-mono focus:border-foreground/50 transition shadow-xs cursor-pointer"
                >
                  {crewMembers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName || c.name} ({c.badge || c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground uppercase tracking-wider">
                  Operating Shift
                </label>
                <select
                  value={shiftTime}
                  onChange={(e) => setShiftTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-card border border-border/70 text-foreground outline-none text-xs font-mono focus:border-foreground/50 transition shadow-xs cursor-pointer"
                >
                  <option value="06:00 → 14:00 IST (Morning Peak)">06:00 → 14:00 IST (Morning Peak)</option>
                  <option value="14:00 → 22:00 IST (Evening Peak)">14:00 → 22:00 IST (Evening Peak)</option>
                  <option value="22:00 → 06:00 IST (Night Express)">22:00 → 06:00 IST (Night Express)</option>
                </select>
              </div>

            </div>

            {/* Pre-Trip Readiness Checklist */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Pre-Trip Readiness Checklist
              </div>
              
              <div className="p-3 bg-card border border-border/60 rounded-xl space-y-2 font-mono text-xs">
                {readiness.checks.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center space-x-2">
                      {c.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="text-foreground">{c.label}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Status Banner */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
              canDispatch 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}>
              <span className="font-bold">
                {canDispatch ? '✓ DISPATCH READY' : '✕ DISPATCH BLOCKED'}
              </span>
              <span className="text-[11px] font-sans">
                {canDispatch 
                  ? 'All mandatory operational parameters satisfied.' 
                  : isMaintenanceBlocked 
                  ? 'Vehicle is in workshop maintenance.' 
                  : 'Energy range is insufficient for route.'}
              </span>
            </div>

          </form>
        ) : (
          /* ================= SUCCESS CONFIRMATION SCREEN ================= */
          <div className="flex-1 overflow-y-auto p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-light text-foreground">
              Vehicle Dispatched Successfully
            </h3>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
              Asset <strong className="text-foreground">{currentVehicle.busNumber}</strong> is now live on <strong className="text-foreground">Route {dispatchedData?.assignedRoute}</strong> under driver <strong className="text-foreground">{dispatchedData?.assignedDriver}</strong>.
            </p>
          </div>
        )}

        {/* ================= FIXED STICKY FOOTER ================= */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-border/60 bg-card flex items-center justify-between font-mono text-xs">
          {!isSuccess ? (
            <>
              <div className="text-xs text-muted-foreground truncate pr-2">
                {canDispatch ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Ready for corridor deployment
                  </span>
                ) : (
                  <span className="text-rose-500 font-medium">
                    ✕ Resolve blocking issues before dispatch
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-card border border-border/70 hover:bg-muted text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={!canDispatch || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center space-x-2 shadow-xs"
                >
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Vehicle'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
