import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Users, 
  Route, 
  SlidersHorizontal, 
  ArrowRight, 
  ShieldCheck, 
  Radio,
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import TransitOperationsCockpit from '../../components/cockpit/TransitOperationsCockpit';

export default function AdminModuleHome(props) {
  const {
    crewMembers = [],
    busFleet = [],
    routes = [],
    activeConflicts = []
  } = props;

  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('modules'); // 'modules' | 'cockpit'

  if (activeView === 'cockpit') {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 bg-[#ECE9F2] dark:bg-[#1E1C27] border-b border-[#DDD9E7] dark:border-[#332F42] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('modules')}
              className="px-3 py-1 bg-white dark:bg-[#2C2839] hover:bg-primary hover:text-white rounded-lg border border-[#DDD9E7] dark:border-[#332F42] text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              ← Back to 4-Module System
            </button>
            <span className="text-xs font-mono font-bold text-foreground">● LIVE CONTROL COCKPIT</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <TransitOperationsCockpit {...props} />
        </div>
      </div>
    );
  }

  const totalDrivers = crewMembers.length || 124;
  const availableDrivers = crewMembers.filter(c => c.isStandby || c.status === 'RESTING_COMPLIANT' || c.status === 'AVAILABLE').length || 8;

  const totalBuses = busFleet.length || 160;
  const activeBuses = busFleet.filter(b => b.status === 'IN_SERVICE').length || 142;

  const totalRoutes = routes.length || 42;
  const routeAlerts = activeConflicts.length || 3;

  const modules = [
    {
      id: 'vehicles',
      path: '/admin/vehicles',
      title: 'VEHICLE FLEET SYSTEM',
      subtitle: 'Asset Health, Dispatch & Telemetry',
      icon: Bus,
      statPrimary: `${totalBuses} Registered Buses`,
      statSecondary: `${activeBuses} Active in Service`,
      color: 'text-primary',
      badgeBg: 'bg-primary/10 text-primary border-primary/20',
      accentBorder: 'border-l-4 border-l-primary',
      bgGlow: 'hover:bg-primary/[0.02]',
      features: ['Fleet Overview', 'Live Bus Map', 'Dispatch Readiness', 'Maintenance Queue']
    },
    {
      id: 'management',
      path: '/admin/management',
      title: 'MANAGEMENT & DISPATCH',
      subtitle: 'Gantt Schedules & Rest Solver',
      icon: SlidersHorizontal,
      statPrimary: `${activeConflicts.length} Conflicts Detected`,
      statSecondary: '100% Rest Policy Compliant',
      color: 'text-[#6366F1]',
      badgeBg: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20',
      accentBorder: 'border-l-4 border-l-[#6366F1]',
      bgGlow: 'hover:bg-[#6366F1]/[0.02]',
      features: ['Daily Gantt Timeline', 'Smart Assignment', 'Driver Rotation', 'Tier-3 Solver']
    },
    {
      id: 'drivers',
      path: '/admin/drivers',
      title: 'DRIVER WORKFORCE SYSTEM',
      subtitle: 'Duty Rostering & Workload Monitor',
      icon: Users,
      statPrimary: `${totalDrivers} Total Drivers`,
      statSecondary: `${availableDrivers} Standby Available`,
      color: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
      accentBorder: 'border-l-4 border-l-emerald-600',
      bgGlow: 'hover:bg-emerald-500/[0.02]',
      features: ['Roster Management', 'Workload Distribution', 'Fatigue Scoring', 'Handover Changeover']
    },
    {
      id: 'routes',
      path: '/admin/routes',
      title: 'SPATIAL ROUTING SYSTEM',
      subtitle: 'Corridors, Stops & Network GIS',
      icon: Route,
      statPrimary: `${totalRoutes} Active Corridors`,
      statSecondary: `${routeAlerts} Corridor Alerts`,
      color: 'text-sky-700 dark:text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
      accentBorder: 'border-l-4 border-l-sky-600',
      bgGlow: 'hover:bg-sky-500/[0.02]',
      features: ['Interactive Route Map', 'Corridor Analytics', 'Frequency Tuning', 'Coverage Calculator']
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F8F7FA] dark:bg-[#181622] flex flex-col justify-between px-4 sm:px-6 py-8 max-w-6xl mx-auto font-sans select-none">
      
      {/* Top Welcome Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#DDD9E7] dark:border-[#332F42]">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-2 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>METROPOLITAN TRANSIT COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              CityFlow Administration Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
              Select a transit operational module or launch the unified real-time control cockpit.
            </p>
          </div>

          {/* Quick Launch Control Cockpit CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView('cockpit')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border border-primary"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Live Control Cockpit</span>
            </button>
          </div>
        </div>

        {/* 4 Core Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className={`bg-card border border-[#DDD9E7] dark:border-[#332F42] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${mod.accentBorder} ${mod.bgGlow}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-[#F0EEF6] dark:bg-[#24222E] border border-[#DDD9E7] dark:border-[#332F42] group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className={`w-5 h-5 ${mod.color} group-hover:text-white`} />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                          {mod.title}
                        </h2>
                        <span className="text-xs text-muted-foreground font-sans mt-0.5 block">
                          {mod.subtitle}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${mod.badgeBg}`}>
                      {mod.statPrimary}
                    </span>
                  </div>

                  {/* Subfeatures List */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 pb-2">
                    {mod.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-6 pt-4 border-t border-[#DDD9E7]/60 dark:border-[#332F42]/60 flex items-center justify-between text-xs font-mono font-semibold text-muted-foreground group-hover:text-primary">
                  <span>ENTER {mod.id.toUpperCase()} MODULE</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground">Open Subsystem</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Network Status */}
      <div className="mt-10 pt-4 border-t border-[#DDD9E7] dark:border-[#332F42] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-muted-foreground gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Engine: Chennai & Delhi Transit Network Live</span>
        </div>
        <span className="text-primary font-bold">CityFlow Transit OS v2.4</span>
      </div>

    </div>
  );
}
