import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell,
  User,
  Sliders,
  LogOut,
  ChevronDown,
  ChevronRight, 
  Layers,
  Activity
} from 'lucide-react';

export default function AdminHeader({
  onOpenSearch,
  operationalTime = 480,
  setOperationalTime,
  isSimulating,
  setIsSimulating,
  simSpeed,
  setSimSpeed,
  conflictsCount = 0,
  onOpenFallbackModal,
  onOpenAlerts,
  alertCount = 3,
  darkMode,
  setDarkMode,
  selectedCity = 'delhi',
  onSelectCity
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const getPageTitle = (path) => {
    if (path.includes('/routes')) return 'Spatial Route Operations';
    if (path.includes('/drivers')) return 'Driver Rostering & Workload';
    if (path.includes('/vehicles/fleet/maintenance')) return 'Fleet Workshop Maintenance';
    if (path.includes('/vehicles')) return 'Fleet & Vehicle Management';
    if (path.includes('/management/scheduling')) return 'Gantt Schedule Management';
    if (path.includes('/management/smartassignment')) return 'Smart Crew Assignment Solver';
    if (path.includes('/management/rotation')) return 'Fatigue & Route Rotation';
    if (path.includes('/management/longjourney')) return 'Long Journey Changeover Planning';
    if (path.includes('/management/alerts')) return 'Conflict & Exception Center';
    if (path.includes('/management/network')) return 'Network Infrastructure Status';
    if (path.includes('/management')) return 'Dispatch & Control Room';
    if (path.includes('/alerts')) return 'System Alerts & Warnings';
    if (path.includes('/analytics')) return 'Operational Intelligence & Reports';
    if (path.includes('/reports')) return 'Automated Export Reports';
    if (path.includes('/activity')) return 'Dispatch Audit Activity Log';
    if (path.includes('/settings')) return 'System Configuration Parameters';
    return 'Admin Control Center';
  };

  const pageTitle = getPageTitle(location.pathname);

  const CITIES = [
    { id: 'delhi', name: 'Delhi NCR Operations', code: 'DEL-01' },
    { id: 'chennai', name: 'Chennai MTC Transit', code: 'CHE-04' }
  ];

  const currentCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];

  return (
    <header className="h-16 bg-[#F5F4F8] dark:bg-[#24222E] border-b border-[#DDD9E7] dark:border-[#332F42] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans transition-colors select-none text-foreground">
      
      {/* Left: City Selector & Breadcrumb */}
      <div className="flex items-center space-x-3 min-w-0">
        
        {/* Working City Selector Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsCityOpen(!isCityOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-card border border-border shadow-xs hover:border-primary text-xs font-bold text-foreground transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">{currentCityObj.name}</span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCityOpen && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-card border border-border shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-muted-foreground font-bold tracking-wider border-b border-border/50">
                Transit Operating Regions
              </div>
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    if (onSelectCity) onSelectCity(city.id);
                    setIsCityOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    selectedCity === city.id
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span>{city.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{city.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 hidden sm:inline shrink-0" />

        {/* Page Title */}
        <h1 className="text-xs font-bold text-muted-foreground hidden sm:inline tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-card hover:bg-card/90 border border-border text-xs text-muted-foreground transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-[11px] font-medium text-muted-foreground">Search routes, drivers, buses...</span>
          </div>
          <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">Ctrl K</kbd>
        </button>
      </div>

      {/* Right Controls Suite */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Ops Clock Capsule */}
        <div className="flex items-center bg-card border border-border rounded-xl px-2.5 py-1 space-x-2 font-mono text-xs text-foreground shadow-xs">
          <span className="font-bold tabular-nums text-[11px]">{formatTime(operationalTime)}</span>

          <div className="h-3 w-px bg-border" />

          {setIsSimulating && (
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? "Pause Simulation" : "Play Simulation"}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {isSimulating ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
            </button>
          )}

          {setSimSpeed && (
            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 5 : simSpeed === 5 ? 15 : 1)}
              title="Toggle Simulation Speed"
              className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-muted text-foreground hover:bg-primary/20 transition cursor-pointer"
            >
              {simSpeed}x
            </button>
          )}

          {setOperationalTime && (
            <button
              onClick={() => setOperationalTime(480)}
              title="Reset clock to 08:00 AM"
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Network Operational Status Indicator */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shadow-xs">
          <Activity className="w-3 h-3" />
          <span>NET: 42ms</span>
        </div>

        {/* Dynamic Compliance / Conflict Button */}
        {conflictsCount > 0 ? (
          <button
            onClick={onOpenFallbackModal}
            title={`${conflictsCount} rest conflict(s) detected - Click to open 3-Tier Solver`}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition hover:bg-rose-500/25 active:scale-95 cursor-pointer shadow-xs animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>▲ {conflictsCount}</span>
          </button>
        ) : (
          <div
            title="100% Rest Compliant - Zero active violations"
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>COMPLIANT</span>
          </div>
        )}

        {/* Notifications / Activity Feed Trigger */}
        <button
          onClick={onOpenAlerts}
          className="p-2 rounded-xl bg-card hover:bg-card/90 border border-border text-foreground transition relative shadow-xs cursor-pointer active:scale-95"
          title="Open Operational Activity Stream"
        >
          <Bell className="w-4 h-4 text-foreground" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Lavender-Grey" : "Switch to Dark Lavender-Charcoal"}
          className="p-2 rounded-xl bg-card hover:bg-card/90 border border-border text-foreground transition shadow-xs cursor-pointer active:scale-95"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-1.5 p-1 rounded-xl bg-card hover:bg-card/90 border border-border transition shadow-xs cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
              D
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground mr-1" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-card border border-border shadow-2xl py-1.5 z-50 text-xs text-foreground animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-border">
                <div className="font-bold text-foreground">Chief Dispatcher</div>
                <div className="text-[10px] font-mono text-muted-foreground">Duty Shift: Morning (04:00 - 12:00)</div>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/admin/settings');
                }}
                className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center space-x-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>Dispatcher Settings</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/admin/activity');
                }}
                className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center space-x-2 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audit Activity Log</span>
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-500/15 text-rose-500 flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit to Passenger Portal</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
