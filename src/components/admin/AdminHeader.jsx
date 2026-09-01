import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Search, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Zap, 
  ExternalLink,
  ChevronRight,
  MapPin,
  ChevronDown,
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  LogOut,
  Sliders,
  FileSpreadsheet,
  PlusCircle,
  Radio,
  CheckCircle2,
  Sparkles
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
  onOpenPRDModal,
  darkMode,
  setDarkMode,
  selectedCity = 'delhi',
  onSelectCity,
  onOpenAlertCenter,
  onOpenNetworkModal,
  onOpenPlanTripModal,
  onOpenActivityLog
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Ticking seconds for live indicator
  const [secondsAgo, setSecondsAgo] = useState(2);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(prev => (prev >= 12 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Operations Date State
  const [opsDate, setOpsDate] = useState('today');
  // Shift State
  const [activeShift, setActiveShift] = useState('morning');
  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Quick Actions dropdown state
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const quickActionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setIsQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch && onOpenSearch();
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
    if (path.includes('/vehicles')) return 'Fleet & Vehicle Operations';
    if (path.includes('/management')) return 'Operations Control Room';
    return 'Live Command Center';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-card/90 backdrop-blur-md border-b border-border/70 px-6 lg:px-8 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none transition-colors">
      
      {/* Left: City Selector & Live Indicator */}
      <div className="flex items-center space-x-4 shrink-0">
        
        {/* City Selector */}
        <div className="flex items-center bg-muted/40 hover:bg-muted/70 border border-border/80 rounded-xl px-3 py-1.5 space-x-2 text-xs text-foreground transition-colors shadow-xs">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
            className="bg-transparent font-semibold text-foreground outline-none cursor-pointer text-xs pr-1"
          >
            <option value="delhi">Delhi (NCR)</option>
            <option value="chennai">Chennai (TN)</option>
          </select>
        </div>

        {/* Live Status */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold">Live System</span>
        </div>
      </div>

      {/* Center: Global Search HUD Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/80 text-xs text-muted-foreground transition-all group shadow-xs"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
            <span className="truncate">Search buses, drivers, routes, schedules...</span>
          </div>
          <div className="flex items-center space-x-1 shrink-0 font-mono text-[11px] text-muted-foreground/70">
            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">K</kbd>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 shrink-0">
        
        {/* Operational Clock & Scrubber */}
        <div className="flex items-center bg-muted/40 border border-border/80 rounded-xl px-3 py-1.5 space-x-2.5 text-xs text-foreground font-mono shadow-xs">
          <Clock className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
          <span className="font-bold tabular-nums text-sm">{formatTime(operationalTime)}</span>

          <div className="h-4 w-px bg-border/80 hidden sm:block" />

          {setIsSimulating && (
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? "Pause Simulation" : "Resume Simulation"}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
          )}

          {setSimSpeed && (
            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 5 : simSpeed === 5 ? 15 : 1)}
              title="Simulation Speed Factor"
              className="px-1.5 py-0.5 rounded text-xs font-bold bg-background border border-border text-foreground hover:bg-accent transition-colors"
            >
              {simSpeed}x
            </button>
          )}
        </div>

        {/* Alerts Trigger */}
        <button
          onClick={onOpenAlertCenter || onOpenFallbackModal}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
            conflictsCount > 0
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              : 'bg-muted/40 text-muted-foreground border-border/80 hover:text-foreground hover:bg-muted/70'
          }`}
          title="Active Operational Conflicts"
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${conflictsCount > 0 ? 'text-rose-500 animate-pulse' : 'text-muted-foreground'}`} />
          <span>{conflictsCount > 0 ? `${conflictsCount} Alerts` : '0 Alerts'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/80 text-muted-foreground hover:text-foreground transition-colors shadow-xs"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Operator Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1.5 lg:px-3 rounded-xl hover:bg-muted/70 border border-border/80 transition-colors text-xs shadow-xs"
            title="Operator Profile"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-foreground">{currentUser?.name?.split(' ')[0] || 'Operator'}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">● {currentUser?.role || 'DISPATCHER'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-card border border-border/80 rounded-2xl shadow-2xl py-2.5 z-50 font-sans text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-border/80">
                <div className="font-bold text-foreground text-sm">{currentUser?.name || 'Operator'}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{currentUser?.email || 'admin@cityflow.in'}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">● {currentUser?.designation || 'Active Duty'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{currentUser?.role || 'ADMIN'}</span>
                </div>
              </div>

              <div className="py-2 px-1">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/admin/activity'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center space-x-2.5 text-foreground transition-colors"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Activity Audit Log</span>
                </button>
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/admin/network'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center space-x-2.5 text-foreground transition-colors"
                >
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span>Network Health & Telemetry</span>
                </button>
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/admin/settings'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center space-x-2.5 text-foreground transition-colors"
                >
                  <Sliders className="w-4 h-4 text-muted-foreground" />
                  <span>System Settings</span>
                </button>
              </div>

              <div className="border-t border-border/80 pt-2 px-1">
                <button
                  onClick={() => { setIsProfileOpen(false); navigate('/'); }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted flex items-center space-x-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>Public Passenger View</span>
                </button>

                <button
                  onClick={() => { 
                    setIsProfileOpen(false); 
                    logout(); 
                    navigate('/login'); 
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center space-x-2.5 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Terminal</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
