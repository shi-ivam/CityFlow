import React, { useState } from 'react';
import DualViewDashboard from '../../components/DualViewDashboard';
import RouteMap from '../../components/RouteMap';
import GanttTimeline from '../../components/GanttTimeline';
import { Layers, MapPin, CalendarClock } from 'lucide-react';

export default function AdminOperations({
  routes = [],
  interchangeHubs = [],
  busFleet = [],
  crewMembers = [],
  dutyAssignments = [],
  operationalTime = 480,
  selectedRouteId,
  setSelectedRouteId,
  hoveredRouteId,
  setHoveredRouteId,
  selectedDutyId,
  setSelectedDutyId,
  onCommitNewRoute,
  onOpenFallbackModal,
  isDrawingMode,
  setIsDrawingMode,
  drawnCoordinates,
  setDrawnCoordinates,
  overlapReport,
  setOverlapReport
}) {
  const [activeOpsTab, setActiveOpsTab] = useState('dual');

  return (
    <div className="h-full flex flex-col min-h-0 bg-card font-sans">
      
      {/* Controls Bar for View Mode Switching */}
      <div className="h-11 border-b border-border bg-muted/40 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">
            Mission Control Workspace
          </span>
        </div>

        <div className="flex items-center bg-card p-0.5 rounded-md border border-border space-x-0.5 text-xs font-medium">
          <button
            onClick={() => setActiveOpsTab('dual')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeOpsTab === 'dual'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual-View Cockpit</span>
          </button>

          <button
            onClick={() => setActiveOpsTab('gis')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeOpsTab === 'gis'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Full GIS Map</span>
          </button>

          <button
            onClick={() => setActiveOpsTab('gantt')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition-all ${
              activeOpsTab === 'gantt'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Full Gantt Timeline</span>
          </button>
        </div>
      </div>

      {/* Main Operations View */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeOpsTab === 'dual' && (
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
            onCommitNewRoute={onCommitNewRoute}
            onOpenFallbackModal={onOpenFallbackModal}
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
            drawnCoordinates={drawnCoordinates}
            setDrawnCoordinates={setDrawnCoordinates}
            overlapReport={overlapReport}
            setOverlapReport={setOverlapReport}
          />
        )}

        {activeOpsTab === 'gis' && (
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
              onCommitNewRoute={onCommitNewRoute}
              isDrawingMode={isDrawingMode}
              setIsDrawingMode={setIsDrawingMode}
              drawnCoordinates={drawnCoordinates}
              setDrawnCoordinates={setDrawnCoordinates}
              overlapReport={overlapReport}
              setOverlapReport={setOverlapReport}
            />
          </div>
        )}

        {activeOpsTab === 'gantt' && (
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
              onOpenFallbackModal={onOpenFallbackModal}
            />
          </div>
        )}
      </div>

    </div>
  );
}
