import React, { useState, useEffect } from 'react';
import KPITelemetryStrip from './KPITelemetryStrip';
import CockpitMapCanvas from './CockpitMapCanvas';
import DutyEngine from './DutyEngine';
import DriverBusDetailDrawer from './DriverBusDetailDrawer';
import BottomStatusStrip from './BottomStatusStrip';
import { 
  DIVISIONS, 
  INITIAL_BUSES, 
  INITIAL_DRIVERS, 
  INITIAL_ROUTES, 
  INITIAL_DUTIES, 
  INITIAL_CONFLICTS, 
  INITIAL_ACTIVITY_LOG 
} from './operationsData';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Wrench, 
  Activity, 
  Clock, 
  Zap,
  Bus,
  Users,
  Route as RouteIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TransitOperationsCockpit({ onToggleSidebar, onOpenSearch, onOpenAlertsDrawer }) {
  const navigate = useNavigate();

  // Operational State
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [duties, setDuties] = useState(INITIAL_DUTIES);
  const [conflicts, setConflicts] = useState(INITIAL_CONFLICTS);
  const [activityEvents, setActivityEvents] = useState(INITIAL_ACTIVITY_LOG);

  // Simulation Clock (Paused by default at 08:30:15 IST)
  const [simulationTimeSeconds, setSimulationTimeSeconds] = useState(8 * 3600 + 30 * 60 + 15);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);

  // Cross-Component Selection State (Section 10: CREW + BUS + ROUTE = ONE STATE)
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [selectedDuty, setSelectedDuty] = useState(null);

  // Detail Drawer State (Section 17)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedEntityForDrawer, setSelectedEntityForDrawer] = useState(null);

  // Interactive Toast Notification
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Synchronized Selection Handlers
  const handleSelectBus = (busId) => {
    setSelectedBusId(busId);
    const bus = buses.find(b => b.id === busId);
    if (!bus) return;

    // Find linked duty
    const duty = duties.find(d => d.busId === busId);
    if (duty) {
      setSelectedDuty(duty);
      setSelectedRouteId(duty.routeId);
    } else if (bus.routeId) {
      setSelectedRouteId(bus.routeId);
    }

    // Open detail drawer
    setSelectedEntityForDrawer({
      type: 'bus',
      id: bus.id,
      regNumber: bus.regNumber,
      driverName: drivers.find(d => d.id === bus.driverId)?.name || 'Rajesh Kumar',
      routeId: bus.routeId || 'R534',
      status: bus.status,
      speedKmh: bus.speedKmh || 28,
      hasConflict: conflicts.some(c => c.status === 'ACTIVE' && c.affectedBusId === busId)
    });
    setIsDetailDrawerOpen(true);
    addToast(`Selected ${bus.id} • Route: ${bus.routeId || 'R534'}`);
  };

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    const linkedBus = buses.find(b => b.routeId === routeId);
    if (linkedBus) {
      setSelectedBusId(linkedBus.id);
    }
    addToast(`Corridor ${routeId} highlighted across map and schedule.`);
  };

  const handleSelectDuty = (duty) => {
    setSelectedDuty(duty);
    if (duty.busId) setSelectedBusId(duty.busId);
    if (duty.routeId) setSelectedRouteId(duty.routeId);

    // Open detail drawer
    setSelectedEntityForDrawer({
      type: 'duty',
      id: duty.id,
      driverName: drivers.find(d => d.id === duty.driverId)?.name || duty.driverId,
      routeId: duty.routeId,
      status: duty.status,
      startTime: duty.startTime,
      endTime: duty.endTime,
      hasConflict: conflicts.some(c => c.status === 'ACTIVE' && c.affectedDutyId === duty.id)
    });
    setIsDetailDrawerOpen(true);
    addToast(`Duty ${duty.id} selected: ${duty.startTime}–${duty.endTime}`);
  };

  // Quick Conflict Auto-Fix (Section 15)
  const handleAutoFixConflict = (conflictId) => {
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, status: 'RESOLVED' } : c));
    addToast(`Conflict ${conflictId} auto-resolved via 3-Tier Solver: Standby driver assigned.`);
  };

  const activeConflicts = conflicts.filter(c => c.status === 'ACTIVE');

  return (
    <div className="flex flex-col h-full w-full bg-[#F4F3F8] dark:bg-[#191821] text-foreground overflow-hidden select-none font-sans">
      
      {/* 1. HORIZONTAL OPERATIONAL KPI STRIP (Section 6) */}
      <KPITelemetryStrip
        buses={buses}
        drivers={drivers}
        conflicts={conflicts}
        corridorOverlapPct={18.4}
        crewUtilizationPct={91.2}
        atRiskDeparturesCount={activeConflicts.length}
        onOpenConflicts={() => navigate('/admin/management/alerts')}
        onOpenDrivers={() => navigate('/admin/drivers')}
        onOpenFleet={() => navigate('/admin/vehicles')}
        onOpenRoutes={() => navigate('/admin/routes')}
      />

      {/* 2. MAIN WORKSPACE: 58% MAP / 42% GANTT TIMELINE (Section 7, 8, 11) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[58%_42%] gap-3 min-h-0 mb-3">
        
        {/* LEFT 58%: Live Network Map Canvas */}
        <div className="h-full min-h-[340px]">
          <CockpitMapCanvas
            routes={routes}
            buses={buses}
            conflicts={conflicts}
            selectedRouteId={selectedRouteId}
            onSelectRoute={handleSelectRoute}
            hoveredRouteId={hoveredRouteId}
            onHoverRoute={setHoveredRouteId}
            selectedBusId={selectedBusId}
            onSelectBus={handleSelectBus}
            selectedDuty={selectedDuty}
            onShowToast={addToast}
            corridorOverlapPct={18.4}
            isSimulating={isSimulating}
          />
        </div>

        {/* RIGHT 42%: Dispatch Gantt Timeline */}
        <div className="h-full min-h-[340px]">
          <DutyEngine
            duties={duties}
            buses={buses}
            drivers={drivers}
            routes={routes}
            conflicts={conflicts}
            simulationTimeSeconds={simulationTimeSeconds}
            activeTab="gantt"
            onTabChange={(tab) => {
              if (tab === 'conflicts') navigate('/admin/management/alerts');
            }}
            selectedDuty={selectedDuty}
            onSelectDuty={handleSelectDuty}
            onHoverDuty={(dutyId) => {
              if (!dutyId) {
                setHoveredRouteId(null);
                return;
              }
              const d = duties.find(item => item.id === dutyId);
              if (d) setHoveredRouteId(d.routeId);
            }}
            onAssignStandbyCrew={() => addToast('Standby driver assigned successfully.')}
            onTriggerOvertimeProtocol={() => addToast('Overtime protocol authorized.')}
            onSplitShiftFallback={() => addToast('Split-shift fallback authorized.')}
            onAdjustDeparture={() => addToast('Headway adjusted by +8 minutes.')}
            onRerouteVariant={() => addToast('Corridor reroute variant applied.')}
            onReassignDriver={() => addToast('Driver reassigned.')}
            onSwapBus={() => addToast('Vehicle swapped.')}
            onToggleLockDuty={() => addToast('Duty schedule locked.')}
            onRescheduleDuty={() => addToast('Duty rescheduled.')}
            onShowToast={addToast}
          />
        </div>

      </div>

      {/* 3. SECONDARY OPERATIONAL INFORMATION STRIP (Section 16, 34) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 shrink-0">
        
        {/* Panel 1: REQUIRES ATTENTION */}
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-foreground">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>REQUIRES ATTENTION ({activeConflicts.length})</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Priority 1</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {activeConflicts.length > 0 ? (
              activeConflicts.slice(0, 1).map(c => (
                <div key={c.id} className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-rose-600 dark:text-rose-400 text-[11px]">{c.affectedBusId || 'BUS-104'} Driver Rest Violation</div>
                    <div className="text-[10px] text-muted-foreground">Available rest: 7h 20m • Req: 11h</div>
                  </div>
                  <button
                    onClick={() => handleAutoFixConflict(c.id)}
                    className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition cursor-pointer shadow-2xs"
                  >
                    Auto Fix
                  </button>
                </div>
              ))
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero active violations. Network running nominally.</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: SMART RECOMMENDATIONS */}
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>SMART RECOMMENDATIONS</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Automated</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground text-[11px]">Reassign Driver DRV-102</div>
                <div className="text-[10px] text-muted-foreground">&rarr; Resolves Route 534 peak shortage</div>
              </div>
              <button 
                onClick={() => addToast('Driver DRV-102 reassigned to Route 534.')}
                className="px-2 py-0.5 rounded bg-primary/15 hover:bg-primary/25 text-primary font-bold text-[10px] cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Panel 3: NETWORK STATUS & RECENT INCIDENTS */}
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-foreground">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>NETWORK STATUS & AUDIT</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">● Streaming</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1">
            <span>Ping Latency: <strong className="text-foreground">41ms</strong></span>
            <span>•</span>
            <span>GPS Tracking: <strong className="text-emerald-600 dark:text-emerald-400">100% Sync</strong></span>
            <span>•</span>
            <button 
              onClick={() => navigate('/admin/activity')}
              className="text-primary hover:underline font-bold text-[10px] cursor-pointer"
            >
              Activity Log &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 4. COMPACT FOOTER STATUS STRIP (Section 38) */}
      <BottomStatusStrip />

      {/* 5. DRIVER / BUS DETAIL DRAWER (Section 17) */}
      <DriverBusDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        selectedEntity={selectedEntityForDrawer}
        onReassignDriver={(id) => addToast(`Driver ${id} reassigned to standby pool.`)}
        onSwapBus={(id) => addToast(`Vehicle ${id} marked for workshop swap.`)}
        onOpenSchedule={() => navigate('/admin/management/scheduling')}
      />

      {/* 6. TOAST STACK */}
      <div className="fixed bottom-12 right-4 z-50 space-y-2 pointer-events-none max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-sans shadow-lg pointer-events-auto flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-150"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
