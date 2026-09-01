import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Compass,
  Radio,
  Calendar,
  Sparkles,
  RefreshCw,
  Navigation,
  Bus,
  Users,
  Wrench,
  AlertTriangle,
  Activity,
  BarChart3,
  FileText,
  Clock,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';

export default function AdminSidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  conflictsCount = 0 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Track accordion states for sections with sub-menus
  const [openSections, setOpenSections] = useState({
    OPERATIONS: true,
    PLANNING: true,
    FLEET: true,
    MONITORING: true,
    ANALYTICS: true,
    SYSTEM: true
  });

  const toggleSection = (secName) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSections(prev => ({ ...prev, [secName]: true }));
    } else {
      setOpenSections(prev => ({ ...prev, [secName]: !prev[secName] }));
    }
  };

  // Standardized 6-Section Enterprise Sidebar Layout
  const SECTIONS = [
    {
      name: 'OPERATIONS',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Control Room', path: '/admin/management', icon: Compass },
        { label: 'Live Network', path: '/admin/operations', icon: Radio },
      ]
    },
    {
      name: 'PLANNING',
      items: [
        { label: 'Scheduling', path: '/admin/management/scheduling', icon: Calendar },
        { label: 'Smart Assignment', path: '/admin/management/smartassignment', icon: Sparkles },
        { label: 'Driver Rotation', path: '/admin/management/rotation', icon: RefreshCw },
        { label: 'Long Journey', path: '/admin/management/longjourney', icon: Navigation },
      ]
    },
    {
      name: 'FLEET',
      items: [
        { label: 'Buses', path: '/admin/vehicles', icon: Bus },
        { label: 'Drivers', path: '/admin/drivers', icon: Users },
        { label: 'Maintenance', path: '/admin/vehicles/fleet/maintenance', icon: Wrench },
      ]
    },
    {
      name: 'MONITORING',
      items: [
        { label: 'Alerts', path: '/admin/alerts', icon: AlertTriangle, badge: conflictsCount > 0 ? conflictsCount : null },
        { label: 'Conflicts', path: '/admin/management/alerts', icon: AlertTriangle },
        { label: 'Network Status', path: '/admin/management/network', icon: Activity },
      ]
    },
    {
      name: 'ANALYTICS',
      items: [
        { label: 'Performance', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/admin/reports', icon: FileText },
      ]
    },
    {
      name: 'SYSTEM',
      items: [
        { label: 'Activity Log', path: '/admin/activity', icon: Clock },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const checkIsActive = (itemPath) => {
    if (itemPath === '/admin/management' && path === '/admin/management') return true;
    if (itemPath === '/admin/dashboard' && (path === '/admin/dashboard' || path === '/admin' || path === '/admin/')) return true;
    if (itemPath === '/admin/vehicles' && (path === '/admin/vehicles' || path.startsWith('/admin/vehicles/fleet') && !path.includes('/maintenance'))) return true;
    if (itemPath === '/admin/vehicles/fleet/maintenance' && path.includes('/maintenance')) return true;
    if (itemPath !== '/admin/management' && path.startsWith(itemPath)) return true;
    return false;
  };

  return (
    <aside 
      className={`h-full bg-[#ECE9F2] dark:bg-[#1E1C27] border-r border-[#DDD9E7] dark:border-[#332F42] flex flex-col shrink-0 transition-all duration-200 z-30 select-none font-sans ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#DDD9E7] dark:border-[#332F42] flex items-center justify-between shrink-0 bg-[#F5F4F8] dark:bg-[#24222E]">
        <div 
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2.5 cursor-pointer group min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-mono font-black text-xs shadow-sm shrink-0">
            CF
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5">
                CITYFLOW
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary">PRO</span>
              </span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider truncate">
                Transit Ops Engine
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle icon */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition shrink-0 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {SECTIONS.map((section) => {
          const isOpen = openSections[section.name] ?? true;

          return (
            <div key={section.name} className="space-y-1">
              {/* Section Header */}
              {!isCollapsed ? (
                <button
                  onClick={() => toggleSection(section.name)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider hover:text-foreground transition cursor-pointer"
                >
                  <span>{section.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
              ) : (
                <div className="h-px bg-border/40 my-2 mx-1" />
              )}

              {/* Section Items */}
              {(isOpen || isCollapsed) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = checkIsActive(item.path);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary font-bold shadow-xs'
                            : 'text-foreground/80 hover:text-foreground hover:bg-muted/50 font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`} />
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#DDD9E7] dark:border-[#332F42] bg-[#F5F4F8] dark:bg-[#24222E] flex items-center justify-between text-xs text-muted-foreground">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-mono text-[10px] text-muted-foreground truncate">MTC Dispatch Active</span>
          </div>
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" title="MTC Dispatch Active" />
        )}
      </div>
    </aside>
  );
}
