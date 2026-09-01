import React from 'react';
import SummaryAnalyticsView from '../../components/SummaryAnalyticsView';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalytics({
  routes = [],
  crewMembers = [],
  dutyAssignments = [],
  busFleet = [],
  interchangeHubs = []
}) {
  return (
    <div className="h-full flex flex-col min-h-0 bg-card font-sans">
      <div className="p-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span>Operational Intelligence</span>
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight mt-0.5">
          Summary Analytics & Mathematical Formulas
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 lg:p-6">
        <SummaryAnalyticsView
          routes={routes}
          crewMembers={crewMembers}
          dutyAssignments={dutyAssignments}
          busFleet={busFleet}
          interchangeHubs={interchangeHubs}
        />
      </div>
    </div>
  );
}
