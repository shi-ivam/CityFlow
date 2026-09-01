import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GanttTimeline from '../../../components/GanttTimeline';
import { 
  SlidersHorizontal, 
  CalendarClock, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Zap,
  Activity,
  Bus,
  Users,
  Route as RouteIcon,
  CheckCircle2,
  Clock,
  RefreshCw,
  Navigation,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  UserCheck,
  RotateCcw,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export default function ManagementModule({
  dutyAssignments = [],
  crewMembers = [],
  busFleet = [],
  routes = [],
  operationalTime = 480,
  selectedDutyId,
  setSelectedDutyId,
  hoveredRouteId,
  setHoveredRouteId,
  activeConflicts = [],
  onOpenFallbackModal
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const subFilter = searchParams.get('view') || 'all';

  // Feature selection
  let activeFeature = 'control_room';
  if (path.includes('/management/scheduling')) activeFeature = 'scheduling';
  else if (path.includes('/management/smartassignment')) activeFeature = 'smartassignment';
  else if (path.includes('/management/rotation')) activeFeature = 'rotation';
  else if (path.includes('/management/longjourney')) activeFeature = 'longjourney';
  else if (path.includes('/management/alerts')) activeFeature = 'alerts';
  else if (path.includes('/management/network')) activeFeature = 'network';

  // Local interactive states
  const [timelineDate, setTimelineDate] = useState('Today (Active Shift)');
  const [zoomLevel, setZoomLevel] = useState('1h');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerDuty, setDrawerDuty] = useState(null);
  const [appliedSolverToast, setAppliedSolverToast] = useState(false);
  const [handoffSuccessToast, setHandoffSuccessToast] = useState(false);
  const [attentionItems, setAttentionItems] = useState([
    {
      id: 'att-1',
      title: 'Driver Rest Violation (<11h continuous gap)',
      context: 'Driver DRV-1021 assigned to Shift B with only 8.5 hours rest following prior long haul.',
      badge: 'LEGAL BREACH',
      badgeColor: 'bg-rose-500 text-white',
      actionLabel: 'Swap Standby Driver',
      actionType: 'SWAP_DRIVER'
    },
    {
      id: 'att-2',
      title: 'Unassigned Peak Trip on Route 534',
      context: 'Trip 534-T04 scheduled for 09:30 AM lacks driver allocation.',
      badge: 'UNASSIGNED',
      badgeColor: 'bg-amber-500 text-black',
      actionLabel: 'Auto-Assign Driver',
      actionType: 'AUTO_ASSIGN'
    },
    {
      id: 'att-3',
      title: 'Bus BUS-104 Minor Delay (+9 mins)',
      context: 'Corridor traffic near Kashmere Gate interchange slowed vehicle progression.',
      badge: 'DELAY RISK',
      badgeColor: 'bg-blue-500 text-white',
      actionLabel: 'Adjust Headway',
      actionType: 'RE_ROUTE'
    }
  ]);

  const handleResolveAttention = (itemId) => {
    setAttentionItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleOpenDutyDrawer = (duty) => {
    setDrawerDuty(duty);
    setIsDrawerOpen(true);
  };

  const handleApplySolverSolution = () => {
    setAppliedSolverToast(true);
    setTimeout(() => setAppliedSolverToast(false), 4000);
  };

  const handleConfirmHandoff = () => {
    setHandoffSuccessToast(true);
    setTimeout(() => setHandoffSuccessToast(false), 4000);
  };

  const activeBusesCount = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const activeDriversCount = crewMembers.filter(c => c.status === 'ASSIGNED' || c.status === 'ON_DUTY').length;
  const complianceRate = activeConflicts.length === 0 ? 100 : Math.round(100 - (activeConflicts.length * 3.5));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans select-none text-foreground">
      
      {/* 1. Header & Quick Feature Tabs */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
            OPERATIONS & CONTROL ROOM / {activeFeature.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-0.5">
            Dispatch Control Room & Roster Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time constraint solvers, high-density Gantt timelines, changeovers, and fleet status telemetry.
          </p>
        </div>

        {/* Feature Navigation Switcher */}
        <div className="flex items-center flex-wrap gap-1 bg-card p-1 rounded-2xl border border-border text-xs font-mono">
          {[
            { id: 'control_room', label: 'Overview', path: '/admin/management' },
            { id: 'scheduling', label: 'Gantt Schedule', path: '/admin/management/scheduling' },
            { id: 'smartassignment', label: 'Smart Solver', path: '/admin/management/smartassignment' },
            { id: 'rotation', label: 'Rotation', path: '/admin/management/rotation' },
            { id: 'longjourney', label: 'Long Journey', path: '/admin/management/longjourney' },
            { id: 'network', label: 'Network', path: '/admin/management/network' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeFeature === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Operational Summary Bar (Compact, high-contrast, live) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Buses</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-foreground">{activeBusesCount || 18}</span>
            <span className="text-[10px] text-muted-foreground">/ {busFleet.length || 24}</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">● 92% Nominal</span>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Drivers</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-foreground">{activeDriversCount || 22}</span>
            <span className="text-[10px] text-muted-foreground">/ {crewMembers.length || 30}</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">● 6 Standby</span>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Corridors</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-foreground">{routes.length || 12}</span>
            <span className="text-[10px] text-muted-foreground">Routes</span>
          </div>
          <span className="text-[10px] text-primary font-bold mt-1">412 km Spanned</span>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Rest Compliance</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-foreground">{complianceRate}%</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">11h Standard</span>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Conflicts</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-rose-500">{activeConflicts.length}</span>
            <span className="text-[10px] text-muted-foreground">Exceptions</span>
          </div>
          <button onClick={onOpenFallbackModal} className="text-[10px] text-rose-500 hover:underline font-bold mt-1 text-left cursor-pointer">
            Run Solver &rarr;
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Network Health</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">99.4%</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">Telemetry Live</span>
        </div>
      </div>

      {/* 3. Requires Attention Priority Section */}
      {attentionItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border-2 border-rose-500/30 dark:border-rose-500/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-sm font-bold text-foreground">
                Requires Immediate Attention ({attentionItems.length})
              </h2>
            </div>
            <button
              onClick={onOpenFallbackModal}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold font-mono hover:bg-rose-600 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Resolve All with 3-Tier Solver</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {attentionItems.map(item => (
              <div key={item.id} className="p-3.5 rounded-xl bg-background border border-border flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <button
                      onClick={() => handleResolveAttention(item.id)}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <h3 className="font-bold text-xs text-foreground mt-2">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.context}</p>
                </div>

                <button
                  onClick={() => {
                    handleResolveAttention(item.id);
                    onOpenFallbackModal();
                  }}
                  className="w-full py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-palette-ice" />
                  <span>{item.actionLabel}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. OVERVIEW / CONTROL ROOM DASHBOARD */}
      {activeFeature === 'control_room' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Gantt Preview Box */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5 font-mono text-xs">
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">Active Shift Duty Timeline (04:00 - 24:00 IST)</span>
              </div>
              <button 
                onClick={() => navigate('/admin/management/scheduling')} 
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Expand Full Gantt &rarr;
              </button>
            </div>

            <div className="h-[440px] relative overflow-hidden rounded-xl border border-border">
              <GanttTimeline
                dutyAssignments={dutyAssignments}
                crewMembers={crewMembers}
                busFleet={busFleet}
                routes={routes}
                operationalTime={operationalTime}
                selectedDutyId={selectedDutyId}
                onSelectDuty={(id) => {
                  setSelectedDutyId(id);
                  const duty = dutyAssignments.find(d => d.id === id);
                  if (duty) handleOpenDutyDrawer(duty);
                }}
                hoveredRouteId={hoveredRouteId}
                onHoverRoute={setHoveredRouteId}
                onOpenFallbackModal={onOpenFallbackModal}
                externalFilter="all"
              />
            </div>
          </div>

          {/* Incident Feed & Quick Actions Dock */}
          <div className="space-y-4">
            
            {/* Quick Actions Dock */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-xs font-mono text-xs">
              <h2 className="font-bold font-sans text-sm text-foreground">Dispatcher Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenFallbackModal}
                  className="p-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition shadow-xs cursor-pointer flex flex-col items-center text-center gap-1"
                >
                  <Sparkles className="w-4 h-4 text-palette-ice" />
                  <span className="text-[11px]">Run Auto-Solver</span>
                </button>
                <button
                  onClick={() => navigate('/admin/management/rotation')}
                  className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition shadow-xs cursor-pointer flex flex-col items-center text-center gap-1"
                >
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span className="text-[11px]">Rebalance Roster</span>
                </button>
                <button
                  onClick={() => navigate('/admin/drivers')}
                  className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition shadow-xs cursor-pointer flex flex-col items-center text-center gap-1"
                >
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px]">Standby Pool</span>
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition shadow-xs cursor-pointer flex flex-col items-center text-center gap-1"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px]">Export Shift Log</span>
                </button>
              </div>
            </div>

            {/* Active Incident Feed */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="font-bold text-xs text-foreground flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Real-Time Incident Stream</span>
                </h2>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">● Streaming</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Swap Executed</span>
                    <span className="text-[10px] text-muted-foreground">08:42 AM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Standby driver DRV-1044 swapped for compliance.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Headway Synchronized</span>
                    <span className="text-[10px] text-muted-foreground">08:35 AM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Route 429 headway calibrated to 12 min.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Corridor Inspection</span>
                    <span className="text-[10px] text-muted-foreground">08:18 AM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">50m PostGIS buffer verified on Ring Road.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. GANTT SCHEDULING MODULE */}
      {activeFeature === 'scheduling' && (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col h-[640px]">
          {/* Timeline Toolbar */}
          <div className="p-3 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            {/* Day navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setTimelineDate('Yesterday')}
                className="p-1 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-card border border-border font-bold text-foreground">
                {timelineDate}
              </span>
              <button
                onClick={() => setTimelineDate('Tomorrow')}
                className="p-1 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View filters */}
            <div className="flex items-center space-x-1">
              <a
                href="/admin/management/scheduling?view=daily"
                className={`px-3 py-1 rounded-xl transition ${subFilter === 'daily' || subFilter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Daily Gantt
              </a>
              <a
                href="/admin/management/scheduling?view=linked"
                className={`px-3 py-1 rounded-xl transition ${subFilter === 'linked' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Linked Duties
              </a>
              <a
                href="/admin/management/scheduling?view=unlinked"
                className={`px-3 py-1 rounded-xl transition ${subFilter === 'unlinked' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                Unlinked Duties
              </a>
            </div>

            {/* Zoom presets */}
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground mr-1">Zoom:</span>
              {['30m', '1h', '2h', '4h'].map(z => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${zoomLevel === z ? 'bg-foreground text-background font-bold' : 'bg-muted text-muted-foreground'}`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Solver button */}
            <button
              onClick={onOpenFallbackModal}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-palette-ice" />
              <span>3-Tier Rest Solver</span>
            </button>
          </div>

          {/* Timeline canvas */}
          <div className="flex-1 relative flex flex-col min-h-0">
            <GanttTimeline
              dutyAssignments={dutyAssignments}
              crewMembers={crewMembers}
              busFleet={busFleet}
              routes={routes}
              operationalTime={operationalTime}
              selectedDutyId={selectedDutyId}
              onSelectDuty={(id) => {
                setSelectedDutyId(id);
                const duty = dutyAssignments.find(d => d.id === id);
                if (duty) handleOpenDutyDrawer(duty);
              }}
              hoveredRouteId={hoveredRouteId}
              onHoverRoute={setHoveredRouteId}
              onOpenFallbackModal={onOpenFallbackModal}
              externalFilter={subFilter}
            />
          </div>
        </div>
      )}

      {/* 6. SMART ASSIGNMENT SOLVER */}
      {activeFeature === 'smartassignment' && (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Smart Constraint-Based Crew Assignment Solver
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Evaluates mandatory 11h rest periods, route difficulty, depot proximity, and driving limits.
              </p>
            </div>

            <button
              onClick={handleApplySolverSolution}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-sans shadow-sm transition active:scale-95 cursor-pointer flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-palette-ice" />
              <span>Apply Optimized Solution</span>
            </button>
          </div>

          {appliedSolverToast && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-sans text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Optimization plan applied! All duties updated to 100% rest compliance.</span>
            </div>
          )}

          {/* Before vs After Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-600 dark:text-rose-400">BEFORE OPTIMIZATION</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 text-[10px] font-bold">2 CONFLICTS</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                <li>• Driver DRV-1021: 8.5h rest gap between consecutive shifts (&lt;11h legal limit)</li>
                <li>• Driver DRV-1033: Assigned to heavy corridor for 3 consecutive days</li>
                <li>• Standby drivers idle: 6 available in reserve pool</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">AFTER OPTIMIZATION</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 text-[10px] font-bold">0 CONFLICTS</span>
              </div>
              <ul className="space-y-1.5 text-foreground text-[11px]">
                <li>• Driver DRV-1021 reassigned to afternoon duty (13.5h rest satisfied ✓)</li>
                <li>• Standby driver DRV-1044 swapped to cover morning corridor Route 534</li>
                <li>• Fair fatigue distribution index improved to 94.8%</li>
              </ul>
            </div>
          </div>

          {/* Standby Pool Grid */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
            <div className="font-bold text-foreground flex items-center justify-between">
              <span>Ready Standby Driver Pool</span>
              <span className="text-[11px] text-emerald-500 font-normal">6 Drivers On-Call</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {crewMembers.filter(c => c.isStandby || c.status === 'STANDBY').slice(0, 3).map(driver => (
                <div key={driver.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">{driver.name}</div>
                    <div className="text-[10px] text-muted-foreground">Depot: Millennium Central</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 font-bold">
                    STANDBY
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 7. DRIVER ROTATION */}
      {activeFeature === 'rotation' && (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Driver Fatigue & Corridor Rotation Management
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Balancing heavy traffic corridors with feeder routes to avoid driver burnout.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Fair Roster Index: 94.2%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">FATIGUE INDEX</span>
              <div className="text-2xl font-bold text-emerald-600">Low (12.4%)</div>
              <span className="text-[10px] text-muted-foreground">All active drivers within safe limits</span>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">CORRIDOR ROTATION CYCLE</span>
              <div className="text-2xl font-bold text-primary">7-Day Rolling</div>
              <span className="text-[10px] text-muted-foreground">Next shift swap: Tomorrow 04:00 IST</span>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">RESTING DRIVERS</span>
              <div className="text-2xl font-bold text-foreground">
                {crewMembers.filter(c => c.status === 'RESTING_COMPLIANT' || c.isStandby).length || 8} Drivers
              </div>
              <span className="text-[10px] text-emerald-500">✓ 100% 11h Rest Compliance</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. LONG JOURNEY CHANGEOVER PLANNING */}
      {activeFeature === 'longjourney' && (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Long Journey Multi-Crew Changeover Management
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Intercity corridors exceeding 4.5 hours require verified mid-route driver swaps and rest stops.
              </p>
            </div>

            <button
              onClick={handleConfirmHandoff}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-sans shadow-sm transition active:scale-95 cursor-pointer flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-palette-ice" />
              <span>Confirm Scheduled Handoff</span>
            </button>
          </div>

          {handoffSuccessToast && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-sans text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Crew handoff confirmed at Central Interchange Hub! Telemetry synchronized.</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
            <div className="font-bold text-foreground flex items-center justify-between">
              <span>Scheduled Handover: Corridor R101 (Intercity Express)</span>
              <span className="text-[11px] text-emerald-500 font-normal">Handoff Due: 11:30 AM</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="text-[10px] text-muted-foreground uppercase">Departing Driver</div>
                <div className="font-bold text-foreground mt-1">Driver Suresh Nair</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Duty Duration: 4h 15m • Ready for 11h Rest</div>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="text-[10px] text-muted-foreground uppercase">Relief Driver</div>
                <div className="font-bold text-foreground mt-1">Driver Amit Sharma</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">14h Rested • Ready for Takeover</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. NETWORK STATUS */}
      {activeFeature === 'network' && (
        <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Network Infrastructure & Telemetry Health
              </h2>
              <p className="text-xs text-muted-foreground font-sans mt-0.5">
                Real-time ping telemetry for vehicle GPS beacons, roadside sensors, and dispatch sockets.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>ALL SERVICES ONLINE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">REST API LATENCY</span>
              <div className="text-2xl font-bold text-emerald-600">38 ms</div>
              <span className="text-[10px] text-muted-foreground">FastAPI Backend (Port 8000)</span>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">GPS TELEMETRY FEED</span>
              <div className="text-2xl font-bold text-primary">100% Signal</div>
              <span className="text-[10px] text-muted-foreground">24 Active Vehicle Beacons</span>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground">SQLITE PERSISTENCE</span>
              <div className="text-2xl font-bold text-foreground">Active</div>
              <span className="text-[10px] text-emerald-500">Zero Query Locks</span>
            </div>
          </div>
        </div>
      )}

      {/* 10. Duty Details Drawer (Modal Slide-over) */}
      {isDrawerOpen && drawerDuty && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-5 overflow-y-auto space-y-5 font-sans z-10 animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Duty Details Inspector</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{drawerDuty.id}</h3>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile context */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase">Assigned Driver</span>
                <div className="font-bold text-foreground text-sm">
                  {crewMembers.find(c => c.id === drawerDuty.crewId)?.name || drawerDuty.crewId}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Rest Status: 11h Compliant
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase">Assigned Bus</span>
                <div className="font-bold text-foreground text-sm">{drawerDuty.busId}</div>
                <div className="text-[11px] text-muted-foreground">Model: Electric Low-Floor 42-Seater</div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase">Corridor Timing</span>
                <div className="font-bold text-foreground">
                  Shift Hours: {Math.floor(drawerDuty.startTime / 60)}:00 - {Math.floor(drawerDuty.endTime / 60)}:00 IST
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Duty Type: <strong className="text-foreground">{drawerDuty.dutyType || 'LINKED'}</strong>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenFallbackModal();
                }}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4 text-palette-ice" />
                <span>Reassign Driver to Standby</span>
              </button>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/admin/vehicles');
                }}
                className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Bus className="w-4 h-4 text-primary" />
                <span>Swap Vehicle Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
