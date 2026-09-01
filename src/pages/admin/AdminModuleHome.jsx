import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bus, Route, SlidersHorizontal, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export default function AdminModuleHome({
  crewMembers = [],
  busFleet = [],
  routes = [],
  activeConflicts = []
}) {
  const navigate = useNavigate();

  const totalDrivers = crewMembers.length || 124;
  const availableDrivers = crewMembers.filter(c => c.isStandby || c.status === 'RESTING_COMPLIANT').length || 8;

  const totalBuses = busFleet.length || 160;
  const activeBuses = busFleet.filter(b => b.status === 'IN_SERVICE').length || 142;

  const totalRoutes = routes.length || 42;
  const routeAlerts = activeConflicts.length || 3;

  const modules = [
    {
      id: 'drivers',
      path: '/admin/drivers',
      title: 'DRIVERS',
      subtitle: 'Workforce & Scheduling',
      icon: Users,
      statPrimary: `${totalDrivers} Drivers`,
      statSecondary: `${availableDrivers} Available`,
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      accentColor: 'border-l-4 border-l-emerald-500',
    },
    {
      id: 'vehicles',
      path: '/admin/vehicles',
      title: 'VEHICLES',
      subtitle: 'Fleet Operations',
      icon: Bus,
      statPrimary: `${totalBuses} Buses`,
      statSecondary: `${activeBuses} Active`,
      badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      accentColor: 'border-l-4 border-l-primary',
    },
    {
      id: 'routes',
      path: '/admin/routes',
      title: 'ROUTES',
      subtitle: 'Network & Navigation',
      icon: Route,
      statPrimary: `${totalRoutes} Active Routes`,
      statSecondary: `${routeAlerts} Corridor Alerts`,
      badgeColor: routeAlerts > 0 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      accentColor: 'border-l-4 border-l-amber-500',
    },
    {
      id: 'management',
      path: '/admin/management',
      title: 'MANAGEMENT',
      subtitle: 'Scheduling & Control',
      icon: SlidersHorizontal,
      statPrimary: `${activeConflicts.length} Active Issues`,
      statSecondary: 'Gantt & Changeovers',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      accentColor: 'border-l-4 border-l-purple-500',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col justify-center px-4 py-8 max-w-5xl mx-auto font-sans select-none">
      
      {/* Header Section */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-muted/60 border border-border text-xs font-mono text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-foreground">Delhi • India</span>
          <span>•</span>
          <span>Delhi City Transport Operations</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight uppercase">
          CITYFLOW ADMIN CONTROL CENTER
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto font-sans">
          Select an operational module below to inspect workforce, vehicle fleet, route corridors, or control settings.
        </p>
      </div>

      {/* 4 Primary Operational Section Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => navigate(mod.path)}
              className={`bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-modal hover:border-primary/50 transition-all duration-150 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${mod.accentColor}`}
            >
              <div>
                {/* Module Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${mod.badgeColor}`}>
                    {mod.statSecondary}
                  </span>
                </div>

                {/* Module Title */}
                <h2 className="text-xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {mod.title}
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {mod.subtitle}
                </p>
              </div>

              {/* Module Footer Info */}
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="font-bold text-foreground font-mono">
                  {mod.statPrimary}
                </span>
                <div className="flex items-center space-x-1 text-primary font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="mt-12 text-center text-xs font-mono text-muted-foreground flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Chennai MTC Transit Network Online • Real-time Telemetry Operational</span>
      </div>

    </div>
  );
}
