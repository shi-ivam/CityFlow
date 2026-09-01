import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsBanner from './components/MetricsBanner';
import DualViewDashboard from './components/DualViewDashboard';
import RouteMap from './components/RouteMap';
import GanttTimeline from './components/GanttTimeline';
import SummaryAnalyticsView from './components/SummaryAnalyticsView';
import FallbackSolverModal from './components/FallbackSolverModal';
import PRDModal from './components/PRDModal';
import { 
  INITIAL_ROUTES, 
  INTERCHANGE_HUBS, 
  BUS_FLEET, 
  CREW_MEMBERS, 
  INITIAL_DUTIES 
} from './data/transitData';
import { 
  calculateRouteLength, 
  calculateNetworkCoverage, 
  calculateDeadheadRatio 
} from './utils/gisCalculations';
import { 
  calculateCrewUtilization, 
  detectAllConflicts 
} from './utils/dutyEngine';

export default function App() {
  // Master Operations State
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [interchangeHubs, setInterchangeHubs] = useState(INTERCHANGE_HUBS);
  const [busFleet, setBusFleet] = useState(BUS_FLEET);
  const [crewMembers, setCrewMembers] = useState(CREW_MEMBERS);
  const [dutyAssignments, setDutyAssignments] = useState(INITIAL_DUTIES);

  // Time & Simulation Scrubber (Operational time in minutes from 00:00, default 480 = 08:00 AM)
  const [operationalTime, setOperationalTime] = useState(480);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  // Active View Tab ('dual-view', 'routes-gis', 'schedule-gantt', 'analytics')
  const [activeTab, setActiveTab] = useState('dual-view');

  // Synchronized Selection & Hover States
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedDutyId, setSelectedDutyId] = useState(null);

  // Route Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState([]);
  const [overlapReport, setOverlapReport] = useState(null);

  // Modals & Drawers
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clock Simulation Timer
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setOperationalTime(prev => {
        const next = prev + simSpeed;
        return next >= 1440 ? 300 : next; // Loop back to 05:00 AM after midnight
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Derived Operational Metrics
  const crewUtilization = calculateCrewUtilization(crewMembers, dutyAssignments);
  const networkCoverageKm = calculateNetworkCoverage(routes);
  const deadheadRatio = calculateDeadheadRatio(dutyAssignments);
  const activeConflicts = detectAllConflicts(dutyAssignments, crewMembers, busFleet);

  const activeBusesCount = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const totalBusesCount = busFleet.length;

  const linkedDutiesCount = dutyAssignments.filter(d => d.dutyType === 'LINKED').length;
  const unlinkedDutiesCount = dutyAssignments.filter(d => d.dutyType === 'UNLINKED').length;

  // Commit Newly Proposed Drawn Route into active network
  const handleCommitNewRoute = (newRoute) => {
    setRoutes(prev => [...prev, newRoute]);
    showToast(`Route ${newRoute.code} committed to active network (${newRoute.lengthKm} km).`);
  };

  // Apply Fallback Resolution (replaces conflict duty in roster)
  const handleApplyResolution = (updatedDuty) => {
    setDutyAssignments(prev => prev.map(d => d.id === updatedDuty.id ? updatedDuty : d));

    // Update crew member status if reassigned
    if (updatedDuty.crewId) {
      setCrewMembers(prev => prev.map(c => {
        if (c.id === updatedDuty.crewId) {
          return { ...c, status: 'ASSIGNED', isStandby: false };
        }
        if (c.id === 'crew-02') {
          return { ...c, status: 'RESTING_COMPLIANT' };
        }
        return c;
      }));
    }

    showToast(`Conflict resolved successfully via Tier ${updatedDuty.resolvedViaTier} Fallback! 100% rest compliance achieved.`);
  };

  return (
    <div className="h-screen w-screen bg-[#050811] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        operationalTime={operationalTime}
        setOperationalTime={setOperationalTime}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        conflictsCount={activeConflicts.length}
        onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
        onOpenPRDModal={() => setIsPRDModalOpen(true)}
      />

      {/* 2. Top Mathematical KPI & Metrics Banner */}
      <MetricsBanner
        crewUtilization={crewUtilization}
        networkCoverageKm={networkCoverageKm}
        deadheadRatio={deadheadRatio}
        overlapStats={overlapReport}
        activeBusesCount={activeBusesCount}
        totalBusesCount={totalBusesCount}
        linkedDutiesCount={linkedDutiesCount}
        unlinkedDutiesCount={unlinkedDutiesCount}
        conflictsCount={activeConflicts.length}
        onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
      />

      {/* 3. Main Operational Workspaces */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        
        {/* Tab 1: Core Dual-View Unified Dashboard */}
        {activeTab === 'dual-view' && (
          <DualViewDashboard
            routes={routes}
            interchangeHubs={interchangeHubs}
            busFleet={busFleet}
            crewMembers={crewMembers}
            dutyAssignments={dutyAssignments}
            operationalTime={operationalTime}
            selectedRouteId={selectedRouteId}
            setSelectedRouteId={setSelectedRouteId}
            hoveredRouteId={hoveredRouteId}
            setHoveredRouteId={setHoveredRouteId}
            selectedDutyId={selectedDutyId}
            setSelectedDutyId={setSelectedDutyId}
            onCommitNewRoute={handleCommitNewRoute}
            onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
            drawnCoordinates={drawnCoordinates}
            setDrawnCoordinates={setDrawnCoordinates}
            overlapReport={overlapReport}
            setOverlapReport={setOverlapReport}
          />
        )}

        {/* Tab 2: Dedicated Spatial Route & Overlap GIS */}
        {activeTab === 'routes-gis' && (
          <div className="flex-1 relative flex flex-col h-full w-full min-h-0">
            <RouteMap
              routes={routes}
              interchangeHubs={interchangeHubs}
              busFleet={busFleet}
              dutyAssignments={dutyAssignments}
              operationalTime={operationalTime}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
              hoveredRouteId={hoveredRouteId}
              onHoverRoute={setHoveredRouteId}
              onCommitNewRoute={handleCommitNewRoute}
              isDrawingMode={isDrawingMode}
              setIsDrawingMode={setIsDrawingMode}
              drawnCoordinates={drawnCoordinates}
              setDrawnCoordinates={setDrawnCoordinates}
              overlapReport={overlapReport}
              setOverlapReport={setOverlapReport}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Duty Roster & Gantt Schedule */}
        {activeTab === 'schedule-gantt' && (
          <div className="flex-1 relative flex flex-col h-full w-full min-h-0">
            <GanttTimeline
              dutyAssignments={dutyAssignments}
              crewMembers={crewMembers}
              busFleet={busFleet}
              routes={routes}
              operationalTime={operationalTime}
              selectedDutyId={selectedDutyId}
              onSelectDuty={setSelectedDutyId}
              hoveredRouteId={hoveredRouteId}
              onHoverRoute={setHoveredRouteId}
              onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 4: Summary Analytics & Formulas View */}
        {activeTab === 'analytics' && (
          <SummaryAnalyticsView
            routes={routes}
            crewMembers={crewMembers}
            dutyAssignments={dutyAssignments}
            busFleet={busFleet}
            interchangeHubs={interchangeHubs}
          />
        )}

      </main>

      {/* 4. 3-Tier Fallback Solver Modal */}
      <FallbackSolverModal
        isOpen={isFallbackModalOpen}
        onClose={() => setIsFallbackModalOpen(false)}
        dutyAssignments={dutyAssignments}
        crewMembers={crewMembers}
        busFleet={busFleet}
        interchangeHubs={interchangeHubs}
        onApplyResolution={handleApplyResolution}
      />

      {/* 5. PRD Blueprint Specification Modal */}
      <PRDModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[2000] bg-slate-900/95 border border-brand-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 font-mono text-xs animate-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
