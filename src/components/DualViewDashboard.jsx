import React, { useState } from 'react';
import { 
  Columns, 
  Map, 
  CalendarClock 
} from 'lucide-react';
import RouteMap from './RouteMap';
import GanttTimeline from './GanttTimeline';

export default function DualViewDashboard({
  routes,
  interchangeHubs,
  busFleet,
  crewMembers,
  dutyAssignments,
  operationalTime,
  selectedRouteId,
  setSelectedRouteId,
  hoveredRouteId,
  setHoveredRouteId,
  selectedDutyId,
  setSelectedDutyId,
  onCommitNewRoute,
  onOpenFallbackModal,
  onOpenNewDutyModal,
  isDrawingMode,
  setIsDrawingMode,
  drawnCoordinates,
  setDrawnCoordinates,
  overlapReport,
  setOverlapReport
}) {
  const [layoutMode, setLayoutMode] = useState('SPLIT_50_50'); // 'SPLIT_50_50', 'MAP_MAXIMIZED', 'GANTT_MAXIMIZED'

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-6.75rem)] overflow-hidden bg-[#FBFBFA]">
      
      {/* Sub-header Controls Bar */}
      <div className="h-9 bg-[#FFFFFF] border-b border-[#EAEAEA] px-4 lg:px-8 flex items-center justify-between text-xs font-mono text-[#787774] shrink-0">
        
        {/* Dual-View Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]"></span>
            <span className="text-[#111111] font-semibold">Bi-directional Reactive Sync</span>
          </div>
          <span className="text-[#EAEAEA]">|</span>
          <span className="hidden sm:inline text-[11px] text-[#787774]">
            Spatial changes re-evaluate shift rosters; driver rest constraints validate route viability.
          </span>
        </div>

        {/* Layout Mode Switcher */}
        <div className="flex items-center space-x-0.5 bg-[#F7F6F3] p-0.5 rounded-[4px] border border-[#EAEAEA]">
          <button
            onClick={() => setLayoutMode('SPLIT_50_50')}
            className={`px-2 py-0.5 rounded-[3px] flex items-center space-x-1 text-[11px] font-medium ${
              layoutMode === 'SPLIT_50_50' ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-xs border border-[#EAEAEA]' : 'text-[#787774] hover:text-[#111111]'
            }`}
            title="Split 50/50 Dual View"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden md:inline">Split 50/50</span>
          </button>

          <button
            onClick={() => setLayoutMode('MAP_MAXIMIZED')}
            className={`px-2 py-0.5 rounded-[3px] flex items-center space-x-1 text-[11px] font-medium ${
              layoutMode === 'MAP_MAXIMIZED' ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-xs border border-[#EAEAEA]' : 'text-[#787774] hover:text-[#111111]'
            }`}
            title="Focus Map"
          >
            <Map className="w-3 h-3" />
            <span className="hidden md:inline">Focus Map</span>
          </button>

          <button
            onClick={() => setLayoutMode('GANTT_MAXIMIZED')}
            className={`px-2 py-0.5 rounded-[3px] flex items-center space-x-1 text-[11px] font-medium ${
              layoutMode === 'GANTT_MAXIMIZED' ? 'bg-[#FFFFFF] text-[#111111] font-semibold shadow-xs border border-[#EAEAEA]' : 'text-[#787774] hover:text-[#111111]'
            }`}
            title="Focus Gantt"
          >
            <CalendarClock className="w-3 h-3" />
            <span className="hidden md:inline">Focus Gantt</span>
          </button>
        </div>

      </div>

      {/* Main Dual-View Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* Left Spatial Map */}
        {(layoutMode === 'SPLIT_50_50' || layoutMode === 'MAP_MAXIMIZED') && (
          <div className={`${
            layoutMode === 'MAP_MAXIMIZED' ? 'col-span-12' : 'col-span-12 lg:col-span-6'
          } h-full relative border-r border-[#EAEAEA] flex flex-col min-h-0`}>
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

        {/* Right Gantt Schedule Timeline */}
        {(layoutMode === 'SPLIT_50_50' || layoutMode === 'GANTT_MAXIMIZED') && (
          <div className={`${
            layoutMode === 'GANTT_MAXIMIZED' ? 'col-span-12' : 'col-span-12 lg:col-span-6'
          } h-full relative flex flex-col min-h-0 bg-[#FFFFFF]`}>
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
              onOpenNewDutyModal={onOpenNewDutyModal}
            />
          </div>
        )}

      </div>

    </div>
  );
}
