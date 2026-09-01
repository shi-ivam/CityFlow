import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  SlidersHorizontal,
  Radio,
  CalendarClock,
  Sparkles,
  RotateCcw,
  Navigation,
  Bus,
  Users,
  Route as RouteIcon,
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Activity,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed, conflictsCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navSections = [
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Control Room', path: '/admin/management', icon: SlidersHorizontal },
        { label: 'Live Network', path: '/admin/network', icon: Radio, pulse: true }
      ]
    },
    {
      group: 'PLANNING',
      items: [
        { label: 'Scheduling', path: '/admin/scheduling', icon: CalendarClock },
        { label: 'Smart Assignment', path: '/admin/assignment', icon: Sparkles },
        { label: 'Driver Rotation', path: '/admin/rotation', icon: RotateCcw },
        { label: 'Long Journey', path: '/admin/longjourney', icon: Navigation }
      ]
    },
    {
      group: 'FLEET & ASSETS',
      items: [
        { label: 'Buses', path: '/admin/fleet', icon: Bus },
        { label: 'Drivers', path: '/admin/drivers', icon: Users },
        { label: 'Routes', path: '/admin/routes', icon: RouteIcon }
      ]
    },
    {
      group: 'MONITORING',
      items: [
        { 
          label: 'Alerts', 
          path: '/admin/alerts', 
          icon: AlertTriangle,
          badge: conflictsCount > 0 ? `${conflictsCount}` : null,
          badgeColor: 'bg-rose-500 text-white'
        },
        { 
          label: 'Conflicts', 
          path: '/admin/conflicts', 
          icon: ShieldAlert,
          badge: conflictsCount > 0 ? `${conflictsCount}` : null,
          badgeColor: 'bg-amber-500 text-black'
        },
        { label: 'Network Health', path: '/admin/network', icon: Activity }
      ]
    },
    {
      group: 'ANALYTICS & AUDIT',
      items: [
        { label: 'Performance', path: '/admin/performance', icon: BarChart3 },
        { label: 'Reports', path: '/admin/reports', icon: FileText },
        { label: 'Activity Logs', path: '/admin/activity', icon: RotateCcw }
      ]
    }
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-card border-r border-border/70 flex flex-col justify-between transition-all duration-200 z-40 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full min-h-0">
        
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border/70 shrink-0">
          <div 
            onClick={() => navigate('/admin/management')}
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
              CF
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-foreground tracking-tight truncate flex items-center gap-1.5">
                  CITYFLOW
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Transit Operations
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 font-sans text-xs scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.group}
                </div>
              )}
              {isCollapsed && (
                <div className="w-full h-px bg-border/40 my-2" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact 
                    ? currentPath === item.path 
                    : currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive: navActive }) => {
                        const active = isActive || navActive;
                        return `flex items-center ${
                          isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
                        } rounded-xl text-xs font-medium transition-all relative group ${
                          active
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`;
                      }}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${item.pulse ? 'text-emerald-500 animate-pulse' : ''}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-border">
                          {item.label}
                          {item.badge && <span className="ml-1.5 font-bold text-rose-500">({item.badge})</span>}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Quick Public View & System Status */}
        <div className="p-2.5 border-t border-border/80 bg-muted/20 shrink-0 space-y-2">
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
              isCollapsed ? 'justify-center px-0' : 'justify-between'
            }`}
            title="Switch to Public Transit View"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
              {!isCollapsed && <span className="truncate">Passenger View</span>}
            </div>
          </button>

          <div className={`flex items-center space-x-2 px-1 text-xs font-mono ${isCollapsed ? 'justify-center' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] text-muted-foreground truncate">
                Telemetry: <strong className="text-foreground">Optimal (14ms)</strong>
              </span>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
