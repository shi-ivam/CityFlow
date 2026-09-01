import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Bus, 
  Route, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed, activeConflictsCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Determine current active module from route path
  let currentModule = null;
  if (path.startsWith('/admin/drivers')) currentModule = 'drivers';
  else if (path.startsWith('/admin/vehicles')) currentModule = 'vehicles';
  else if (path.startsWith('/admin/routes')) currentModule = 'routes';
  else if (path.startsWith('/admin/management')) currentModule = 'management';

  // Open accordion states
  const [expandedFeature, setExpandedFeature] = useState(null);

  const toggleExpand = (featureKey) => {
    setExpandedFeature(prev => prev === featureKey ? null : featureKey);
  };

  // Module Specifications with Features and Subfeatures
  const moduleSpecs = {
    drivers: {
      title: 'DRIVERS',
      basePath: '/admin/drivers',
      icon: Users,
      color: 'text-emerald-500',
      features: [
        { key: 'overview', label: 'Overview', path: '/admin/drivers/overview' },
        { 
          key: 'drivers', 
          label: 'Drivers', 
          path: '/admin/drivers/list',
          subfeatures: [
            { label: 'All Drivers', filter: 'all' },
            { label: 'Available', filter: 'available' },
            { label: 'On Duty', filter: 'onduty' },
            { label: 'Unavailable', filter: 'unavailable' }
          ] 
        },
        { 
          key: 'workload', 
          label: 'Workload', 
          path: '/admin/drivers/workload',
          subfeatures: [
            { label: 'Daily Workload', filter: 'daily' },
            { label: 'Driving Hours', filter: 'hours' },
            { label: 'Route Distribution', filter: 'distribution' }
          ] 
        },
        { 
          key: 'rotation', 
          label: 'Rotation', 
          path: '/admin/drivers/rotation',
          subfeatures: [
            { label: 'Rotation Status', filter: 'status' },
            { label: 'Long Route Warnings', filter: 'warnings' }
          ] 
        },
        { 
          key: 'rest', 
          label: 'Rest', 
          path: '/admin/drivers/rest',
          subfeatures: [
            { label: 'Rest Status', filter: 'status' },
            { label: 'Rest Violations', filter: 'violations' }
          ] 
        },
        { 
          key: 'changeover', 
          label: 'Changeover', 
          path: '/admin/drivers/changeover',
          subfeatures: [
            { label: 'Upcoming', filter: 'upcoming' },
            { label: 'Active', filter: 'active' },
            { label: 'Completed', filter: 'completed' }
          ] 
        }
      ]
    },

    vehicles: {
      title: 'VEHICLES',
      basePath: '/admin/vehicles',
      icon: Bus,
      color: 'text-primary',
      features: [
        { key: 'overview', label: 'Overview', path: '/admin/vehicles/overview' },
        { 
          key: 'fleet', 
          label: 'Fleet', 
          path: '/admin/vehicles/fleet',
          subfeatures: [
            { label: 'All Vehicles', filter: 'all' },
            { label: 'Active', filter: 'active' },
            { label: 'Inactive', filter: 'inactive' },
            { label: 'Maintenance', filter: 'maintenance' }
          ] 
        },
        { key: 'livestatus', label: 'Live Status', path: '/admin/vehicles/livestatus' },
        { key: 'assignments', label: 'Assignments', path: '/admin/vehicles/assignments' },
        { key: 'availability', label: 'Availability', path: '/admin/vehicles/availability' },
        { key: 'maintenance', label: 'Maintenance', path: '/admin/vehicles/maintenance' }
      ]
    },

    routes: {
      title: 'ROUTES',
      basePath: '/admin/routes',
      icon: Route,
      color: 'text-amber-500',
      features: [
        { key: 'overview', label: 'Overview', path: '/admin/routes/overview' },
        { key: 'routemap', label: 'Route Map', path: '/admin/routes/map' },
        { 
          key: 'routeslist', 
          label: 'Routes', 
          path: '/admin/routes/list',
          subfeatures: [
            { label: 'All Routes', filter: 'all' },
            { label: 'Active', filter: 'active' },
            { label: 'Delayed', filter: 'delayed' },
            { label: 'High Demand', filter: 'highdemand' }
          ] 
        },
        { key: 'createroute', label: 'Create Route', path: '/admin/routes/create' },
        { 
          key: 'routeconflicts', 
          label: 'Route Conflicts', 
          path: '/admin/routes/conflicts',
          subfeatures: [
            { label: 'Spatial Overlap', filter: 'overlap' },
            { label: 'Active Conflicts', filter: 'conflicts' },
            { label: 'Resolution Engine', filter: 'resolution' }
          ] 
        },
        { 
          key: 'overflow', 
          label: 'Passenger Overflow', 
          path: '/admin/routes/overflow',
          subfeatures: [
            { label: 'Active Overflow', filter: 'active' },
            { label: 'Assistance Requests', filter: 'assistance' },
            { label: 'Resolved', filter: 'resolved' }
          ] 
        }
      ]
    },

    management: {
      title: 'MANAGEMENT',
      basePath: '/admin/management',
      icon: SlidersHorizontal,
      color: 'text-purple-500',
      features: [
        { 
          key: 'scheduling', 
          label: 'Scheduling', 
          path: '/admin/management/scheduling',
          subfeatures: [
            { label: 'Daily Gantt', filter: 'daily' },
            { label: 'Linked Duties', filter: 'linked' },
            { label: 'Unlinked Duties', filter: 'unlinked' }
          ] 
        },
        { 
          key: 'smartassignment', 
          label: 'Smart Assignment', 
          path: '/admin/management/smartassignment',
          subfeatures: [
            { label: 'Assign Driver', filter: 'assign' },
            { label: 'Replace Driver', filter: 'replace' },
            { label: 'Backup Pool', filter: 'backup' }
          ] 
        },
        { key: 'driverrotation', label: 'Driver Rotation', path: '/admin/management/rotation' },
        { 
          key: 'longjourney', 
          label: 'Long Journey', 
          path: '/admin/management/longjourney',
          subfeatures: [
            { label: 'Changeover Plan', filter: 'plan' },
            { label: 'Upcoming Handover', filter: 'upcoming' }
          ] 
        },
        { 
          key: 'alerts', 
          label: 'Alerts', 
          path: '/admin/management/alerts',
          badge: activeConflictsCount > 0 ? activeConflictsCount : null 
        },
        { key: 'networkstatus', label: 'Network Status', path: '/admin/management/network' }
      ]
    }
  };

  const activeModuleSpec = currentModule ? moduleSpecs[currentModule] : null;

  return (
    <aside
      className={`h-screen sticky top-0 bg-card border-r border-border flex flex-col justify-between transition-all duration-200 z-40 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border/70">
          <div 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          >
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
              CF
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-foreground tracking-tight truncate">
                  CITYFLOW
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  Delhi Operations
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Back to Module Choice Button */}
        <div className="p-2 border-b border-border/50">
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Return to Module Selection"
          >
            <Home className="w-3.5 h-3.5 text-primary shrink-0" />
            {!isCollapsed && <span>HOME // MODULES</span>}
          </button>
        </div>

        {/* Active Module Features List */}
        {activeModuleSpec && (
          <div className="p-2 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <activeModuleSpec.icon className={`w-3.5 h-3.5 ${activeModuleSpec.color}`} />
                <span>{activeModuleSpec.title} MODULE</span>
              </div>
            )}

            {activeModuleSpec.features.map((feature) => {
              const isExpanded = expandedFeature === feature.key;
              const hasSubfeatures = feature.subfeatures && feature.subfeatures.length > 0;
              const isFeatureActive = path.startsWith(feature.path);

              return (
                <div key={feature.key} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <NavLink
                      to={feature.path}
                      onClick={() => hasSubfeatures && toggleExpand(feature.key)}
                      className={({ isActive }) => {
                        const active = isActive || isFeatureActive;
                        return `flex-1 flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          active
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`;
                      }}
                    >
                      <span className="truncate">{feature.label}</span>
                      {feature.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                          {feature.badge}
                        </span>
                      )}
                    </NavLink>

                    {!isCollapsed && hasSubfeatures && (
                      <button
                        onClick={() => toggleExpand(feature.key)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Expandable Subfeatures Accordion */}
                  {!isCollapsed && hasSubfeatures && isExpanded && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l border-border/70 ml-3 animate-in fade-in duration-150">
                      {feature.subfeatures.map((sub, idx) => (
                        <NavLink
                          key={idx}
                          to={`${feature.path}?view=${sub.filter}`}
                          className="block px-2 py-1 rounded text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          • {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-border space-y-1 text-xs font-mono">
        <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-semibold text-foreground">Delhi Operations</span>}
        </div>
      </div>
    </aside>
  );
}
