import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/admin/MetricCard';
import { 
  Bus, 
  Users, 
  Route, 
  AlertTriangle, 
  Plus, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CalendarClock, 
  ArrowRight,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';
import RouteMap from '../../components/RouteMap';

export default function AdminDashboard({
  busFleet = [],
  crewMembers = [],
  routes = [],
  dutyAssignments = [],
  activeConflicts = [],
  crewUtilization = 87.5,
  networkCoverageKm = 412,
  deadheadRatio = 3.2,
  operationalTime = 480,
  onOpenFallbackModal
}) {
  const navigate = useNavigate();

  const activeBusesCount = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const totalBusesCount = busFleet.length;
  const activeDriversCount = crewMembers.filter(c => c.status === 'ASSIGNED' || c.status === 'ACTIVE').length;
  const availableDriversCount = crewMembers.filter(c => c.isStandby || c.status === 'RESTING_COMPLIANT').length;
  const totalRoutesCount = routes.length;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Top Banner & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Network Status: <strong className="text-foreground font-semibold">Operational</strong></span>
            <span>•</span>
            <span>Last Telemetry Sync: <strong className="text-foreground font-mono">{formatTime(operationalTime)}</strong></span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mt-1">
            Good morning, Dispatcher
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            City Transit Network Control Center — Monitoring active corridors, crew rest compliance, and fleet telemetry.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          {activeConflicts.length > 0 && (
            <button
              onClick={onOpenFallbackModal}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-rose-600 text-white font-mono text-xs font-semibold hover:bg-rose-700 shadow-sm transition-all active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Resolve {activeConflicts.length} Conflicts</span>
            </button>
          )}

          <button
            onClick={() => navigate('/admin/operations')}
            className="flex items-center space-x-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 shadow-sm transition-all"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Open Mission Control</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Buses"
          value={`${activeBusesCount} / ${totalBusesCount}`}
          subvalue={`${((activeBusesCount / (totalBusesCount || 1)) * 100).toFixed(1)}%`}
          status="nominal"
          statusLabel="In Service"
          icon={Bus}
          badgeText="Fleet Normal"
          onClick={() => navigate('/admin/buses')}
        />

        <MetricCard
          title="Drivers On Duty"
          value={activeDriversCount}
          subvalue={`${availableDriversCount} Available`}
          status={availableDriversCount > 0 ? "success" : "warning"}
          statusLabel={availableDriversCount > 0 ? "Standby Ready" : "Low Standby"}
          icon={Users}
          badgeText="Workload OK"
          onClick={() => navigate('/admin/drivers')}
        />

        <MetricCard
          title="Active Routes"
          value={totalRoutesCount}
          subvalue={`${networkCoverageKm} km Total`}
          status="nominal"
          statusLabel="100% Coverage"
          icon={Route}
          badgeText="Corridors Clear"
          onClick={() => navigate('/admin/routes')}
        />

        <MetricCard
          title="Critical Alerts"
          value={activeConflicts.length < 10 ? `0${activeConflicts.length}` : activeConflicts.length}
          subvalue={activeConflicts.length > 0 ? "Action Required" : "All Compliant"}
          status={activeConflicts.length > 0 ? "critical" : "success"}
          statusLabel={activeConflicts.length > 0 ? "Conflict Flagged" : "Zero Violations"}
          icon={AlertTriangle}
          badgeText={activeConflicts.length > 0 ? "Unresolved" : "Rest 100% OK"}
          onClick={() => navigate('/admin/alerts')}
        />
      </div>

      {/* Main Operational Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Mini Live Map / Network Overview (7 Cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg shadow-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Live Network & Fleet Spatial Map
              </h2>
            </div>
            <button
              onClick={() => navigate('/admin/operations')}
              className="text-xs font-mono text-primary hover:underline flex items-center space-x-1"
            >
              <span>Full Screen View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-[380px] w-full relative">
            <RouteMap
              routes={routes}
              busFleet={busFleet}
              dutyAssignments={dutyAssignments}
              operationalTime={operationalTime}
            />
          </div>

          <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Active Corridor</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Hub Interchange</span>
              </span>
            </div>
            <span>Turf.js ST_Buffer Vector Layer Active</span>
          </div>
        </div>

        {/* Right: Quick Actions & Operational Overview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Driver Workload & Roster Summary */}
          <div className="bg-card border border-border rounded-lg shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-foreground">Driver Workload & Rest Roster</h3>
              </div>
              <button
                onClick={() => navigate('/admin/drivers')}
                className="text-xs font-mono text-primary hover:underline"
              >
                View Roster
              </button>
            </div>

            <div className="space-y-2">
              {crewMembers.slice(0, 3).map((driver) => (
                <div key={driver.id} className="p-2.5 rounded-md border border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono font-bold text-[11px] flex items-center justify-center border border-primary/20">
                      {driver.name ? driver.name.charAt(0) : 'D'}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{driver.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{driver.id} • {driver.licenseNumber}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <div className="font-semibold text-foreground">{driver.accumulatedHours}h Shift</div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${driver.status === 'RESTING_COMPLIANT' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'}`}>
                      {driver.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Quick Commands */}
          <div className="bg-card border border-border rounded-lg shadow-card p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase font-semibold text-muted-foreground tracking-wider">
              Quick Operational Commands
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/admin/schedules')}
                className="p-2.5 rounded-md border border-border hover:border-primary bg-muted/30 hover:bg-accent text-left transition-all flex items-center space-x-2 text-xs font-medium text-foreground"
              >
                <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                <span>View Gantt Roster</span>
              </button>

              <button
                onClick={() => navigate('/admin/routes')}
                className="p-2.5 rounded-md border border-border hover:border-amber-500 bg-muted/30 hover:bg-accent text-left transition-all flex items-center space-x-2 text-xs font-medium text-foreground"
              >
                <Route className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Route Corridors</span>
              </button>

              <button
                onClick={() => navigate('/admin/buses')}
                className="p-2.5 rounded-md border border-border hover:border-emerald-500 bg-muted/30 hover:bg-accent text-left transition-all flex items-center space-x-2 text-xs font-medium text-foreground"
              >
                <Bus className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fleet Management</span>
              </button>

              <button
                onClick={onOpenFallbackModal}
                className="p-2.5 rounded-md border border-border hover:border-rose-500 bg-muted/30 hover:bg-accent text-left transition-all flex items-center space-x-2 text-xs font-medium text-foreground"
              >
                <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Run Rest Solver</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Operational Activity Feed */}
      <div className="bg-card border border-border rounded-lg shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Operational Activity Log</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">Real-time Telemetry Stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-md bg-muted/30 border border-border flex items-start space-x-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <div className="font-semibold text-foreground">Bus BUS-104 Dispatched</div>
              <div className="text-muted-foreground text-[11px] font-mono">Route 44 • On Schedule • ETA Airport 08:42</div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-muted/30 border border-border flex items-start space-x-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <div>
              <div className="font-semibold text-foreground">Driver Rest Compliance Verified</div>
              <div className="text-muted-foreground text-[11px] font-mono">CRW-102 • 11h mandatory gap met</div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-muted/30 border border-border flex items-start space-x-3 text-xs">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div>
              <div className="font-semibold text-foreground">Spatial Buffer Calculated</div>
              <div className="text-muted-foreground text-[11px] font-mono">50m PostGIS buffer verified for Route 12</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
