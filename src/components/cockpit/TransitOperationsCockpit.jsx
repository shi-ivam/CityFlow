import React, { useState, useEffect, useRef } from 'react';
import TopControlDeck from './TopControlDeck';
import KPITelemetryStrip from './KPITelemetryStrip';
import CockpitMapCanvas from './CockpitMapCanvas';
import DutyEngine from './DutyEngine';
import ActivityAlertDrawer from './ActivityAlertDrawer';
import CommandPaletteModal from './CommandPaletteModal';
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

export default function TransitOperationsCockpit({ onToggleSidebar }) {
  // Operational State
  const [selectedDivision, setSelectedDivision] = useState('delhi_central');
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [duties, setDuties] = useState(INITIAL_DUTIES);
  const [conflicts, setConflicts] = useState(INITIAL_CONFLICTS);
  const [activityEvents, setActivityEvents] = useState(INITIAL_ACTIVITY_LOG);

  // KPIs
  const [corridorOverlapPct, setCorridorOverlapPct] = useState(18.4);
  const [crewUtilizationPct, setCrewUtilizationPct] = useState(91.2);
  const [atRiskDeparturesCount, setAtRiskDeparturesCount] = useState(2);

  // Simulation Controller: 08:30:15 IST initial state (Section 46)
  const [simulationTimeSeconds, setSimulationTimeSeconds] = useState(8 * 3600 + 30 * 60 + 15);
  const [isSimulating, setIsSimulating] = useState(false); // PAUSED on load
  const [simSpeed, setSimSpeed] = useState(1);

  // Selection and UI state
  const [activeTab, setActiveTab] = useState('gantt'); // 'gantt' | 'conflicts'
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [selectedDuty, setSelectedDuty] = useState(null);

  // Drawers and Modals
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isSearchPaletteOpen, setIsSearchPaletteOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Simulation Timer Hook (Section 7)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationTimeSeconds(prev => {
        const next = prev + simSpeed;
        return next > 24 * 3600 ? 6 * 3600 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Division Switcher Handler
  const handleSelectDivision = (divId) => {
    setSelectedDivision(divId);
    const div = DIVISIONS.find(d => d.id === divId);
    if (!div) return;

    // Push Telemetry Event
    const nowStr = formatTimestamp(simulationTimeSeconds);
    setActivityEvents(prev => [
      {
        id: `ev-${Date.now()}`,
        timestamp: nowStr,
        type: 'DIVISION',
        message: `Active operational division changed to ${div.name}`,
        severity: 'nominal'
      },
      ...prev
    ]);
  };

  const formatTimestamp = (totalSec) => {
    const h = Math.floor(totalSec / 3600) % 24;
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Cross-Selection Handler: When a duty is selected, also select its bus and route! (Section 36)
  const handleSelectDuty = (duty) => {
    setSelectedDuty(duty);
    if (duty) {
      setSelectedBusId(duty.busId);
      setSelectedRouteId(duty.routeId);
    }
  };

  // Cross-Selection Handler: When a bus is selected, focus on its duty!
  const handleSelectBus = (busId) => {
    setSelectedBusId(busId);
    const relatedDuty = duties.find(d => d.busId === busId);
    if (relatedDuty) {
      setSelectedDuty(relatedDuty);
      setSelectedRouteId(relatedDuty.routeId);
    }
  };

  // Cross-Selection Handler: When a route is selected
  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    const relatedDuty = duties.find(d => d.routeId === routeId);
    if (relatedDuty) {
      setSelectedDuty(relatedDuty);
      setSelectedBusId(relatedDuty.busId);
    }
  };

  // ========================================================
  // MISSION-CRITICAL FALLBACK ACTIONS (Section 21, 47)
  // ========================================================

  // 1. Assign Standby Crew
  const handleAssignStandbyCrew = (conflictId, standbyDriverId, affectedDutyId) => {
    const timestamp = formatTimestamp(simulationTimeSeconds);

    // Update Drivers State
    setDrivers(prev => prev.map(d => {
      if (d.id === standbyDriverId) {
        return { ...d, status: 'ASSIGNED', isStandby: false, currentDutyId: affectedDutyId };
      }
      if (d.id === 'VERMA-27') {
        return { ...d, status: 'BREAK', restStatus: 'ON_MANDATORY_REST', currentDutyId: null };
      }
      return d;
    }));

    // Update Duty State
    setDuties(prev => prev.map(duty => {
      if (duty.id === affectedDutyId) {
        return {
          ...duty,
          driverId: standbyDriverId,
          status: 'COMPLIANT',
          notes: 'Standby crew relief executed. Rest violation cleared.'
        };
      }
      return duty;
    }));

    // Update Conflicts State
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, status: 'RESOLVED', resolvedAt: `${timestamp} IST` };
      }
      return c;
    }));

    // Update KPIs
    setAtRiskDeparturesCount(prev => Math.max(0, prev - 1));

    // Telemetry Event
    setActivityEvents(prev => [
      {
        id: `ev-${Date.now()}`,
        timestamp,
        type: 'CREW_FALLBACK',
        message: `Standby crew ${standbyDriverId} successfully dispatched to ${affectedDutyId}. Rest compliance restored.`,
        severity: 'nominal'
      },
      ...prev
    ]);

    addToast(`Standby crew assigned: Driver ${standbyDriverId} assigned to ${affectedDutyId}`);
  };

  // 2. Trigger Overtime Protocol
  const handleTriggerOvertimeProtocol = (conflictId, driverId, affectedDutyId) => {
    const timestamp = formatTimestamp(simulationTimeSeconds);

    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        return { ...d, restStatus: 'OVERTIME_AUTHORIZED', notes: 'Union protocol rule 4.2 authorized' };
      }
      return d;
    }));

    setDuties(prev => prev.map(duty => {
      if (duty.id === affectedDutyId) {
        return { ...duty, status: 'OVERTIME_APPROVED' };
      }
      return duty;
    }));

    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, status: 'RESOLVED', resolvedAt: `${timestamp} IST` };
      }
      return c;
    }));

    setAtRiskDeparturesCount(prev => Math.max(0, prev - 1));

    setActivityEvents(prev => [
      {
        id: `ev-${Date.now()}`,
        timestamp,
        type: 'OVERTIME',
        message: `Emergency overtime protocol authorized for driver ${driverId} on ${affectedDutyId}.`,
        severity: 'warning'
      },
      ...prev
    ]);

    addToast(`Overtime protocol authorized for ${driverId}`, 'warning');
  };

  // 3. Split-Shift Fallback
  const handleSplitShiftFallback = (conflictId, affectedDutyId) => {
    const timestamp = formatTimestamp(simulationTimeSeconds);

    setDuties(prev => prev.map(duty => {
      if (duty.id === affectedDutyId) {
        return {
          ...duty,
          endTime: '08:45',
          notes: 'Split duty leg 1. Handover at Mandi House relief bay.'
        };
      }
      return duty;
    }));

    // Create split shift leg 2
    const splitLeg = {
      id: `${affectedDutyId}-LEG2`,
      dutyCode: 'DT-104B',
      busId: 'BUS-104',
      driverId: 'SHARMA-18',
      routeId: 'R42',
      startTime: '08:55',
      endTime: '10:30',
      type: 'LINKED',
      isLocked: true,
      status: 'COMPLIANT',
      restRequirementMinutes: 45,
      nextReliefStop: 'Anand Vihar ISBT',
      notes: 'Split shift leg 2 with 10-min relief transfer buffer.'
    };

    setDuties(prev => [...prev, splitLeg]);

    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, status: 'RESOLVED', resolvedAt: `${timestamp} IST` };
      }
      return c;
    }));

    setAtRiskDeparturesCount(prev => Math.max(0, prev - 1));

    setActivityEvents(prev => [
      {
        id: `ev-${Date.now()}`,
        timestamp,
        type: 'SPLIT_SHIFT',
        message: `Duty ${affectedDutyId} split at Relief Point R1. Relief buffer created.`,
        severity: 'nominal'
      },
      ...prev
    ]);

    addToast(`Split-shift fallback executed for ${affectedDutyId}`);
  };

  // 4. Adjust Departure Time (+8 min)
  const handleAdjustDeparture = (conflictId, affectedDutyId, offsetMins = 8) => {
    const timestamp = formatTimestamp(simulationTimeSeconds);

    setDuties(prev => prev.map(duty => {
      if (duty.id === affectedDutyId) {
        return {
          ...duty,
          startTime: '07:08',
          endTime: '11:38',
          status: 'COMPLIANT',
          notes: `Departure offset by +${offsetMins}m to clear corridor headway overlap.`
        };
      }
      return duty;
    }));

    setCorridorOverlapPct(4.2);

    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, status: 'RESOLVED', resolvedAt: `${timestamp} IST` };
      }
      return c;
    }));

    setActivityEvents(prev => [
      {
        id: `ev-${Date.now()}`,
        timestamp,
        type: 'SCHEDULE_OFFSET',
        message: `Corridor headway separation restored. Route 17 departure delayed +8m. Overlap dropped to 4.2%.`,
        severity: 'nominal'
      },
      ...prev
    ]);

    addToast(`Departure adjusted by +${offsetMins} min: Corridor overlap resolved!`);
  };

  // 5. Reroute Variant
  const handleRerouteVariant = (conflictId, routeId) => {
    const timestamp = formatTimestamp(simulationTimeSeconds);

    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          name: `${r.name} (Outer Ring Bypass Variant)`,
          status: 'NOMINAL',
          coordinates: [
            [28.6672, 77.2285],
            [28.6550, 77.2100],
            [28.6250, 77.2100],
            [28.5880, 77.2530]
          ]
        };
      }
      return r;
    }));

    setCorridorOverlapPct(0);

    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return { ...c, status: 'RESOLVED', resolvedAt: `${timestamp} IST` };
      }
      return c;
    }));

    setActivityEvents(prev => [
      {
        id: `ev-${Date.now()}`,
        timestamp,
        type: 'REROUTE',
        message: `Route ${routeId} switched to Outer Ring Bypass variant. Spatial corridor clash eliminated.`,
        severity: 'nominal'
      },
      ...prev
    ]);

    addToast(`Route ${routeId} rerouted via Outer Ring Bypass variant!`);
  };

  // Reassign Driver
  const handleReassignDriver = (dutyId, driverId) => {
    setDuties(prev => prev.map(d => d.id === dutyId ? { ...d, driverId } : d));
  };

  // Swap Bus
  const handleSwapBus = (dutyId, busId) => {
    setDuties(prev => prev.map(d => d.id === dutyId ? { ...d, busId } : d));
  };

  // Lock / Unlock Duty
  const handleToggleLockDuty = (dutyId) => {
    setDuties(prev => prev.map(d => {
      if (d.id === dutyId) {
        const nextLocked = !d.isLocked;
        addToast(`${d.dutyCode} is now ${nextLocked ? 'LOCKED' : 'UNLOCKED'}`);
        return { ...d, isLocked: nextLocked };
      }
      return d;
    }));
  };

  // Reschedule Duty
  const handleRescheduleDuty = (dutyId, startTime, endTime) => {
    setDuties(prev => prev.map(d => d.id === dutyId ? { ...d, startTime, endTime } : d));
  };

  const activeConflictsCount = conflicts.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0f19] text-white overflow-hidden select-none font-sans">
      
      {/* 1. TOP CONTROL DECK (Sections 6, 7, 8) */}
      <TopControlDeck
        selectedDivision={selectedDivision}
        onSelectDivision={handleSelectDivision}
        simulationTimeSeconds={simulationTimeSeconds}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        onResetSimulation={() => setSimulationTimeSeconds(8 * 3600 + 30 * 60 + 15)}
        activeConflictsCount={activeConflictsCount}
        onOpenConflicts={() => setActiveTab('conflicts')}
        onOpenSearch={() => setIsSearchPaletteOpen(true)}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        alertCount={activityEvents.length}
        onShowToast={addToast}
        onToggleSidebar={onToggleSidebar}
      />

      {/* 2. KPI TELEMETRY STRIP (Section 9) */}
      <KPITelemetryStrip
        buses={buses}
        drivers={drivers}
        conflicts={conflicts}
        corridorOverlapPct={corridorOverlapPct}
        crewUtilizationPct={crewUtilizationPct}
        atRiskDeparturesCount={atRiskDeparturesCount}
      />

      {/* 3. MAIN WORKSPACE: 55% MAP / 45% DUTY DECISION ENGINE (Sections 10-23) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-0 overflow-hidden relative">
        
        {/* LEFT 55%: Live Geospatial Map Canvas */}
        <section className="h-full min-h-[360px] relative border-b lg:border-b-0 lg:border-r border-[#1f2937]">
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
            corridorOverlapPct={corridorOverlapPct}
          />
        </section>

        {/* RIGHT 45%: Duty & Conflict Decision Engine */}
        <section className="h-full min-h-[360px] relative">
          <DutyEngine
            duties={duties}
            buses={buses}
            drivers={drivers}
            routes={routes}
            conflicts={conflicts}
            simulationTimeSeconds={simulationTimeSeconds}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
            onAssignStandbyCrew={handleAssignStandbyCrew}
            onTriggerOvertimeProtocol={handleTriggerOvertimeProtocol}
            onSplitShiftFallback={handleSplitShiftFallback}
            onAdjustDeparture={handleAdjustDeparture}
            onRerouteVariant={handleRerouteVariant}
            onReassignDriver={handleReassignDriver}
            onSwapBus={handleSwapBus}
            onToggleLockDuty={handleToggleLockDuty}
            onRescheduleDuty={handleRescheduleDuty}
            onShowToast={addToast}
          />
        </section>

      </main>

      {/* 4. BOTTOM STATUS STRIP (Section 25) */}
      <BottomStatusStrip />

      {/* Activity Alert Drawer (Section 24) */}
      <ActivityAlertDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        events={activityEvents}
        onClearEvents={() => setActivityEvents([])}
      />

      {/* Global Command Palette Modal on Ctrl+K (Section 38) */}
      <CommandPaletteModal
        isOpen={isSearchPaletteOpen}
        onClose={() => setIsSearchPaletteOpen(false)}
        buses={buses}
        drivers={drivers}
        routes={routes}
        duties={duties}
        onSelectBus={handleSelectBus}
        onSelectRoute={handleSelectRoute}
        onSelectDuty={handleSelectDuty}
        onOpenConflicts={() => setActiveTab('conflicts')}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        isSimulating={isSimulating}
        onSelectDivision={handleSelectDivision}
        onShowToast={addToast}
      />

      {/* Toast Notification Stack (Section 29) */}
      <div className="fixed bottom-10 right-4 z-50 space-y-2 pointer-events-none max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl border text-xs font-sans shadow-2xl pointer-events-auto flex items-center space-x-2 animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
