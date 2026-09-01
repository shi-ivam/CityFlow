import React, { useState } from 'react';
import { 
  Columns, 
  Maximize2, 
  Map, 
  CalendarClock, 
  Layers, 
  Sparkles, 
  SlidersHorizontal,
  Info
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
    <div className="flex-1 flex flex-col h-[calc(100vh-7.5rem)] overflow-hidden">
      
      {/* Sub-header Controls Bar */}
      <div className="h-10 bg-[#090f1f] border-b border-white/5 px-4 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
        
        {/* Dual-View Synchronized Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400"></span>
            <span className="text-white font-bold">Bi-directional Reactive Sync</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-[11px] text-slate-400">
            Spatial vector modifications re-validate shift rosters; crew rest constraints validate route viability.
          </span>
        </div>

        {/* Layout Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setLayoutMode('SPLIT_50_50')}
            className={`p-1 rounded flex items-center space-x-1 text-[11px] ${
              layoutMode === 'SPLIT_50_50' ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Split 50/50 Dual View"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dual 50/50</span>
          </button>

          <button
            onClick={() => setLayoutMode('MAP_MAXIMIZED')}
            className={`p-1 rounded flex items-center space-x-1 text-[11px] ${
              layoutMode === 'MAP_MAXIMIZED' ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Maximize GIS Map View"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Focus Map</span>
          </button>

          <button
            onClick={() => setLayoutMode('GANTT_MAXIMIZED')}
            className={`p-1 rounded flex items-center space-x-1 text-[11px] ${
              layoutMode === 'GANTT_MAXIMIZED' ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Maximize Gantt Schedule View"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Focus Gantt</span>
          </button>
        </div>

      </div>

      {/* Main Dual-View Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        
        {/* Left GIS Spatial Map Pane */}
        {(layoutMode === 'SPLIT_50_50' || layoutMode === 'MAP_MAXIMIZED') && (
          <div className={`${
            layoutMode === 'MAP_MAXIMIZED' ? 'col-span-12' : 'col-span-12 lg:col-span-6'
          } h-full relative border-r border-white/10 flex flex-col`}>
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

        {/* Right Gantt Schedule & Rest Timeline Pane */}
        {(layoutMode === 'SPLIT_50_50' || layoutMode === 'GANTT_MAXIMIZED') && (
          <div className={`${
            layoutMode === 'GANTT_MAXIMIZED' ? 'col-span-12' : 'col-span-12 lg:col-span-6'
          } h-full relative flex flex-col`}>
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
