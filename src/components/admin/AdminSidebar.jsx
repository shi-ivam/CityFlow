import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard,
  Users, 
  Bus, 
  Route as RouteIcon, 
  SlidersHorizontal, 
  AlertTriangle,
  Settings,
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import SidebarAccordion from './SidebarAccordion';

export default function AdminSidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  activeConflictsCount = 0,
  conflictsCount = 0 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const search = location.search;

  const totalConflicts = activeConflictsCount || conflictsCount || 0;

  // Active Module Detection
  const isManagementActive = path.startsWith('/admin/management') || path.startsWith('/management');
  const isFleetActive = path.includes('/vehicles') || path.includes('/fleet') || path === '/admin/fleet';
  const isDriversActive = path.startsWith('/admin/drivers') || path.startsWith('/drivers');
  const isRoutesActive = path.startsWith('/admin/routes') || path.startsWith('/routes');

  // Independent accordion open states
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    if (path.includes('/management')) initial['management'] = true;
    if (path.includes('/vehicles') || path.includes('/fleet')) initial['fleet'] = true;
    if (path.includes('/drivers')) initial['drivers'] = true;
    if (path.includes('/routes')) initial['routes'] = true;
    return initial;
  });

  // Auto-expand active module on navigation or page refresh
  useEffect(() => {
    if (isManagementActive) {
      setOpenSections(prev => ({ ...prev, management: true }));
    }
    if (isFleetActive) {
      setOpenSections(prev => ({ ...prev, fleet: true }));
    }
    if (isDriversActive) {
      setOpenSections(prev => ({ ...prev, drivers: true }));
    }
    if (isRoutesActive) {
      setOpenSections(prev => ({ ...prev, routes: true }));
    }
  }, [path, isManagementActive, isFleetActive, isDriversActive, isRoutesActive]);

  const toggleSection = (sectionKey) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
    } else {
      setOpenSections(prev => ({
        ...prev,
        [sectionKey]: !prev[sectionKey]
      }));
    }
  };

  // 1. Management Submenu Items & Nested Dropdown Areas
  const isSchedActive = path.includes('/management/scheduling') || (isManagementActive && search.includes('view='));
  const isSmartActive = path.includes('/management/smartassignment');
  const isLongActive = path.includes('/management/longjourney');

  const managementItems = [
    {
      key: 'control-room',
      label: 'Control Room',
      path: '/admin/management',
      isActive: (path === '/admin/management' || path === '/admin/management/' || path === '/management' || path === '/management/') && !search
    },
    {
      key: 'scheduling-dropdown',
      label: 'Scheduling (Gantt)',
      path: '/admin/management/scheduling',
      isSubParentActive: isSchedActive,
      subitems: [
        { 
          key: 'daily-gantt', 
          label: 'Daily Gantt', 
          path: '/admin/management/scheduling?view=daily',
          isActive: isSchedActive && (search.includes('view=daily') || !search.includes('view='))
        },
        { 
          key: 'linked-duties', 
          label: 'Linked Duties', 
          path: '/admin/management/scheduling?view=linked',
          isActive: isSchedActive && search.includes('view=linked')
        },
        { 
          key: 'unlinked-duties', 
          label: 'Unlinked Duties', 
          path: '/admin/management/scheduling?view=unlinked',
          isActive: isSchedActive && search.includes('view=unlinked')
        }
      ]
    },
    {
      key: 'smart-assignment-dropdown',
      label: 'Smart Assignment',
      path: '/admin/management/smartassignment',
      isSubParentActive: isSmartActive,
      subitems: [
        { 
          key: 'all-solvers', 
          label: 'All Solvers', 
          path: '/admin/management/smartassignment',
          isActive: isSmartActive && !search.includes('view=')
        },
        { 
          key: 'assign-driver', 
          label: 'Assign Driver', 
          path: '/admin/management/smartassignment?view=assign',
          isActive: isSmartActive && search.includes('view=assign')
        },
        { 
          key: 'replace-driver', 
          label: 'Replace Driver', 
          path: '/admin/management/smartassignment?view=replace',
          isActive: isSmartActive && search.includes('view=replace')
        },
        { 
          key: 'backup-pool', 
          label: 'Backup Pool', 
          path: '/admin/management/smartassignment?view=backup',
          isActive: isSmartActive && search.includes('view=backup')
        }
      ]
    },
    {
      key: 'rotation',
      label: 'Driver Rotation',
      path: '/admin/management/rotation',
      isActive: path.includes('/management/rotation')
    },
    {
      key: 'long-journey-dropdown',
      label: 'Long Journey',
      path: '/admin/management/longjourney',
      isSubParentActive: isLongActive,
      subitems: [
        { 
          key: 'changeover-plan', 
          label: 'Changeover Plan', 
          path: '/admin/management/longjourney?view=plan',
          isActive: isLongActive && (search.includes('view=plan') || !search.includes('view='))
        },
        { 
          key: 'upcoming-handover', 
          label: 'Upcoming Handover', 
          path: '/admin/management/longjourney?view=upcoming',
          isActive: isLongActive && search.includes('view=upcoming')
        }
      ]
    },
    {
      key: 'alerts',
      label: 'Alerts',
      path: '/admin/management/alerts',
      badge: totalConflicts > 0 ? totalConflicts : null,
      badgeColor: 'bg-rose-500 text-white',
      isActive: path.includes('/management/alerts')
    },
    {
      key: 'network-status',
      label: 'Network Status',
      path: '/admin/management/network',
      isActive: path.includes('/management/network')
    }
  ];

  // 2. Fleet Submenu Items & Nested Dropdown Areas
  const isFleetSubActive = path.includes('/vehicles/fleet') || path.includes('/fleet');
  const fleetItems = [
    {
      key: 'overview',
      label: 'Overview',
      path: '/admin/vehicles/overview',
      isActive: path === '/admin/vehicles/overview' || path === '/admin/vehicles'
    },
    {
      key: 'fleet-dropdown',
      label: 'Fleet',
      path: '/admin/vehicles/fleet',
      isSubParentActive: isFleetSubActive,
      subitems: [
        {
          key: 'all-vehicles',
          label: 'All Vehicles',
          path: '/admin/vehicles/fleet',
          isActive: isFleetSubActive && !path.includes('/active') && !path.includes('/inactive') && !path.includes('/maintenance')
        },
        {
          key: 'active',
          label: 'Active',
          path: '/admin/vehicles/fleet/active',
          isActive: path.includes('/fleet/active')
        },
        {
          key: 'inactive',
          label: 'Inactive',
          path: '/admin/vehicles/fleet/inactive',
          isActive: path.includes('/fleet/inactive')
        },
        {
          key: 'maintenance',
          label: 'Maintenance',
          path: '/admin/vehicles/fleet/maintenance',
          isActive: path.includes('/fleet/maintenance')
        }
      ]
    },
    {
      key: 'live-status',
      label: 'Live Status',
      path: '/admin/vehicles/livestatus',
      isActive: path.includes('/vehicles/livestatus')
    },
    {
      key: 'assignments',
      label: 'Assignments',
      path: '/admin/vehicles/assignments',
      isActive: path.includes('/vehicles/assignments')
    },
    {
      key: 'availability',
      label: 'Availability',
      path: '/admin/vehicles/availability',
      isActive: path.includes('/vehicles/availability')
    },
    {
      key: 'maintenance-queue',
      label: 'Maintenance Queue',
      path: '/admin/vehicles/maintenance',
      isActive: path === '/admin/vehicles/maintenance'
    }
  ];

  // 3. Drivers Submenu Items
  const isDriverListActive = path.includes('/drivers/list');
  const driverItems = [
    {
      key: 'overview',
      label: 'Overview',
      path: '/admin/drivers/overview',
      isActive: path === '/admin/drivers/overview' || path === '/admin/drivers'
    },
    {
      key: 'drivers-dropdown',
      label: 'Drivers',
      path: '/admin/drivers/list',
      isSubParentActive: isDriverListActive,
      subitems: [
        { key: 'all', label: 'All Drivers', path: '/admin/drivers/list?view=all', isActive: isDriverListActive && (!search.includes('view=') || search.includes('view=all')) },
        { key: 'available', label: 'Available', path: '/admin/drivers/list?view=available', isActive: isDriverListActive && search.includes('view=available') },
        { key: 'onduty', label: 'On Duty', path: '/admin/drivers/list?view=onduty', isActive: isDriverListActive && search.includes('view=onduty') },
        { key: 'unavailable', label: 'Unavailable', path: '/admin/drivers/list?view=unavailable', isActive: isDriverListActive && search.includes('view=unavailable') }
      ]
    },
    {
      key: 'workload',
      label: 'Workload',
      path: '/admin/drivers/workload',
      isActive: path.includes('/drivers/workload')
    },
    {
      key: 'rotation',
      label: 'Rotation Status',
      path: '/admin/drivers/rotation',
      isActive: path.includes('/drivers/rotation')
    },
    {
      key: 'rest',
      label: 'Rest Status',
      path: '/admin/drivers/rest',
      isActive: path.includes('/drivers/rest')
    },
    {
      key: 'changeover',
      label: 'Changeover',
      path: '/admin/drivers/changeover',
      isActive: path.includes('/drivers/changeover')
    }
  ];

  // 4. Routes Submenu Items
  const isRouteListActive = path.includes('/routes/list');
  const routeItems = [
    {
      key: 'overview',
      label: 'Overview',
      path: '/admin/routes/overview',
      isActive: path === '/admin/routes/overview' || path === '/admin/routes'
    },
    {
      key: 'route-map',
      label: 'Route Map',
      path: '/admin/routes/map',
      isActive: path.includes('/routes/map')
    },
    {
      key: 'routes-dropdown',
      label: 'Routes',
      path: '/admin/routes/list',
      isSubParentActive: isRouteListActive,
      subitems: [
        { key: 'all', label: 'All Routes', path: '/admin/routes/list?view=all', isActive: isRouteListActive && (!search.includes('view=') || search.includes('view=all')) },
        { key: 'active', label: 'Active', path: '/admin/routes/list?view=active', isActive: isRouteListActive && search.includes('view=active') },
        { key: 'delayed', label: 'Delayed', path: '/admin/routes/list?view=delayed', isActive: isRouteListActive && search.includes('view=delayed') },
        { key: 'highdemand', label: 'High Demand', path: '/admin/routes/list?view=highdemand', isActive: isRouteListActive && search.includes('view=highdemand') }
      ]
    },
    {
      key: 'create-route',
      label: 'Create Route',
      path: '/admin/routes/create',
      isActive: path.includes('/routes/create')
    },
    {
      key: 'conflicts',
      label: 'Route Conflicts',
      path: '/admin/routes/conflicts',
      badge: totalConflicts > 0 ? totalConflicts : null,
      badgeColor: 'bg-amber-500 text-black',
      isActive: path.includes('/routes/conflicts')
    },
    {
      key: 'overflow',
      label: 'Passenger Overflow',
      path: '/admin/routes/overflow',
      isActive: path.includes('/routes/overflow')
    }
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-card border-r border-border flex flex-col justify-between transition-all duration-200 z-40 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full min-h-0">
        
        {/* Top Header & Logo */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-border/60 shrink-0">
          <div 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity overflow-hidden group"
            title="CityFlow Admin Control Center"
          >
            <div className="w-7 h-7 rounded-md bg-palette-slate flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0 transition-transform group-hover:scale-105">
              CF
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-foreground tracking-tight truncate flex items-center gap-1.5">
                  CityFlow
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-palette-slate/10 text-palette-slate font-mono font-bold">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] font-sans text-muted-foreground/80 truncate">
                  Delhi Operations
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Global Hub Navigation Links */}
        <div className="p-2 border-b border-border/40 space-y-0.5 shrink-0">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive 
                ? 'bg-palette-slate/10 text-palette-slate font-semibold' 
                : 'text-muted-foreground/85 hover:text-foreground hover:bg-muted/40'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Module Selection Hub"
          >
            <Home className="w-3.5 h-3.5 text-palette-slate shrink-0" />
            {!isCollapsed && <span>Overview</span>}
          </NavLink>

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive 
                ? 'bg-palette-slate/10 text-palette-slate font-semibold' 
                : 'text-muted-foreground/85 hover:text-foreground hover:bg-muted/40'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Operations Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
        </div>

        {/* Main Navigation Sections with Reusable Accordions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-sans text-xs scrollbar-thin">
          {!isCollapsed && (
            <div className="px-2.5 pt-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-muted-foreground/60">
              Operations
            </div>
          )}

          {/* 1. MANAGEMENT ACCORDION WITH NESTED DROPDOWN AREAS */}
          <SidebarAccordion
            label="Management"
            icon={SlidersHorizontal}
            isOpen={!!openSections.management}
            onToggle={() => toggleSection('management')}
            isParentActive={isManagementActive}
            isCollapsed={isCollapsed}
            badge={totalConflicts > 0 ? totalConflicts : null}
            badgeColor="bg-rose-500 text-white"
            items={managementItems}
          />

          {/* 2. FLEET ACCORDION WITH NESTED FLEET REGISTRY */}
          <SidebarAccordion
            label="Vehicles & Fleet"
            icon={Bus}
            isOpen={!!openSections.fleet}
            onToggle={() => toggleSection('fleet')}
            isParentActive={isFleetActive}
            isCollapsed={isCollapsed}
            items={fleetItems}
          />

          {/* 3. DRIVERS ACCORDION */}
          <SidebarAccordion
            label="Drivers"
            icon={Users}
            isOpen={!!openSections.drivers}
            onToggle={() => toggleSection('drivers')}
            isParentActive={isDriversActive}
            isCollapsed={isCollapsed}
            items={driverItems}
          />

          {/* 4. ROUTES ACCORDION */}
          <SidebarAccordion
            label="Routes"
            icon={RouteIcon}
            isOpen={!!openSections.routes}
            onToggle={() => toggleSection('routes')}
            isParentActive={isRoutesActive}
            isCollapsed={isCollapsed}
            badge={totalConflicts > 0 ? totalConflicts : null}
            badgeColor="bg-amber-500 text-black"
            items={routeItems}
          />

          {/* System Utility Links */}
          <div className="pt-2 border-t border-border/50 space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
                MONITORING & SETTINGS
              </div>
            )}

            <NavLink
              to="/admin/alerts"
              className={({ isActive }) => `flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-rose-500/15 text-rose-500 font-semibold border-l-2 border-rose-500'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Active Alerts"
            >
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                {!isCollapsed && <span>Alerts</span>}
              </div>
              {!isCollapsed && totalConflicts > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                  {totalConflicts}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Settings"
            >
              <div className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </div>
            </NavLink>
          </div>
        </div>

        {/* Footer System Status */}
        <div className="p-3 border-t border-border space-y-1 text-xs font-mono shrink-0">
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!isCollapsed && (
              <span className="text-[11px] font-semibold text-foreground">
                Delhi Operations
              </span>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
