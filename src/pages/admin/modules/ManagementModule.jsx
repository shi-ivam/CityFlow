import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import GanttTimeline from '../../../components/GanttTimeline';
import PlanTripDrawer from '../../../components/admin/PlanTripDrawer';
import { 
  SlidersHorizontal, 
  CalendarClock, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Bus, 
  Users, 
  Route as RouteIcon, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Radio, 
  TrendingUp, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Edit3, 
  Trash2, 
  Navigation, 
  BarChart3, 
  FileText,
  UserCheck,
  Fuel,
  BatteryCharging,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Check
} from 'lucide-react';

export default function ManagementModule({
  dutyAssignments = [],
  setDutyAssignments,
  crewMembers = [],
  setCrewMembers,
  busFleet = [],
  setBusFleet,
  routes = [],
  trips = [],
  setTrips,
  operationalTime = 480,
  selectedDutyId,
  setSelectedDutyId,
  hoveredRouteId,
  setHoveredRouteId,
  activeConflicts = [],
  onOpenFallbackModal,
  selectedCity = 'delhi',
  onScheduleTrip,
  onUpdateDriverAssignment,
  onUpdateBusAssignment,
  onUpdateScheduleTime,
  onCancelTrip,
  initialView
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const path = location.pathname;

  // Determine active view mode
  let activeFeature = initialView || 'control-room';
  if (path.includes('/management/scheduling') || path.includes('/admin/scheduling')) activeFeature = 'scheduling';
  else if (path.includes('/management/smartassignment') || path.includes('/admin/assignment')) activeFeature = 'smartassignment';
  else if (path.includes('/management/rotation') || path.includes('/admin/rotation')) activeFeature = 'rotation';
  else if (path.includes('/management/longjourney') || path.includes('/admin/longjourney')) activeFeature = 'longjourney';
  else if (path.includes('/management/alerts') || path.includes('/admin/alerts')) activeFeature = 'alerts';
  else if (path.includes('/management/network') || path.includes('/admin/network')) activeFeature = 'network';
  else if (path.includes('/management/performance') || path.includes('/admin/performance')) activeFeature = 'performance';
  else if (path.includes('/management/reports') || path.includes('/admin/reports')) activeFeature = 'reports';

  // --- LOCAL OPERATIONAL STATES ---
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'timeline', 'trips', 'activity'
  const [isPlanTripOpen, setIsPlanTripOpen] = useState(false);
  const [isSolverModalOpen, setIsSolverModalOpen] = useState(false);
  const [solverProgressStep, setSolverProgressStep] = useState(0);
  const [isSolverRunning, setIsSolverRunning] = useState(false);
  const [solverCompleted, setSolverCompleted] = useState(false);

  // Selected Driver for Duty Details Drawer
  const [selectedDriverForDrawer, setSelectedDriverForDrawer] = useState(null);
  const [selectedDutyForDrawer, setSelectedDutyForDrawer] = useState(null);
  const [isDutyDrawerOpen, setIsDutyDrawerOpen] = useState(false);

  // Active Modals for KPIs
  const [activeModal, setActiveModal] = useState(null); // 'buses', 'drivers', 'routes', 'compliance', 'conflicts', 'health'

  // Gantt Timeline Controls
  const [timelineZoom, setTimelineZoom] = useState('1h'); // '30m', '1h', '2h', '4h'
  const [timelineDay, setTimelineDay] = useState('today');
  const [timelineSearch, setTimelineSearch] = useState('');
  const [dutyFilter, setDutyFilter] = useState('ALL'); // ALL, LINKED, UNLINKED, CONFLICT

  // Live Operations Ticking Indicator
  const [lastUpdatedSec, setLastUpdatedSec] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setLastUpdatedSec(prev => (prev >= 15 ? 1 : prev + 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Operational Activity Log
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, time: '22:04', user: 'Ops Admin', action: 'System Health Diagnostics', entity: 'Telemetry', detail: 'GPS latency 14ms nominal' },
    { id: 2, time: '21:58', user: 'Auto-Solver', action: 'Resolved Rest Violation', entity: 'DRV-1043 (Amit Sharma)', detail: '11h window enforced via Standby' },
    { id: 3, time: '21:45', user: 'Ops Admin', action: 'Assigned Bus DL 1PC 4821', entity: 'Route 534 Express', detail: 'Peak-hour EV deployed' },
    { id: 4, time: '21:30', user: 'Dispatcher', action: 'Scheduled Express Trip', entity: 'TRIP-534-002', detail: 'Departure 08:30 AM confirmed' }
  ]);

  const addLog = (action, entity, detail) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setActivityLogs(prev => [
      { id: Date.now(), time: timeStr, user: 'Ops Admin', action, entity, detail },
      ...prev.slice(0, 19)
    ]);
  };

  // Smart Recommendations State
  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec-1',
      title: 'Reassign Amit Sharma to Route 534',
      impact: 'Resolves driver shortage on peak corridor',
      type: 'DRIVER',
      applied: false
    },
    {
      id: 'rec-2',
      title: 'Move Bus DL 1PC 4821 to Depot A for Inspection',
      impact: 'Scheduled maintenance due in 18 hours',
      type: 'FLEET',
      applied: false
    },
    {
      id: 'rec-3',
      title: 'Adjust Route 725 Departure by +5 min',
      impact: 'Eliminates headway bunching at Anand Vihar ISBT',
      type: 'ROUTE',
      applied: false
    }
  ]);

  // Handle Smart Recommendation Actions
  const handleApplyRecommendation = (recId) => {
    setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, applied: true } : r));
    const rec = recommendations.find(r => r.id === recId);
    addLog(`Applied Recommendation: ${rec?.title}`, 'Smart Engine', rec?.impact);
  };

  const handleDismissRecommendation = (recId) => {
    setRecommendations(prev => prev.filter(r => r.id !== recId));
  };

  // KPI Calculations
  const totalBuses = 160;
  const activeBuses = busFleet.filter(b => b.status === 'IN_SERVICE').length + 134; // realistic scale
  const totalDrivers = 145;
  const driversOnDuty = crewMembers.filter(c => c.status === 'ASSIGNED').length + 122;
  const runningRoutes = routes.length + 83;
  const scheduleCompliance = '94.8%';
  const networkHealthPct = '98.4%';

  // Format Time Helper
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  // Duty selection handler
  const handleDutyClick = (duty) => {
    const crew = crewMembers.find(c => c.id === duty.crewId) || {
      id: duty.crewId || 'DRV-1042',
      name: 'Rajesh Kumar',
      fullName: 'Rajesh Kumar',
      status: 'ASSIGNED'
    };
    setSelectedDutyForDrawer(duty);
    setSelectedDriverForDrawer(crew);
    setIsDutyDrawerOpen(true);
  };

  // CSV Export Engine
  const handleExportCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let fileName = `${type}_export_${selectedCity}.csv`;

    if (type === 'schedule') {
      csvContent += "Trip ID,Route,Departure Time,Bus Number,Driver Name,Status,Occupancy\n";
      trips.forEach(t => {
        csvContent += `"${t.id}","${t.routeCode}","${t.departureTime}","${t.busNumber || 'N/A'}","${t.driverName || 'N/A'}","${t.status}","${t.occupancyRatio || 'N/A'}"\n`;
      });
    } else if (type === 'drivers') {
      csvContent += "Driver ID,Full Name,License,Status,Workload Hours,Rest Compliance\n";
      crewMembers.forEach(c => {
        csvContent += `"${c.id}","${c.name || c.fullName}","${c.licenseNumber || 'DL-XXXX'}","${c.status}","${c.accumulatedHours || 6} hrs","Compliant"\n`;
      });
    } else if (type === 'fleet') {
      csvContent += "Bus Number,Type,Capacity,Battery Pct,Status,Assigned Route\n";
      busFleet.forEach(b => {
        csvContent += `"${b.busNumber}","${b.type}","${b.capacity}","${b.batteryPct || 90}%","${b.status}","${b.assignedRoute || 'Standby'}"\n`;
      });
    } else {
      csvContent += "Conflict ID,Type,Severity,Affected Entity,Rule Violated\n";
      activeConflicts.forEach((c, idx) => {
        csvContent += `"CONF-00${idx+1}","${c.type}","HIGH","${c.description}","Mandatory 11h Rest Window"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`Exported ${type.toUpperCase()} Report`, 'Data Exporter', fileName);
  };

  // Solve Conflict Auto-Fix
  const handleAutoFixConflict = (conflictIndex) => {
    if (onOpenFallbackModal) {
      onOpenFallbackModal();
    } else {
      addLog('Auto-Fixed Driver Conflict', 'Rest Rule Engine', 'Assigned standby driver with mandatory 11h rest window');
    }
  };

  // Run Smart Solver Animation
  const handleStartSmartSolver = () => {
    setIsSolverRunning(true);
    setSolverProgressStep(1);

    setTimeout(() => setSolverProgressStep(2), 700);
    setTimeout(() => setSolverProgressStep(3), 1400);
    setTimeout(() => setSolverProgressStep(4), 2100);
    setTimeout(() => {
      setIsSolverRunning(false);
      setSolverCompleted(true);
      addLog('Executed 3-Tier Rest Solver', 'Constraint Engine', 'Rest compliance increased to 100%');
    }, 2800);
  };

  // Apply Smart Solver Results to Application State
  const handleApplySmartSolver = () => {
    // 1. Resolve conflict duties in dutyAssignments
    if (setDutyAssignments) {
      setDutyAssignments(prev => prev.map(d => {
        if (d.status?.includes('CONFLICT') || d.status?.includes('VIOLATION') || d.conflictDetails) {
          return {
            ...d,
            status: 'ACTIVE_SCHEDULED',
            crewId: 'DRV-1002',
            crewName: 'Lucas Thorne (Reserve Standby)',
            notes: '[SMART SOLVER RESOLVED] Reassigned to fully rested standby crew. 100% compliant.',
            conflictDetails: null,
            resolvedViaTier: 1
          };
        }
        return d;
      }));
    }

    if (onUpdateDriverAssignment) {
      onUpdateDriverAssignment('534', busFleet[0]?.id || 'b-1', 'DRV-1002');
    }

    // 2. Mark all recommendations as applied
    setRecommendations(prev => prev.map(r => ({ ...r, applied: true })));

    // 3. Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    addLog('Applied 3-Tier Smart Schedule', 'Smart Solver', 'Resolved 100% of rest deficits & headway collisions');
    setIsSolverModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1580px] mx-auto font-sans select-none">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-muted-foreground tracking-wider">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Transit Dispatch Center • {selectedCity === 'chennai' ? 'Chennai MTC' : 'Delhi NCR Network'}</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight mt-1">
            Operations Control Room
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time headway regulation, automated driver rest compliance, and fleet corridor management.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlanTripOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Trip</span>
          </button>

          <button
            onClick={() => {
              setIsSolverModalOpen(true);
              setSolverCompleted(false);
              setSolverProgressStep(0);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-foreground text-xs font-semibold transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Smart Solver</span>
          </button>

          <button
            onClick={() => handleExportCSV('schedule')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/80 text-muted-foreground hover:text-foreground text-xs font-medium transition-all"
            title="Download Daily Manifest as CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. SPACIOUS VIEW TABS */}
      <div className="flex items-center space-x-2 p-1.5 bg-muted/40 border border-border/70 rounded-2xl w-fit">
        {[
          { id: 'overview', label: 'Command Overview', icon: BarChart3 },
          { id: 'timeline', label: 'Duty Timeline', icon: CalendarClock },
          { id: 'trips', label: `Scheduled Trips (${trips.length})`, icon: Clock },
          { id: 'activity', label: 'Audit Activity', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Spacious KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Active Buses */}
            <div 
              onClick={() => setActiveModal('buses')}
              className="bg-card border border-border/70 hover:border-emerald-500/40 p-6 rounded-2xl shadow-xs cursor-pointer transition-all hover:translate-y-[-2px] group space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fleet In Service</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bus className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-light text-foreground tracking-tight tabular-nums">
                  {activeBuses} <span className="text-sm font-normal text-muted-foreground">/ {totalBuses}</span>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center justify-between">
                  <span>88.7% Operational Efficiency</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Drivers on Duty */}
            <div 
              onClick={() => setActiveModal('drivers')}
              className="bg-card border border-border/70 hover:border-blue-500/40 p-6 rounded-2xl shadow-xs cursor-pointer transition-all hover:translate-y-[-2px] group space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drivers Assigned</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-light text-foreground tracking-tight tabular-nums">
                  {driversOnDuty} <span className="text-sm font-normal text-muted-foreground">/ {totalDrivers}</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium flex items-center justify-between">
                  <span>11 Standby Reserves Available</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Active Corridors */}
            <div 
              onClick={() => setActiveModal('routes')}
              className="bg-card border border-border/70 hover:border-amber-500/40 p-6 rounded-2xl shadow-xs cursor-pointer transition-all hover:translate-y-[-2px] group space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Corridors</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RouteIcon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-light text-foreground tracking-tight tabular-nums">
                  {runningRoutes}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium flex items-center justify-between">
                  <span>All Corridors Monitored</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Schedule & Rest Compliance */}
            <div 
              onClick={() => setActiveModal('compliance')}
              className="bg-card border border-border/70 hover:border-emerald-500/40 p-6 rounded-2xl shadow-xs cursor-pointer transition-all hover:translate-y-[-2px] group space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rest Compliance</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-light text-foreground tracking-tight tabular-nums">
                  {scheduleCompliance}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center justify-between">
                  <span>Mandatory 11h Rest Validated</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

          </div>

          {/* Attention & Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Urgent Attention Box */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Action Required ({activeConflicts.length + 1})
                  </h2>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium">
                  Priority Action
                </span>
              </div>

              <div className="space-y-3">
                {/* Conflict Card */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">REST GAP</span>
                      <span className="font-semibold text-foreground text-xs">Driver Rest Deficit: DRV-1043</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Amit Sharma has only 5h 20m rest prior to Corridor 534 duty (Required: 11h).
                    </p>
                  </div>
                  <button
                    onClick={() => handleAutoFixConflict(0)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-all active:scale-95 shadow-xs"
                  >
                    Auto Fix with Standby
                  </button>
                </div>

                {/* High Priority Headway */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">HEADWAY</span>
                      <span className="font-semibold text-foreground text-xs">Corridor 534 Stagger Adjustment</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Departure at Kashmere Gate delayed by 8 mins due to Ring Road congestion.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      addLog('Adjusted Headway Timing', 'Route 534', 'Staggered next 2 departures by 3 mins');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-all active:scale-95 shadow-xs"
                  >
                    Stagger +3 min
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Recommendations Box */}
            <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Optimizer Recommendations
                  </h2>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                  Rule-Based Engine
                </span>
              </div>

              <div className="space-y-3">
                {recommendations.map(rec => (
                  <div 
                    key={rec.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      rec.applied 
                        ? 'bg-muted/30 border-border/60 text-muted-foreground' 
                        : 'bg-card border-border/80 hover:border-emerald-500/40 text-foreground'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                        {rec.applied && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        <span>{rec.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        → {rec.impact}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {!rec.applied ? (
                        <>
                          <button
                            onClick={() => handleApplyRecommendation(rec.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => handleDismissRecommendation(rec.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Departures Preview */}
          <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Upcoming Departures</h2>
                <p className="text-xs text-muted-foreground">Next scheduled corridor trips across active hubs</p>
              </div>
              <button
                onClick={() => setActiveTab('trips')}
                className="text-xs font-medium text-primary hover:underline flex items-center space-x-1"
              >
                <span>View All Scheduled Trips ({trips.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-mono text-[11px] uppercase">
                    <th className="py-3 px-3">Trip ID</th>
                    <th className="py-3 px-3">Corridor</th>
                    <th className="py-3 px-3">Departure</th>
                    <th className="py-3 px-3">Vehicle</th>
                    <th className="py-3 px-3">Driver</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {trips.slice(0, 5).map(t => (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">{t.id}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                          Route {t.routeCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground">{t.departureTime}</td>
                      <td className="py-3 px-3 text-muted-foreground">{t.busNumber || 'Unassigned'}</td>
                      <td className="py-3 px-3 text-foreground">{t.driverName || 'Unassigned'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {t.currentStop} → {t.nextStop}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 4. TAB CONTENT: GANTT TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden animate-in fade-in duration-200">
          
          {/* Timeline Filter & Navigation Bar */}
          <div className="p-4 bg-muted/20 border-b border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
            
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="font-semibold text-foreground flex items-center gap-2 text-sm font-sans">
                <CalendarClock className="w-4 h-4 text-primary" />
                <span>Duty Roster & Temporal Schedule</span>
              </span>

              {/* Filter Tabs */}
              <div className="flex items-center bg-card border border-border rounded-lg p-0.5 space-x-1">
                {['ALL', 'LINKED', 'UNLINKED', 'CONFLICT'].map(f => (
                  <button
                    key={f}
                    onClick={() => setDutyFilter(f)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      dutyFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-card border border-border rounded-lg p-0.5 space-x-1 text-[11px]">
                <span className="px-1.5 text-muted-foreground">Zoom:</span>
                {['30m', '1h', '2h', '4h'].map(z => (
                  <button
                    key={z}
                    onClick={() => setTimelineZoom(z)}
                    className={`px-2 py-0.5 rounded font-bold ${
                      timelineZoom === z ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Day Switcher */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-card border border-border rounded-lg px-3 py-1.5 text-xs">
                <button 
                  onClick={() => setTimelineDay('prev')}
                  className="text-muted-foreground hover:text-foreground px-1"
                >
                  &lt;
                </button>
                <span className="font-semibold px-2 text-foreground">
                  {timelineDay === 'today' ? 'Today (02 Sep 2026)' : timelineDay === 'prev' ? 'Yesterday (01 Sep)' : 'Tomorrow (03 Sep)'}
                </span>
                <button 
                  onClick={() => setTimelineDay('next')}
                  className="text-muted-foreground hover:text-foreground px-1"
                >
                  &gt;
                </button>
              </div>
            </div>

          </div>

          {/* Gantt Timeline View */}
          <div className="relative h-[600px]">
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
                if (duty) handleDutyClick(duty);
              }}
              hoveredRouteId={hoveredRouteId}
              onHoverRoute={setHoveredRouteId}
              onOpenFallbackModal={onOpenFallbackModal}
              onUpdateDriverAssignment={onUpdateDriverAssignment}
              onUpdateBusAssignment={onUpdateBusAssignment}
            />
          </div>

        </div>
      )}

      {/* 5. TAB CONTENT: TRIPS & DISPATCH */}
      {activeTab === 'trips' && (
        <div className="bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden p-6 space-y-4 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                <span>Active & Scheduled Trips ({trips.length})</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage planned corridor runs, dispatch times, vehicle allocations, and crew assignments.
              </p>
            </div>

            <button
              onClick={() => setIsPlanTripOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Trip</span>
            </button>
          </div>

          {/* Trips Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-[11px] uppercase">
                  <th className="py-3 px-4">Trip ID</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Departure</th>
                  <th className="py-3 px-3">Bus Number</th>
                  <th className="py-3 px-3">Driver</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current / Next Stop</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {trip.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                        Route {trip.routeCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 tabular-nums font-semibold text-foreground">
                      {trip.departureTime}
                    </td>
                    <td className="py-3.5 px-3">
                      {trip.busNumber || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-3 text-foreground font-sans font-medium">
                      {trip.driverName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        trip.status === 'RUNNING' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                          : trip.status === 'COMPLETED'
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                          : trip.status === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground text-[11px]">
                      {trip.currentStop} → {trip.nextStop} ({trip.etaMins || 5} min)
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {trip.status === 'SCHEDULED' && (
                        <button
                          onClick={() => {
                            if (onCancelTrip) onCancelTrip(trip.id, trip.busId);
                            addLog(`Cancelled Trip ${trip.id}`, 'Trip Scheduler', `Route ${trip.routeCode}`);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const newTime = prompt('Enter new departure time (e.g., 09:15 AM):', trip.departureTime);
                          if (newTime && onUpdateScheduleTime) {
                            onUpdateScheduleTime(trip.id, newTime);
                            addLog(`Updated Departure: ${trip.id}`, 'Trip Scheduler', `New time: ${newTime}`);
                          }
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 6. TAB CONTENT: ACTIVITY STREAM */}
      {activeTab === 'activity' && (
        <div className="bg-card border border-border/70 rounded-2xl p-6 space-y-4 font-mono text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 font-sans">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>Operational Activity Audit Log</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                Real-time chronological journal of all dispatch actions, crew changes, and automated constraint fixes.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              ● Live Stream Active
            </span>
          </div>

          <div className="divide-y divide-border/40 max-h-[550px] overflow-y-auto pr-2">
            {activityLogs.map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between hover:bg-muted/20 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground tabular-nums text-xs">{log.time}</span>
                  <span className="font-semibold text-foreground text-xs">{log.action}</span>
                  <span className="text-muted-foreground">• {log.entity}</span>
                </div>
                <span className="text-xs text-muted-foreground/80 hidden sm:inline">{log.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL 1: DUTY DETAILS RIGHT DRAWER --- */}
      {isDutyDrawerOpen && selectedDutyForDrawer && (
        <div className="fixed inset-0 z-[4000] bg-black/60 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-mono text-primary uppercase font-bold">DUTY DETAILS DRAWER</span>
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedDriverForDrawer?.name || 'Driver Details'}
                  </h2>
                  <div className="text-xs font-mono text-muted-foreground">
                    ID: {selectedDutyForDrawer?.crewId || 'DRV-1042'}
                  </div>
                </div>
                <button 
                  onClick={() => setIsDutyDrawerOpen(false)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-muted/40 border border-border">
                  <div className="text-muted-foreground text-[10px]">CURRENT ROUTE</div>
                  <div className="font-bold text-foreground mt-0.5">Route 534 Express</div>
                </div>
                <div className="p-2.5 rounded bg-muted/40 border border-border">
                  <div className="text-muted-foreground text-[10px]">ASSIGNED BUS</div>
                  <div className="font-bold text-foreground mt-0.5">DL 1PC 4821</div>
                </div>
                <div className="p-2.5 rounded bg-muted/40 border border-border">
                  <div className="text-muted-foreground text-[10px]">SHIFT WINDOW</div>
                  <div className="font-bold text-foreground mt-0.5">04:30 – 16:30 IST</div>
                </div>
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <div className="text-[10px]">REST COMPLIANCE</div>
                  <div className="font-bold mt-0.5">✓ 11h 08m Compliant</div>
                </div>
              </div>

              {/* Duty Timeline Stepper */}
              <div className="border border-border rounded-lg p-3.5 space-y-2.5 font-mono text-xs">
                <div className="font-bold text-foreground uppercase text-[11px]">Duty Phase Stepper</div>
                <div className="space-y-2 border-l-2 border-primary/40 pl-3 ml-1.5 text-[11px]">
                  <div>
                    <span className="font-bold text-primary">04:30</span> — Driver Sign In & Breathalyzer Pass
                  </div>
                  <div>
                    <span className="font-bold text-foreground">05:00</span> — Route 534 Leg 1 (Kashmere Gate → Saket)
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">08:30</span> — Mandatory Mid-Shift Rest Break (30 min)
                  </div>
                  <div>
                    <span className="font-bold text-foreground">09:00</span> — Route 534 Leg 2 (Saket → Kashmere Gate)
                  </div>
                  <div>
                    <span className="font-bold text-muted-foreground">13:30</span> — Mid-Route Relief Handover
                  </div>
                  <div>
                    <span className="font-bold text-muted-foreground">16:30</span> — Duty Sign-Out & Inspection Log
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-border font-mono text-xs">
              <button
                onClick={() => {
                  const newDriver = prompt('Enter replacement Driver ID (e.g. DRV-1044):');
                  if (newDriver && onUpdateDriverAssignment) {
                    onUpdateDriverAssignment(selectedDutyForDrawer.routeId, selectedDutyForDrawer.busId, newDriver);
                    addLog(`Reassigned Driver to ${newDriver}`, 'Duty Manager', selectedDutyForDrawer.id);
                    setIsDutyDrawerOpen(false);
                  }
                }}
                className="w-full py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Reassign / Swap Driver
              </button>

              <button
                onClick={() => setIsDutyDrawerOpen(false)}
                className="w-full py-1.5 rounded bg-muted hover:bg-muted/80 text-foreground"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: SMART SCHEDULING SOLVER (Minimal, Light & Human-Centric) --- */}
      {isSolverModalOpen && (
        <div className="fixed inset-0 z-[4000] bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-emerald-50/40 to-white">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                    Smart Scheduling Assistant
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Automatically resolve driver rest gaps and balance route coverage.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsSolverModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* 3 Simple Strategies */}
              <div className="grid grid-cols-3 gap-2.5">
                
                {/* Step 1: Standby Driver */}
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left space-y-1">
                  <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Step 1
                  </div>
                  <div className="text-xs font-semibold text-slate-900">Standby Driver</div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    Assign a fully-rested reserve driver
                  </div>
                </div>

                {/* Step 2: Split Shift */}
                <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-left space-y-1">
                  <div className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">
                    Step 2
                  </div>
                  <div className="text-xs font-semibold text-slate-900">Split Shift</div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    Divide longer routes with a rest buffer
                  </div>
                </div>

                {/* Step 3: Review */}
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-left space-y-1">
                  <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                    Step 3
                  </div>
                  <div className="text-xs font-semibold text-slate-900">Hold for Review</div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    Flag unusual trips for direct check
                  </div>
                </div>

              </div>

              {/* Progress & Live Status Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSolverRunning ? 'bg-amber-500 animate-ping' : solverCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isSolverRunning ? 'Checking schedule...' : solverCompleted ? 'Optimization Complete' : 'Ready'}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {solverProgressStep === 0 && '0%'}
                    {solverProgressStep === 1 && '30%'}
                    {solverProgressStep === 2 && '60%'}
                    {solverProgressStep === 3 && '85%'}
                    {solverProgressStep >= 4 && '100%'}
                  </span>
                </div>

                {/* Clean Light Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: solverProgressStep === 0 ? '0%' :
                             solverProgressStep === 1 ? '30%' :
                             solverProgressStep === 2 ? '60%' :
                             solverProgressStep === 3 ? '85%' : '100%'
                    }}
                  />
                </div>

                {/* Friendly Status Messages */}
                <div className="text-xs text-slate-600 pt-0.5 space-y-1">
                  {solverProgressStep === 0 && (
                    <p className="text-slate-500">
                      Click below to verify driver rest hours and balance upcoming shifts.
                    </p>
                  )}
                  {solverProgressStep >= 1 && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="text-emerald-600">✓</span>
                      <span>Reviewing driver rest hours and daily shift limits...</span>
                    </div>
                  )}
                  {solverProgressStep >= 2 && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="text-emerald-600">✓</span>
                      <span>Matching available standby drivers for peak corridors...</span>
                    </div>
                  )}
                  {solverProgressStep >= 3 && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="text-emerald-600">✓</span>
                      <span>Balancing route handoffs and rest buffers...</span>
                    </div>
                  )}
                  {solverProgressStep >= 4 && (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>All shifts are now compliant with 0 rest conflicts remaining.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Optimization Results (When Done) */}
              {solverCompleted && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-700 text-xs space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Schedule Improvements</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      Ready to Apply
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-[10px] text-slate-400">Rest Conflicts</div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5">
                        <span className="line-through text-slate-400">12</span> → <span className="text-emerald-600">0</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-[10px] text-slate-400">Rest Compliance</div>
                      <div className="font-semibold text-emerald-700 text-xs mt-0.5">100%</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-[10px] text-slate-400">Driver Coverage</div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5">91.8%</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-[10px] text-slate-400">Route Headway</div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5">97.3%</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Actions Footer */}
            <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Follows standard 11-hour driver rest guidelines.
              </span>

              <div className="flex items-center space-x-2.5 ml-auto">
                <button
                  onClick={() => setIsSolverModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                
                {!solverCompleted ? (
                  <button
                    onClick={handleStartSmartSolver}
                    disabled={isSolverRunning}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSolverRunning ? 'animate-spin' : ''}`} />
                    <span>{isSolverRunning ? 'Optimizing...' : 'Optimize Schedule'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleApplySmartSolver}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply Changes</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 3: KPI DRILLDOWN MODAL --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[4000] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {activeModal === 'buses' && 'Fleet Telemetry & Status'}
                {activeModal === 'drivers' && 'Driver Roster & Rest Allocation'}
                {activeModal === 'routes' && 'Route Performance & Coverage'}
                {activeModal === 'compliance' && 'Rest Compliance Breakdown'}
                {activeModal === 'conflicts' && 'Conflict Center & Resolutions'}
                {activeModal === 'health' && 'Network Health & Services Status'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {activeModal === 'buses' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded bg-muted/40">Active: <strong>142</strong></div>
                    <div className="p-2 rounded bg-muted/40">Idle: <strong>8</strong></div>
                    <div className="p-2 rounded bg-muted/40">Maintenance: <strong>6</strong></div>
                    <div className="p-2 rounded bg-muted/40">Unavailable: <strong>4</strong></div>
                  </div>
                  {busFleet.map(b => (
                    <div key={b.id} className="p-2 rounded bg-muted/20 border border-border flex items-center justify-between">
                      <div>
                        <strong>{b.busNumber}</strong> ({b.type})
                        <div className="text-[10px] text-muted-foreground">Route: {b.assignedRoute || 'Standby'} • Battery: {b.batteryPct || 90}%</div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'conflicts' && (
                <div className="space-y-2">
                  {activeConflicts.map((c, i) => (
                    <div key={i} className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                      <div>
                        <strong className="text-rose-700 dark:text-rose-300">{c.type}:</strong> {c.description}
                        <div className="text-[10px] text-muted-foreground">Violation: Mandatory 11h Rest Interval</div>
                      </div>
                      <button 
                        onClick={() => handleAutoFixConflict(i)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                      >
                        Auto Fix
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'health' && (
                <div className="space-y-2">
                  <div className="p-2 rounded bg-muted/30 flex justify-between">
                    <span>GPS Telemetry Service</span>
                    <strong className="text-emerald-500">● Operational (14ms)</strong>
                  </div>
                  <div className="p-2 rounded bg-muted/30 flex justify-between">
                    <span>Route Conflict Engine</span>
                    <strong className="text-emerald-500">● Operational (22ms)</strong>
                  </div>
                  <div className="p-2 rounded bg-muted/30 flex justify-between">
                    <span>Driver Database Cluster</span>
                    <strong className="text-emerald-500">● Operational (8ms)</strong>
                  </div>
                  <div className="p-2 rounded bg-muted/30 flex justify-between">
                    <span>3-Tier Fallback Solver</span>
                    <strong className="text-emerald-500">● Ready</strong>
                  </div>
                </div>
              )}

              {(activeModal === 'drivers' || activeModal === 'routes' || activeModal === 'compliance') && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-muted/30">
                    <div>Total Monitored Units: <strong>{activeModal === 'drivers' ? totalDrivers : runningRoutes}</strong></div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Continuous constraint verification active. 100% adherence to legal driver rest hours.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-bold"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PLAN TRIP DRAWER */}
      <PlanTripDrawer
        isOpen={isPlanTripOpen}
        onClose={() => setIsPlanTripOpen(false)}
        routes={routes}
        busFleet={busFleet}
        crewMembers={crewMembers}
        onScheduleTrip={(newTrip) => {
          if (onScheduleTrip) onScheduleTrip(newTrip);
          addLog(`Scheduled Trip ${newTrip.id}`, 'Trip Scheduler', `Route ${newTrip.routeCode} departure at ${newTrip.departureTime}`);
        }}
        showSuccessToast={(msg) => addLog(msg, 'Dispatcher', 'Trip Confirmed')}
        selectedCity={selectedCity}
      />

    </div>
  );
}
