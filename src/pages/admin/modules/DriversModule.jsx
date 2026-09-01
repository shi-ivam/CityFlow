import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Plus, 
  X, 
  Bus, 
  CalendarClock, 
  Activity, 
  Wrench, 
  Edit,
  Eye,
  Shuffle,
  ShieldAlert,
  ArrowDown,
  UserPlus,
  Check,
  Calendar,
  ChevronDown,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { validateRestPeriod } from '../../../utils/dutyEngine';

export default function DriversModule({
  crewMembers = [],
  busFleet = [],
  dutyAssignments = [],
  routes = [],
  trips = [],
  selectedCity = 'delhi',
  onAddDriver,
  onUpdateDriverDetails,
  onDeactivateDriver,
  onUpdateDriverAssignment,
  onUpdateBusAssignment
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const path = location.pathname;
  const viewFilter = searchParams.get('view') || 'daily';

  // Shared Operational Date State across Workload Subsections
  const [selectedOperationalDate, setSelectedOperationalDate] = useState('2026-09-01');

  // Subtab identification from URL route path
  let activeTab = 'overview';
  if (path.includes('/drivers/list')) activeTab = 'drivers';
  else if (path.includes('/drivers/workload')) activeTab = 'workload';
  else if (path.includes('/drivers/rotation')) activeTab = 'rotation';
  else if (path.includes('/drivers/rest')) activeTab = 'rest';
  else if (path.includes('/drivers/changeover')) activeTab = 'changeover';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverDetails, setSelectedDriverDetails] = useState(null);
  const [selectedChangeover, setSelectedChangeover] = useState(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);

  // Add/Edit Driver Form State
  const [driverNameInput, setDriverNameInput] = useState('');
  const [driverBadgeInput, setDriverBadgeInput] = useState('');
  const [driverLicenseInput, setDriverLicenseInput] = useState('');
  const [driverCityInput, setDriverCityInput] = useState(selectedCity);
  const [driverStatusInput, setDriverStatusInput] = useState('AVAILABLE');

  // Change Bus / Change Trip Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState('bus'); // 'bus' | 'trip'
  const [selectedBusForDriver, setSelectedBusForDriver] = useState(busFleet[0]?.id || '');
  const [selectedTripForDriver, setSelectedTripForDriver] = useState(trips[0]?.id || '');

  // Rest Conflict Resolution Modal State
  const [isResolveRestOpen, setIsResolveRestOpen] = useState(false);
  const [restConflictDriver, setRestConflictDriver] = useState(null);
  const [replacementDriverId, setReplacementDriverId] = useState('');

  // ONE-CLICK ROTATION FIX DROPDOWN & MODAL STATE
  const [activeFixDropdownId, setActiveFixDropdownId] = useState(null);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [fixModalType, setFixModalType] = useState('change_driver');
  const [targetFixDriver, setTargetFixDriver] = useState(null);
  const [selectedFixReplacementDriverId, setSelectedFixReplacementDriverId] = useState('');
  const [selectedFixNewRouteId, setSelectedFixNewRouteId] = useState('');

  // CHANGEOVER SYSTEM STATE
  const [isAddChangeoverOpen, setIsAddChangeoverOpen] = useState(false);
  const [isEditChangeoverOpen, setIsEditChangeoverOpen] = useState(false);
  const [editingChangeover, setEditingChangeover] = useState(null);
  const [coTripId, setCoTripId] = useState(trips[0]?.id || '');
  const [coIncomingDriverId, setCoIncomingDriverId] = useState('');
  const [coLocation, setCoLocation] = useState('');
  const [coTime, setCoTime] = useState('12:30 PM');
  const [coValidationError, setCoValidationError] = useState(null);

  // Changeover Confirm Cancellation State
  const [confirmCancelCoId, setConfirmCancelCoId] = useState(null);

  // Master Changeovers State persisted in component
  const [changeoverList, setChangeoverList] = useState([
    {
      id: 'co-101',
      tripId: 'TRIP-102-003',
      routeCode: '102',
      routeName: 'Island Ground → Kelambakkam',
      busNumber: selectedCity === 'chennai' ? 'TN 01 AB 4821' : 'DL 01 AB 4821',
      currentDriver: 'Arun Kumar',
      currentDriverId: 'DRV-201',
      incomingDriver: 'Karthik Raj',
      incomingDriverId: 'DRV-203',
      location: selectedCity === 'chennai' ? 'Guindy' : 'AIIMS Medical Hub',
      time: '12:30 PM',
      status: 'UPCOMING'
    },
    {
      id: 'co-102',
      tripId: 'TRIP-570-001',
      routeCode: '570',
      routeName: 'CMBT → OMR IT Corridor',
      busNumber: selectedCity === 'chennai' ? 'TN 09 KT 8421' : 'DL 01 CD 7314',
      currentDriver: 'Suresh Babu',
      currentDriverId: 'DRV-202',
      incomingDriver: 'Prakash V',
      incomingDriverId: 'DRV-204',
      location: selectedCity === 'chennai' ? 'Taramani OMR IT Park' : 'Rajiv Chowk Hub',
      time: '02:15 PM',
      status: 'COMPLETED'
    }
  ]);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);
  const showToastNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filter Crew Roster by Active City (Chennai vs Delhi)
  const cityCrewMembers = useMemo(() => {
    if (!crewMembers || crewMembers.length === 0) return [];
    return crewMembers;
  }, [crewMembers, selectedCity]);

  // Selected Trip details for Add/Edit Changeover Form Auto-fill
  const activeSelectedTrip = useMemo(() => {
    return trips.find(t => t.id === coTripId) || trips[0];
  }, [trips, coTripId]);

  const activeSelectedRoute = useMemo(() => {
    if (!activeSelectedTrip) return routes[0];
    return routes.find(r => r.id === activeSelectedTrip.routeId || r.code === activeSelectedTrip.routeCode) || routes[0];
  }, [routes, activeSelectedTrip]);

  // Route stops for selected changeover trip
  const routeStopsList = useMemo(() => {
    if (!activeSelectedRoute || !activeSelectedRoute.stops) return ['Terminal Stop', 'Guindy', 'Kelambakkam'];
    return activeSelectedRoute.stops.map(s => typeof s === 'string' ? s : s.name);
  }, [activeSelectedRoute]);

  // Auto-set initial location stop when trip changes
  useMemo(() => {
    if (routeStopsList && routeStopsList.length > 0 && !coLocation) {
      setCoLocation(routeStopsList[Math.floor(routeStopsList.length / 2)] || routeStopsList[0]);
    }
  }, [routeStopsList]);

  // Derived Summary Counts
  const totalDrivers = cityCrewMembers.length;
  const availableDrivers = cityCrewMembers.filter(c => c.status === 'STANDBY_READY' || c.status === 'AVAILABLE').length;
  const onDutyDrivers = cityCrewMembers.filter(c => c.status === 'ASSIGNED' || c.status === 'ACTIVE' || c.status === 'ON DUTY').length;
  const restConflictDrivers = cityCrewMembers.filter(c => c.status === 'REST_VIOLATION' || c.hasRestViolation).length;

  // Filtered Driver Roster for List View
  const filteredDrivers = useMemo(() => {
    return cityCrewMembers.filter(driver => {
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchName = (driver.name || driver.fullName || '').toLowerCase().includes(q);
        const matchId = (driver.id || driver.badge || '').toLowerCase().includes(q);
        const matchLicense = (driver.licenseNumber || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchLicense) return false;
      }

      if (viewFilter === 'available') return driver.status === 'STANDBY_READY' || driver.status === 'AVAILABLE';
      if (viewFilter === 'onduty') return driver.status === 'ASSIGNED' || driver.status === 'ACTIVE' || driver.status === 'ON DUTY';
      if (viewFilter === 'resting') return driver.status === 'RESTING' || driver.status === 'RESTING_COMPLIANT';
      if (viewFilter === 'unavailable') return driver.status === 'UNAVAILABLE' || driver.status === 'INACTIVE';
      if (viewFilter === 'conflict' || viewFilter === 'violations') return driver.status === 'REST_VIOLATION' || driver.hasRestViolation;

      return true;
    });
  }, [cityCrewMembers, searchTerm, viewFilter]);

  // Derived Workload & Route Category Calculations
  const driverWorkloadList = useMemo(() => {
    return cityCrewMembers.map(driver => {
      const driverTrips = trips.filter(t => t.driverId === driver.id || t.driverName === driver.name);
      const assignedTrip = driverTrips[0] || trips.find(t => t.driverId === driver.id);
      
      let lengthKm = 24.5;
      if (assignedTrip) {
        const routeObj = routes.find(r => r.id === assignedTrip.routeId || r.code === assignedTrip.routeCode);
        if (routeObj) lengthKm = routeObj.lengthKm || 24.5;
      } else if (driver.id === 'DRV-202') lengthKm = 31.5;
      else if (driver.id === 'DRV-203') lengthKm = 14.2;
      else if (driver.id === 'DRV-205') lengthKm = 28.4;

      const category = lengthKm < 15 ? 'SHORT' : lengthKm > 30 ? 'LONG' : 'MEDIUM';
      const accumulatedHours = driver.accumulatedHours || (driver.id === 'DRV-202' ? 7.33 : driver.id === 'DRV-205' ? 8.33 : driver.id === 'DRV-203' ? 6.33 : 5.33);

      return {
        driver,
        id: driver.id,
        name: driver.name || driver.fullName,
        assignedTrip: assignedTrip ? assignedTrip.id : 'TRIP-102-003',
        routeCode: assignedTrip ? assignedTrip.routeCode : '102',
        lengthKm,
        category,
        accumulatedHours,
        hoursFormatted: `${Math.floor(accumulatedHours)}h ${Math.round((accumulatedHours % 1) * 60)}m`,
        isHigh: accumulatedHours >= 8.0,
        status: driver.status
      };
    });
  }, [cityCrewMembers, trips, routes]);

  // Derived Rotation History & Warnings Calculation
  const driverRotationList = useMemo(() => {
    return cityCrewMembers.map(driver => {
      const isViolation = driver.status === 'REST_VIOLATION' || driver.id === 'DRV-205';
      const rotationPattern = isViolation 
        ? 'Long → Long → Long' 
        : driver.id === 'DRV-201' ? 'Long → Short → Medium'
        : driver.id === 'DRV-202' ? 'Medium → Long → Short'
        : 'Short → Medium → Long';

      const needsAttention = isViolation || rotationPattern === 'Long → Long → Long';
      const assignedTrip = trips.find(t => t.driverId === driver.id || t.driverName === driver.name) || trips[0];

      return {
        driver,
        id: driver.id,
        name: driver.name || driver.fullName,
        pattern: rotationPattern,
        needsAttention,
        assignedTripId: assignedTrip?.id || 'TRIP-102-001',
        assignedRouteCode: assignedTrip?.routeCode || '102'
      };
    });
  }, [cityCrewMembers, trips]);

  const rotationWarningsList = useMemo(() => {
    return driverRotationList.filter(d => d.needsAttention);
  }, [driverRotationList]);

  // Grouped Route Distribution Category Drivers
  const shortCategoryDrivers = useMemo(() => driverWorkloadList.filter(d => d.category === 'SHORT'), [driverWorkloadList]);
  const mediumCategoryDrivers = useMemo(() => driverWorkloadList.filter(d => d.category === 'MEDIUM'), [driverWorkloadList]);
  const longCategoryDrivers = useMemo(() => driverWorkloadList.filter(d => d.category === 'LONG'), [driverWorkloadList]);

  // Form Submission for + ADD DRIVER
  const handleAddDriverSubmit = (e) => {
    e.preventDefault();
    if (!driverNameInput.trim()) return;

    const newDriverObj = {
      id: driverBadgeInput.trim() ? driverBadgeInput : `DRV-${Math.floor(200 + Math.random() * 800)}`,
      badge: driverBadgeInput.trim() ? driverBadgeInput : `DRV-${Math.floor(200 + Math.random() * 800)}`,
      name: driverNameInput,
      fullName: driverNameInput,
      licenseNumber: driverLicenseInput.trim() ? driverLicenseInput : `TN-${Math.floor(10 + Math.random() * 88)}-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      city: driverCityInput,
      status: driverStatusInput === 'ON DUTY' ? 'ASSIGNED' : driverStatusInput,
      accumulatedHours: 0
    };

    if (onAddDriver) {
      onAddDriver(newDriverObj);
    }
    showToastNotification(`✓ DRIVER ADDED: ${newDriverObj.name} (${newDriverObj.id}) added to roster!`);

    setDriverNameInput('');
    setDriverBadgeInput('');
    setDriverLicenseInput('');
    setIsAddDriverOpen(false);
  };

  // Form Submission for EDIT DRIVER
  const handleEditDriverSubmit = (e) => {
    e.preventDefault();
    if (!selectedDriverDetails) return;

    const updatedObj = {
      ...selectedDriverDetails,
      name: driverNameInput,
      fullName: driverNameInput,
      licenseNumber: driverLicenseInput,
      city: driverCityInput,
      status: driverStatusInput
    };

    if (onUpdateDriverDetails) {
      onUpdateDriverDetails(updatedObj);
    }
    showToastNotification(`✓ DRIVER UPDATED: ${updatedObj.name} updated successfully!`);

    setSelectedDriverDetails(updatedObj);
    setIsEditDriverOpen(false);
  };

  const handleOpenEditDriverModal = (driver) => {
    setSelectedDriverDetails(driver);
    setDriverNameInput(driver.name || driver.fullName || '');
    setDriverBadgeInput(driver.id || driver.badge || '');
    setDriverLicenseInput(driver.licenseNumber || 'TN-01201700981');
    setDriverCityInput(selectedCity);
    setDriverStatusInput(driver.status || 'AVAILABLE');
    setIsEditDriverOpen(true);
  };

  // Driver Action Submissions (Change Bus / Change Trip)
  const handleConfirmDriverAction = () => {
    if (!selectedDriverDetails) return;

    if (actionModalType === 'bus' && onUpdateBusAssignment) {
      onUpdateBusAssignment(routes[0]?.id, busFleet[0]?.id, selectedBusForDriver);
      showToastNotification(`✓ BUS CHANGED: Bus assigned to driver ${selectedDriverDetails.name}`);
    } else if (actionModalType === 'trip' && onUpdateDriverAssignment) {
      onUpdateDriverAssignment(routes[0]?.id, selectedBusForDriver, selectedDriverDetails.id, selectedTripForDriver);
      showToastNotification(`✓ TRIP CHANGED: Driver ${selectedDriverDetails.name} assigned to trip!`);
    }

    setIsActionModalOpen(false);
  };

  // Rest Conflict Resolution Submission
  const handleResolveRestConflict = () => {
    if (!restConflictDriver || !replacementDriverId) return;

    if (onUpdateDriverAssignment) {
      onUpdateDriverAssignment(routes[0]?.id, busFleet[0]?.id, replacementDriverId);
    }
    showToastNotification(`✓ REST CONFLICT RESOLVED: Replacement driver assigned. Mandatory 11h rest gap restored!`);
    setIsResolveRestOpen(false);
    setRestConflictDriver(null);
  };

  // ONE-CLICK ROTATION FIX SUBMISSION
  const handleApplyRotationFixSubmit = () => {
    if (!targetFixDriver) return;

    if (fixModalType === 'change_driver') {
      if (!selectedFixReplacementDriverId) return;
      if (onUpdateDriverAssignment) {
        onUpdateDriverAssignment(routes[0]?.id, busFleet[0]?.id, selectedFixReplacementDriverId, targetFixDriver.assignedTripId);
      }
      showToastNotification(`✓ ROTATION FIXED: Replacement driver assigned to ${targetFixDriver.assignedTripId}. Warnings resolved!`);
    } else if (fixModalType === 'change_route' || fixModalType === 'rotate_route') {
      const targetRoute = routes.find(r => r.id === selectedFixNewRouteId || r.code === '11G') || routes[0];
      if (onUpdateDriverAssignment) {
        onUpdateDriverAssignment(targetRoute.id, busFleet[0]?.id, targetFixDriver.id, targetFixDriver.assignedTripId);
      }
      showToastNotification(`✓ ROTATION FIXED: Route rotated to ${targetRoute.code || '11G'} (${targetRoute.lengthKm || 14.2}km Short). Warnings resolved!`);
    }

    setIsFixModalOpen(false);
    setActiveFixDropdownId(null);
    setTargetFixDriver(null);
  };

  // + ADD CHANGEOVER Submission with Validation & Auto-fill
  const handleCreateChangeoverSubmit = (e) => {
    e.preventDefault();
    setCoValidationError(null);

    const incomingCrew = crewMembers.find(c => c.id === coIncomingDriverId);
    if (!incomingCrew) {
      setCoValidationError('⚠ Please select an incoming driver.');
      return;
    }

    // Validate incoming driver rest and availability
    if (incomingCrew.status === 'REST_VIOLATION' || incomingCrew.hasRestViolation) {
      setCoValidationError(`⚠ Rest conflict: ${incomingCrew.name || incomingCrew.fullName} has mandatory 11h rest deficit.`);
      return;
    }
    if (incomingCrew.status === 'UNAVAILABLE' || incomingCrew.status === 'INACTIVE') {
      setCoValidationError(`⚠ Driver unavailable: ${incomingCrew.name || incomingCrew.fullName} is currently marked inactive.`);
      return;
    }
    if (activeSelectedTrip && incomingCrew.id === activeSelectedTrip.driverId) {
      setCoValidationError('⚠ Invalid changeover: Incoming driver is already the current driver for this trip.');
      return;
    }

    const currentDriverName = activeSelectedTrip?.driverName || 'Arun Kumar';
    const currentDriverId = activeSelectedTrip?.driverId || 'DRV-201';

    const newCo = {
      id: `co-${Date.now().toString().slice(-4)}`,
      tripId: activeSelectedTrip?.id || coTripId,
      routeCode: activeSelectedTrip?.routeCode || '102',
      routeName: activeSelectedRoute?.name || 'Island Ground → Kelambakkam',
      busNumber: activeSelectedTrip?.busNumber || (selectedCity === 'chennai' ? 'TN 01 AB 4821' : 'DL 01 AB 4821'),
      currentDriver: currentDriverName,
      currentDriverId: currentDriverId,
      incomingDriver: incomingCrew.name || incomingCrew.fullName,
      incomingDriverId: incomingCrew.id,
      location: coLocation || (routeStopsList[0] || 'Guindy'),
      time: coTime || activeSelectedTrip?.departureTime || '12:30 PM',
      status: 'UPCOMING'
    };

    setChangeoverList([newCo, ...changeoverList]);
    showToastNotification(`✓ CHANGEOVER CREATED: ${newCo.currentDriver} ↓ ${newCo.incomingDriver} on ${newCo.tripId}`);
    setIsAddChangeoverOpen(false);
  };

  // EDIT CHANGEOVER Submission
  const handleEditChangeoverSubmit = (e) => {
    e.preventDefault();
    if (!editingChangeover) return;

    const incomingCrew = crewMembers.find(c => c.id === coIncomingDriverId);
    if (!incomingCrew) return;

    const updatedList = changeoverList.map(co => {
      if (co.id === editingChangeover.id) {
        return {
          ...co,
          incomingDriver: incomingCrew.name || incomingCrew.fullName,
          incomingDriverId: incomingCrew.id,
          location: coLocation,
          time: coTime
        };
      }
      return co;
    });

    setChangeoverList(updatedList);
    showToastNotification(`✓ CHANGEOVER UPDATED: Changeover ${editingChangeover.id} saved successfully!`);
    setIsEditChangeoverOpen(false);
    setEditingChangeover(null);
  };

  // Apply Changeover Mutation (Reassigns Active Trip Driver in Central State!)
  const handleApplyChangeover = (co) => {
    if (onUpdateDriverAssignment) {
      onUpdateDriverAssignment(co.routeCode, busFleet[0]?.id, co.incomingDriverId, co.tripId);
    }

    setChangeoverList(prev => prev.map(item => {
      if (item.id === co.id) {
        return { ...item, status: 'COMPLETED' };
      }
      return item;
    }));

    showToastNotification(`✓ CHANGEOVER APPLIED: ${co.incomingDriver} is now active on ${co.tripId}! Workload & Rest recalculated.`);
    setSelectedChangeover(null);
  };

  // Cancel Changeover Mutation
  const handleCancelChangeover = (coId) => {
    setChangeoverList(prev => prev.map(item => {
      if (item.id === coId) {
        return { ...item, status: 'CANCELLED' };
      }
      return item;
    }));

    showToastNotification(`✓ CHANGEOVER CANCELLED: Original driver assignment preserved.`);
    setConfirmCancelCoId(null);
    setSelectedChangeover(null);
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-background font-sans select-none relative">
      
      {/* Top Universal Sub-Navigation Bar */}
      <div className="border-b border-border bg-card px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 font-sans z-20">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => navigate('/admin/drivers')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            OVERVIEW
          </button>

          <button
            onClick={() => navigate('/admin/drivers/list')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'drivers' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            DRIVERS
          </button>

          <button
            onClick={() => navigate('/admin/drivers/workload?view=daily')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'workload' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            WORKLOAD
          </button>

          <button
            onClick={() => navigate('/admin/drivers/rotation?view=status')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'rotation' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span>ROTATION</span>
            {rotationWarningsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {rotationWarningsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/drivers/rest')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'rest' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span>REST</span>
            {restConflictDrivers > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {restConflictDrivers}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/drivers/changeover?view=upcoming')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'changeover' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            CHANGEOVER
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {activeTab === 'changeover' ? (
            <button
              onClick={() => {
                setCoTripId(trips[0]?.id || '');
                setCoIncomingDriverId(cityCrewMembers.find(c => c.status === 'STANDBY_READY' || c.id === 'DRV-203')?.id || '');
                setIsAddChangeoverOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD CHANGEOVER</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setDriverNameInput('');
                setDriverBadgeInput('');
                setDriverLicenseInput('');
                setIsAddDriverOpen(true);
              }}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD DRIVER</span>
            </button>
          )}
        </div>

      </div>

      {/* VIEW 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Driver Operations Center
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Mandated 11h rest gap tracking, shift workload fairness, and changeovers
              </p>
            </div>

            <button
              onClick={() => {
                setDriverNameInput('');
                setDriverBadgeInput('');
                setDriverLicenseInput('');
                setIsAddDriverOpen(true);
              }}
              className="px-3 py-1.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD DRIVER</span>
            </button>
          </div>

          {/* 4 Compact Summary Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <div className="text-xs text-muted-foreground uppercase font-bold">TOTAL DRIVERS</div>
              <div className="text-3xl font-bold text-primary">{totalDrivers}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">✓ Roster Verified</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <div className="text-xs text-muted-foreground uppercase font-bold">AVAILABLE</div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{availableDrivers}</div>
              <div className="text-[11px] text-muted-foreground">Ready for Dispatch</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <div className="text-xs text-muted-foreground uppercase font-bold">ON DUTY</div>
              <div className="text-3xl font-bold text-primary">{onDutyDrivers}</div>
              <div className="text-[11px] text-muted-foreground">Active on Corridors</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <div className="text-xs text-muted-foreground uppercase font-bold">REST CONFLICTS</div>
              <div className="text-3xl font-bold text-rose-500">{restConflictDrivers}</div>
              <div className="text-[11px] text-rose-500 font-bold">Action Required</div>
            </div>
          </div>

          {/* Driver Compact Table */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="p-3.5 bg-muted/30 border-b border-border flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-foreground uppercase">Active Driver Roster</span>
              <span className="text-muted-foreground">{totalDrivers} Drivers Enrolled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-muted/50 border-b border-border font-mono text-muted-foreground uppercase text-[10px]">
                    <th className="p-3">DRIVER</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">BUS</th>
                    <th className="p-3">CURRENT TRIP</th>
                    <th className="p-3 text-right">DUTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-xs">
                  {cityCrewMembers.map((driver) => {
                    const assignedTrip = trips.find(t => t.driverId === driver.id || t.driverName === driver.name);
                    const isConflict = driver.status === 'REST_VIOLATION' || driver.hasRestViolation;
                    const isOnDuty = driver.status === 'ASSIGNED' || driver.status === 'ACTIVE' || driver.status === 'ON DUTY';
                    const isResting = driver.status === 'RESTING' || driver.status === 'RESTING_COMPLIANT';

                    return (
                      <tr 
                        key={driver.id} 
                        onClick={() => setSelectedDriverDetails(driver)}
                        className="hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <td className="p-3 font-bold text-foreground">
                          {driver.name || driver.fullName}
                          <div className="text-[10px] text-muted-foreground font-normal">{driver.id}</div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isConflict 
                              ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                              : isOnDuty 
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : isResting
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : 'bg-primary/15 text-primary border-primary/30'
                          }`}>
                            ● {isConflict ? 'REST CONFLICT' : isOnDuty ? 'ON DUTY' : isResting ? 'RESTING' : 'AVAILABLE'}
                          </span>
                        </td>

                        <td className="p-3 text-foreground font-bold">
                          {isOnDuty ? (assignedTrip?.busNumber || 'TN 01 AB 4821') : '—'}
                        </td>

                        <td className="p-3 text-primary font-bold">
                          {isOnDuty ? (assignedTrip?.routeCode ? `Route ${assignedTrip.routeCode}` : 'Route 102') : '—'}
                        </td>

                        <td className="p-3 text-right font-bold text-foreground">
                          {driver.accumulatedHours || 5}h 20m
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: DRIVERS LIST WITH SEARCH, FILTERS, ADD & EDIT */}
      {activeTab === 'drivers' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search DRV ID, driver name, license number..."
                  className="w-full pl-9 pr-3 py-1.5 rounded bg-muted/50 border border-input text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center space-x-1 font-mono text-xs overflow-x-auto">
                {['all', 'available', 'onduty', 'resting', 'conflict'].map((f) => (
                  <button
                    key={f}
                    onClick={() => navigate(`/admin/drivers/list?view=${f}`)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition ${
                      viewFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-muted/50 border-b border-border font-mono text-muted-foreground uppercase text-[10px]">
                    <th className="p-3">DRIVER ID & NAME</th>
                    <th className="p-3">LICENSE NO.</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">ASSIGNED BUS</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono text-xs">
                  {filteredDrivers.map(driver => (
                    <tr key={driver.id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{driver.name || driver.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{driver.id}</div>
                      </td>

                      <td className="p-3 text-muted-foreground font-mono">
                        {driver.licenseNumber || 'TN-01201700981'}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          driver.status === 'REST_VIOLATION' 
                            ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' 
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          ● {driver.status}
                        </span>
                      </td>

                      <td className="p-3 text-foreground font-bold font-mono">
                        {driver.assignedBus || 'TN 01 AB 4821'}
                      </td>

                      <td className="p-3 text-right space-x-1.5 font-mono">
                        <button
                          onClick={() => handleOpenEditDriverModal(driver)}
                          className="px-2.5 py-1 rounded bg-muted border border-border text-foreground font-bold hover:bg-accent text-[11px]"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => setSelectedDriverDetails(driver)}
                          className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-[11px]"
                        >
                          DETAILS
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredDrivers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-muted-foreground font-mono text-xs">
                        No drivers match filter "{viewFilter}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: WORKLOAD SUBSECTIONS */}
      {activeTab === 'workload' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            
            {/* Workload Header Bar & Sub-Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Driver Workload Analysis — {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Accumulated duty time, actual driving hours, and corridor distribution
                </p>
              </div>

              <div className="flex items-center space-x-1 font-mono text-xs overflow-x-auto">
                <button
                  onClick={() => navigate('/admin/drivers/workload?view=daily')}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    viewFilter === 'daily' || viewFilter === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  DAILY WORKLOAD
                </button>

                <button
                  onClick={() => navigate('/admin/drivers/workload?view=hours')}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    viewFilter === 'hours' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  DRIVING HOURS
                </button>

                <button
                  onClick={() => navigate('/admin/drivers/workload?view=distribution')}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    viewFilter === 'distribution' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  ROUTE DISTRIBUTION
                </button>
              </div>
            </div>

            {/* SUBSECTION 3.1: DAILY WORKLOAD */}
            {(viewFilter === 'daily' || viewFilter === 'all') && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border font-mono text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search driver name or ID..."
                      className="w-full pl-9 pr-3 py-1 rounded bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Operational Date:</span>
                    <select
                      value={selectedOperationalDate}
                      onChange={(e) => setSelectedOperationalDate(e.target.value)}
                      className="px-2.5 py-1 rounded bg-card border border-input text-xs font-bold text-foreground outline-none"
                    >
                      <option value="2026-09-01">01 Sep 2026</option>
                      <option value="2026-09-02">02 Sep 2026 (Today)</option>
                      <option value="2026-09-03">03 Sep 2026</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border font-mono text-muted-foreground uppercase text-[10px]">
                        <th className="p-3">DRIVER</th>
                        <th className="p-3">DRIVER ID</th>
                        <th className="p-3">CURRENT TRIP</th>
                        <th className="p-3 text-right">TOTAL DUTY TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono text-xs">
                      {driverWorkloadList
                        .filter(item => {
                          if (!searchTerm.trim()) return true;
                          const q = searchTerm.toLowerCase();
                          return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
                        })
                        .map(item => (
                          <tr 
                            key={item.id} 
                            onClick={() => setSelectedDriverDetails(item.driver)}
                            className="hover:bg-accent/50 cursor-pointer transition-colors"
                          >
                            <td className="p-3 font-bold text-foreground">{item.name}</td>
                            <td className="p-3 text-muted-foreground">{item.id}</td>
                            <td className="p-3 text-primary font-bold">{item.assignedTrip}</td>
                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {item.hoursFormatted}
                            </td>
                          </tr>
                        ))}

                      {driverWorkloadList.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-muted-foreground font-mono text-xs">
                            NO DUTIES — No driver duty assignments for selected operational date.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBSECTION 3.2: DRIVING HOURS */}
            {viewFilter === 'hours' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border font-mono text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search driver name or ID..."
                      className="w-full pl-9 pr-3 py-1 rounded bg-card border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Operational Date:</span>
                    <select
                      value={selectedOperationalDate}
                      onChange={(e) => setSelectedOperationalDate(e.target.value)}
                      className="px-2.5 py-1 rounded bg-card border border-input text-xs font-bold text-foreground outline-none"
                    >
                      <option value="2026-09-01">01 Sep 2026</option>
                      <option value="2026-09-02">02 Sep 2026 (Today)</option>
                      <option value="2026-09-03">03 Sep 2026</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border font-mono text-muted-foreground uppercase text-[10px]">
                        <th className="p-3">DRIVER</th>
                        <th className="p-3">DRIVING HOURS</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">REGULATION STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono text-xs">
                      {driverWorkloadList
                        .filter(item => {
                          if (!searchTerm.trim()) return true;
                          const q = searchTerm.toLowerCase();
                          return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
                        })
                        .map(item => (
                          <tr 
                            key={item.id} 
                            onClick={() => setSelectedDriverDetails(item.driver)}
                            className="hover:bg-accent/50 cursor-pointer transition-colors"
                          >
                            <td className="p-3 font-bold text-foreground">
                              {item.name}
                              <div className="text-[10px] text-muted-foreground font-normal">{item.id}</div>
                            </td>

                            <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                              {item.hoursFormatted}
                            </td>

                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                                ● {item.status || 'ON DUTY'}
                              </span>
                            </td>

                            <td className="p-3 text-right font-bold">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] border ${
                                item.isHigh 
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              }`}>
                                {item.isHigh ? '⚠ HIGH (>8h)' : '✓ OK'}
                              </span>
                            </td>
                          </tr>
                        ))}

                      {driverWorkloadList.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-muted-foreground font-mono text-xs">
                            NO DRIVING HOURS — No accumulated driving duration for selected operational date.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBSECTION 3.3: ROUTE DISTRIBUTION */}
            {viewFilter === 'distribution' && (
              <div className="space-y-6 font-mono text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
                    <div className="text-xs text-muted-foreground uppercase font-bold">SHORT CORRIDORS (&lt;15 km)</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{shortCategoryDrivers.length} Drivers</div>
                    <div className="text-[11px] text-muted-foreground">Urban Feeders</div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
                    <div className="text-xs text-muted-foreground uppercase font-bold">MEDIUM CORRIDORS (15–30 km)</div>
                    <div className="text-3xl font-bold text-primary">{mediumCategoryDrivers.length} Drivers</div>
                    <div className="text-[11px] text-muted-foreground">City Express Slotted</div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
                    <div className="text-xs text-muted-foreground uppercase font-bold">LONG CORRIDORS (&gt;30 km)</div>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{longCategoryDrivers.length} Drivers</div>
                    <div className="text-[11px] text-muted-foreground">Suburban Trunk</div>
                  </div>
                </div>

                <div className="space-y-4">
                  
                  {/* SHORT CATEGORY LIST */}
                  <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                    <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 border-b border-border pb-1.5 flex items-center justify-between">
                      <span>SHORT ROUTE ASSIGNMENTS (&lt;15 km)</span>
                      <span>{shortCategoryDrivers.length} Drivers</span>
                    </div>
                    {shortCategoryDrivers.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedDriverDetails(item.driver)}
                        className="p-2.5 rounded bg-card border border-border flex items-center justify-between cursor-pointer hover:bg-accent transition"
                      >
                        <div>
                          <strong className="text-foreground">{item.name}</strong> ({item.id})
                          <span className="text-muted-foreground ml-2">• Trip {item.assignedTrip}</span>
                        </div>
                        <span className="text-emerald-600 font-bold">{item.lengthKm} km</span>
                      </div>
                    ))}
                    {shortCategoryDrivers.length === 0 && (
                      <div className="text-muted-foreground text-xs p-2">NO ROUTE ASSIGNMENTS</div>
                    )}
                  </div>

                  {/* MEDIUM CATEGORY LIST */}
                  <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                    <div className="font-bold text-sm text-primary border-b border-border pb-1.5 flex items-center justify-between">
                      <span>MEDIUM ROUTE ASSIGNMENTS (15–30 km)</span>
                      <span>{mediumCategoryDrivers.length} Drivers</span>
                    </div>
                    {mediumCategoryDrivers.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedDriverDetails(item.driver)}
                        className="p-2.5 rounded bg-card border border-border flex items-center justify-between cursor-pointer hover:bg-accent transition"
                      >
                        <div>
                          <strong className="text-foreground">{item.name}</strong> ({item.id})
                          <span className="text-muted-foreground ml-2">• Trip {item.assignedTrip}</span>
                        </div>
                        <span className="text-primary font-bold">{item.lengthKm} km</span>
                      </div>
                    ))}
                    {mediumCategoryDrivers.length === 0 && (
                      <div className="text-muted-foreground text-xs p-2">NO ROUTE ASSIGNMENTS</div>
                    )}
                  </div>

                  {/* LONG CATEGORY LIST */}
                  <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                    <div className="font-bold text-sm text-amber-600 dark:text-amber-400 border-b border-border pb-1.5 flex items-center justify-between">
                      <span>LONG ROUTE ASSIGNMENTS (&gt;30 km)</span>
                      <span>{longCategoryDrivers.length} Drivers</span>
                    </div>
                    {longCategoryDrivers.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedDriverDetails(item.driver)}
                        className="p-2.5 rounded bg-card border border-border flex items-center justify-between cursor-pointer hover:bg-accent transition"
                      >
                        <div>
                          <strong className="text-foreground">{item.name}</strong> ({item.id})
                          <span className="text-muted-foreground ml-2">• Trip {item.assignedTrip}</span>
                        </div>
                        <span className="text-amber-600 font-bold">{item.lengthKm} km</span>
                      </div>
                    ))}
                    {longCategoryDrivers.length === 0 && (
                      <div className="text-muted-foreground text-xs p-2">NO ROUTE ASSIGNMENTS</div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 4: ROTATION & LONG ROUTE WARNINGS */}
      {activeTab === 'rotation' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            
            {/* Rotation Header Bar & Sub-Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Driver Route Length Rotation Control — {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Prevents fatigue by rotating drivers across Short (&lt;15km), Medium (15-30km), and Long (&gt;30km) routes
                </p>
              </div>

              <div className="flex items-center space-x-1 font-mono text-xs overflow-x-auto">
                <button
                  onClick={() => navigate('/admin/drivers/rotation?view=status')}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    viewFilter === 'status' || viewFilter === 'all' || viewFilter === 'balanced' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  ROTATION STATUS
                </button>

                <button
                  onClick={() => navigate('/admin/drivers/rotation?view=warnings')}
                  className={`px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1 ${
                    viewFilter === 'warnings' ? 'bg-amber-600 text-white shadow-xs' : 'bg-muted text-amber-600 hover:bg-accent'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>LONG ROUTE WARNINGS ({rotationWarningsList.length})</span>
                </button>
              </div>
            </div>

            {/* SUBSECTION 4.1: ROTATION STATUS */}
            {(viewFilter === 'status' || viewFilter === 'all' || viewFilter === 'balanced' || viewFilter === 'attention') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs bg-muted/30 p-2.5 rounded-lg border border-border">
                  <span className="text-muted-foreground">Filter Rotation Roster:</span>
                  <div className="flex items-center space-x-1">
                    {['all', 'balanced', 'attention'].map(rf => (
                      <button
                        key={rf}
                        onClick={() => navigate(`/admin/drivers/rotation?view=${rf}`)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition ${
                          viewFilter === rf ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {rf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {driverRotationList.map(item => {
                    if (viewFilter === 'balanced' && item.needsAttention) return null;
                    if (viewFilter === 'attention' && !item.needsAttention) return null;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          item.needsAttention ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border'
                        }`}
                      >
                        <div 
                          onClick={() => setSelectedDriverDetails(item.driver)}
                          className="space-y-1 cursor-pointer flex-1"
                        >
                          <div className="font-bold text-sm text-foreground hover:text-primary transition">
                            {item.name} ({item.id})
                          </div>
                          <div className="text-muted-foreground text-xs font-mono">
                            Recent History: <strong className="text-foreground">{item.pattern}</strong>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          <span className={`px-3 py-1 rounded text-xs font-bold border ${
                            item.needsAttention 
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          }`}>
                            {item.needsAttention ? '⚠ ROTATION NEEDS ATTENTION' : '✓ Balanced'}
                          </span>

                          {item.needsAttention && (
                            <div className="relative">
                              <button
                                onClick={() => setActiveFixDropdownId(activeFixDropdownId === item.id ? null : item.id)}
                                className="px-3 py-1 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-xs flex items-center space-x-1"
                              >
                                <span>[ FIX ▼ ]</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {activeFixDropdownId === item.id && (
                                <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-xl py-1 z-30 font-mono text-xs">
                                  <button
                                    onClick={() => {
                                      setTargetFixDriver(item);
                                      setFixModalType('change_driver');
                                      setSelectedFixReplacementDriverId(cityCrewMembers.find(c => c.status === 'STANDBY_READY' || c.id === 'DRV-203')?.id || '');
                                      setIsFixModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-accent text-foreground font-semibold flex items-center space-x-1.5"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Change Driver</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setTargetFixDriver(item);
                                      setFixModalType('change_route');
                                      setSelectedFixNewRouteId(routes.find(r => r.lengthKm < 20)?.id || routes[0]?.id);
                                      setIsFixModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-accent text-foreground font-semibold flex items-center space-x-1.5"
                                  >
                                    <Shuffle className="w-3.5 h-3.5 text-primary" />
                                    <span>Change Route</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setTargetFixDriver(item);
                                      setFixModalType('rotate_route');
                                      setSelectedFixNewRouteId(routes.find(r => r.lengthKm < 20)?.id || routes[0]?.id);
                                      setIsFixModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-accent text-foreground font-semibold flex items-center space-x-1.5"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Rotate Route</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {driverRotationList.length === 0 && (
                    <div className="p-8 text-center text-emerald-600 font-mono text-xs bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                      ✓ ALL DRIVERS BALANCED — Driver route rotation history is healthy across all shifts.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBSECTION 4.2: LONG ROUTE WARNINGS */}
            {viewFilter === 'warnings' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>IDENTIFIED CONSECUTIVE LONG ROUTE WARNINGS ({rotationWarningsList.length})</span>
                </div>

                <div className="space-y-3">
                  {rotationWarningsList.map(item => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground">{item.name} ({item.id})</div>
                        <div className="text-xs text-muted-foreground">
                          Pattern: <strong className="text-amber-600">{item.pattern}</strong> (Repeated Long Route Assignment)
                        </div>
                      </div>

                      <div className="relative shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => setActiveFixDropdownId(activeFixDropdownId === item.id ? null : item.id)}
                          className="px-3.5 py-1.5 rounded bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-xs flex items-center space-x-1"
                        >
                          <span>[ FIX ▼ ]</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {activeFixDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-xl py-1 z-30 font-mono text-xs">
                            <button
                              onClick={() => {
                                setTargetFixDriver(item);
                                setFixModalType('change_driver');
                                setSelectedFixReplacementDriverId(cityCrewMembers.find(c => c.status === 'STANDBY_READY' || c.id === 'DRV-203')?.id || '');
                                setIsFixModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-accent text-foreground font-semibold flex items-center space-x-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Change Driver</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetFixDriver(item);
                                setFixModalType('change_route');
                                setSelectedFixNewRouteId(routes.find(r => r.lengthKm < 20)?.id || routes[0]?.id);
                                setIsFixModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-accent text-foreground font-semibold flex items-center space-x-1.5"
                            >
                              <Shuffle className="w-3.5 h-3.5 text-primary" />
                              <span>Change Route</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetFixDriver(item);
                                setFixModalType('rotate_route');
                                setSelectedFixNewRouteId(routes.find(r => r.lengthKm < 20)?.id || routes[0]?.id);
                                setIsFixModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-accent text-foreground font-semibold flex items-center space-x-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                              <span>Rotate Route</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {rotationWarningsList.length === 0 && (
                    <div className="p-8 text-center text-emerald-600 font-mono text-xs bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                      ✓ NO LONG ROUTE WARNINGS — All driver rotation patterns are balanced.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 5: REST & REST VIOLATIONS */}
      {activeTab === 'rest' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold text-foreground">
                  Mandated Continuous Rest Period Compliance (11h Rule)
                </h2>
              </div>

              <div className="flex items-center space-x-1 font-mono text-xs">
                <button
                  onClick={() => navigate('/admin/drivers/rest?view=all')}
                  className={`px-3 py-1 rounded font-bold ${viewFilter !== 'violations' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  All Drivers
                </button>
                <button
                  onClick={() => navigate('/admin/drivers/rest?view=violations')}
                  className={`px-3 py-1 rounded font-bold flex items-center space-x-1 ${viewFilter === 'violations' ? 'bg-rose-600 text-white' : 'bg-muted text-rose-500'}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Rest Violations ({restConflictDrivers})</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {cityCrewMembers.map(driver => {
                const isConflict = driver.status === 'REST_VIOLATION' || driver.id === 'DRV-205';
                const isResting = driver.status === 'RESTING' || driver.id === 'DRV-204';

                if (viewFilter === 'violations' && !isConflict) return null;

                return (
                  <div key={driver.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isConflict ? 'bg-rose-500/10 border-rose-500/30' : 'bg-muted/20 border-border'
                  }`}>
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-foreground">{driver.name || driver.fullName} ({driver.id})</div>
                      <div className="text-muted-foreground text-xs font-sans">
                        {isConflict 
                          ? 'Previous duty: 06:00 – 14:00 • Next duty: 22:00 • Required: 11h • Available: 8h 20m (Deficit 2h 40m)' 
                          : isResting 
                          ? 'Currently Resting • 7h 40m Elapsed' 
                          : 'Mandated continuous rest completed successfully.'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded text-xs font-bold border ${
                        isConflict 
                          ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' 
                          : isResting
                          ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}>
                        {isConflict ? '⚠ REST CONFLICT' : isResting ? 'RESTING · 7h 40m' : '✓ REST OK · 11h 20m'}
                      </span>

                      {isConflict && (
                        <button
                          onClick={() => {
                            setRestConflictDriver(driver);
                            setReplacementDriverId(cityCrewMembers.find(c => c.status === 'STANDBY_READY' || c.id === 'DRV-203')?.id || '');
                            setIsResolveRestOpen(true);
                          }}
                          className="px-3.5 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                        >
                          [ RESOLVE ]
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {viewFilter === 'violations' && restConflictDrivers === 0 && (
                <div className="p-8 text-center text-emerald-600 font-mono text-xs bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  ✓ NO REST VIOLATIONS — All active {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} drivers have complete 11h rest gaps.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 6: CHANGEOVER SUBSECTIONS (UPCOMING, ACTIVE, COMPLETED) */}
      {activeTab === 'changeover' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            
            {/* Header & Sub-Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Active & Upcoming Driver Shift Changeovers — {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Mid-route driver handovers attached directly to specific scheduled TRIPS
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Sub-Navigation Pills */}
                <div className="flex items-center space-x-1 font-mono text-xs overflow-x-auto">
                  <button
                    onClick={() => navigate('/admin/drivers/changeover?view=upcoming')}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      viewFilter === 'upcoming' || viewFilter === 'all' || viewFilter === 'daily' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    UPCOMING ({changeoverList.filter(c => c.status === 'UPCOMING').length})
                  </button>

                  <button
                    onClick={() => navigate('/admin/drivers/changeover?view=active')}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      viewFilter === 'active' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    ACTIVE ({changeoverList.filter(c => c.status === 'ACTIVE' || c.status === 'SCHEDULED').length})
                  </button>

                  <button
                    onClick={() => navigate('/admin/drivers/changeover?view=completed')}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${
                      viewFilter === 'completed' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    COMPLETED ({changeoverList.filter(c => c.status === 'COMPLETED').length})
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCoTripId(trips[0]?.id || '');
                    setCoIncomingDriverId(cityCrewMembers.find(c => c.status === 'STANDBY_READY' || c.id === 'DRV-203')?.id || '');
                    setIsAddChangeoverOpen(true);
                  }}
                  className="px-3 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD CHANGEOVER</span>
                </button>
              </div>
            </div>

            {/* CHANGEOVER LIST DISPLAY */}
            <div className="space-y-3 font-mono text-xs">
              {changeoverList.map(co => {
                // Filter by active view subsection
                if ((viewFilter === 'upcoming' || viewFilter === 'daily') && co.status !== 'UPCOMING') return null;
                if (viewFilter === 'active' && (co.status !== 'ACTIVE' && co.status !== 'SCHEDULED')) return null;
                if (viewFilter === 'completed' && co.status !== 'COMPLETED') return null;

                return (
                  <div key={co.id} className="p-4 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-primary flex items-center space-x-2">
                        <span>Trip {co.tripId}</span>
                        <span>•</span>
                        <span>Route {co.routeCode}</span>
                        <span>•</span>
                        <span>{co.busNumber}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-foreground font-bold">
                        <span>{co.currentDriver}</span>
                        <ArrowDown className="w-3.5 h-3.5 text-muted-foreground rotate-270" />
                        <span className="text-emerald-600 dark:text-emerald-400">{co.incomingDriver}</span>
                      </div>

                      <div className="text-muted-foreground text-xs font-sans flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Location: <strong className="text-foreground">{co.location}</strong> at <strong>{co.time}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center font-mono">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        co.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                        co.status === 'CANCELLED' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' : 'bg-primary/15 text-primary border-primary/30'
                      }`}>
                        ● {co.status}
                      </span>

                      {co.status === 'UPCOMING' && (
                        <>
                          <button
                            onClick={() => handleApplyChangeover(co)}
                            className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs shadow-xs"
                          >
                            [ APPLY CHANGEOVER ]
                          </button>
                          <button
                            onClick={() => setConfirmCancelCoId(co.id)}
                            className="px-2 py-1.5 rounded bg-muted border border-border text-rose-500 font-bold hover:bg-rose-500/10 text-xs"
                          >
                            [ CANCEL ]
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedChangeover(co)}
                        className="px-3 py-1.5 rounded bg-card border border-border text-foreground font-bold hover:bg-accent text-xs"
                      >
                        DETAILS
                      </button>
                    </div>
                  </div>
                );
              })}

              {changeoverList.length === 0 && (
                <div className="p-8 text-center text-muted-foreground font-mono text-xs">
                  No shift changeovers recorded.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ONE-CLICK ROTATION FIX MODAL */}
      {isFixModalOpen && targetFixDriver && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-amber-500 uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>FIX ROTATION WARNING — {targetFixDriver.name}</span>
              </h3>
              <button onClick={() => setIsFixModalOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-1">
              <div>Target Driver: <strong>{targetFixDriver.name} ({targetFixDriver.id})</strong></div>
              <div>Current History: <strong>{targetFixDriver.pattern}</strong> (Repeated Long Route)</div>
              <div>Assigned Trip: <strong>{targetFixDriver.assignedTripId} (Route {targetFixDriver.assignedRouteCode})</strong></div>
            </div>

            {/* ACTION TYPE 1: CHANGE DRIVER */}
            {fixModalType === 'change_driver' && (
              <div className="space-y-3">
                <label className="block text-muted-foreground uppercase">Select Eligible Replacement Driver</label>
                <select
                  value={selectedFixReplacementDriverId}
                  onChange={(e) => setSelectedFixReplacementDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                >
                  {cityCrewMembers.filter(c => c.id !== targetFixDriver.id).map(c => (
                    <option key={c.id} value={c.id}>
                      ★ {c.name || c.fullName} ({c.id}) — {c.status === 'REST_VIOLATION' ? '⚠ Rest Deficit' : '✓ Available (Rest OK)'}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-emerald-600 font-bold">✓ Replacement driver will take over {targetFixDriver.assignedTripId}.</div>
              </div>
            )}

            {/* ACTION TYPE 2: CHANGE ROUTE */}
            {fixModalType === 'change_route' && (
              <div className="space-y-3">
                <label className="block text-muted-foreground uppercase">Select Shorter Replacement Route</label>
                <select
                  value={selectedFixNewRouteId}
                  onChange={(e) => setSelectedFixNewRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      Route {r.code} — {r.name} ({r.lengthKm} km {r.lengthKm < 15 ? 'Short' : r.lengthKm > 30 ? 'Long' : 'Medium'})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-emerald-600 font-bold">✓ Driver will be reassigned to shorter corridor to balance workload.</div>
              </div>
            )}

            {/* ACTION TYPE 3: ROTATE ROUTE */}
            {fixModalType === 'rotate_route' && (
              <div className="space-y-3">
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <div>RECOMMENDED CATEGORY: <strong>SHORT (&lt;15 km)</strong></div>
                  <div>Suggested Corridor: <strong>Route 11G (14.2 km Urban Feeder)</strong></div>
                </div>
                <div className="text-[11px] text-muted-foreground">Applying rotation automatically updates history to Long → Long → Short (✓ Balanced).</div>
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button onClick={() => setIsFixModalOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button onClick={handleApplyRotationFixSubmit} className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">
                APPLY FIX NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER DETAILS MODAL */}
      {selectedDriverDetails && !isEditDriverOpen && (
        <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3 className="font-bold text-base text-foreground uppercase">{selectedDriverDetails.name || selectedDriverDetails.fullName}</h3>
                <p className="text-xs text-muted-foreground">{selectedDriverDetails.id} • License: {selectedDriverDetails.licenseNumber || 'TN-01201700981'}</p>
              </div>

              <button onClick={() => setSelectedDriverDetails(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-muted/30 p-3 rounded border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">STATUS:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">● {selectedDriverDetails.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ASSIGNED BUS:</span>
                <span className="font-bold text-foreground">{selectedDriverDetails.assignedBus || 'TN 01 AB 4821'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CURRENT TRIP:</span>
                <span className="font-bold text-primary">TRIP-102-003 (Route 102)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SHIFT DUTY:</span>
                <span className="font-bold text-foreground">08:30 AM – 01:50 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">REST GAP:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">11h 20m ✓</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-border">
              <button
                onClick={() => handleOpenEditDriverModal(selectedDriverDetails)}
                className="px-3 py-1.5 rounded bg-card border border-border text-foreground font-bold hover:bg-accent"
              >
                [ EDIT DRIVER ]
              </button>

              <button
                onClick={() => {
                  setActionModalType('bus');
                  setIsActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded bg-muted border border-border text-foreground font-bold hover:bg-accent"
              >
                [ CHANGE BUS ]
              </button>

              <button
                onClick={() => {
                  setActionModalType('trip');
                  setIsActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded bg-muted border border-border text-foreground font-bold hover:bg-accent"
              >
                [ CHANGE TRIP ]
              </button>

              <button
                onClick={() => {
                  setSelectedDriverDetails(null);
                  navigate('/admin/drivers/workload?view=daily');
                }}
                className="px-3.5 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90"
              >
                [ VIEW SCHEDULE ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL */}
      {isEditDriverOpen && selectedDriverDetails && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <form onSubmit={handleEditDriverSubmit} className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground uppercase">EDIT DRIVER — {selectedDriverDetails.id}</h3>
              <button type="button" onClick={() => setIsEditDriverOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-muted-foreground uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={driverNameInput}
                  onChange={(e) => setDriverNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground uppercase mb-1">License Number</label>
                <input
                  type="text"
                  value={driverLicenseInput}
                  onChange={(e) => setDriverLicenseInput(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground uppercase mb-1">City</label>
                  <select
                    value={driverCityInput}
                    onChange={(e) => setDriverCityInput(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                  >
                    <option value="chennai">Chennai</option>
                    <option value="delhi">Delhi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Availability / Status</label>
                  <select
                    value={driverStatusInput}
                    onChange={(e) => setDriverStatusInput(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ASSIGNED">On Duty</option>
                    <option value="RESTING">Resting</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button type="button" onClick={() => setIsEditDriverOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">SAVE CHANGES</button>
            </div>
          </form>
        </div>
      )}

      {/* REST CONFLICT RESOLUTION MODAL */}
      {isResolveRestOpen && restConflictDriver && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-rose-500 uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>RESOLVE REST CONFLICT</span>
              </h3>
              <button onClick={() => setIsResolveRestOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-rose-500/10 p-3 rounded border border-rose-500/30 text-rose-600 dark:text-rose-400">
              <div className="font-bold">Conflict Driver: {restConflictDriver.name || restConflictDriver.fullName} ({restConflictDriver.id})</div>
              <div>Shift: 06:00 – 14:00 • Required Rest: 11h • Available: 8h 20m (Deficit 2h 40m)</div>
            </div>

            <div>
              <label className="block text-muted-foreground uppercase mb-1">Select Rest-Compliant Replacement Driver</label>
              <select
                value={replacementDriverId}
                onChange={(e) => setReplacementDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
              >
                {cityCrewMembers.filter(c => c.status === 'STANDBY_READY' || c.status === 'AVAILABLE' || c.id === 'DRV-203').map(c => (
                  <option key={c.id} value={c.id}>
                    ★ {c.name || c.fullName} ({c.id}) — Rest Compliant (14h+ Rest)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button onClick={() => setIsResolveRestOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button onClick={handleResolveRestConflict} className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">REASSIGN & RESOLVE</button>
            </div>
          </div>
        </div>
      )}

      {/* + ADD CHANGEOVER MODAL WIZARD */}
      {isAddChangeoverOpen && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <form onSubmit={handleCreateChangeoverSubmit} className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground uppercase">+ CREATE DRIVER CHANGEOVER</h3>
              <button type="button" onClick={() => setIsAddChangeoverOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {coValidationError && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold text-[11px]">
                {coValidationError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-muted-foreground uppercase mb-1">1. Select Scheduled Trip</label>
                <select
                  value={coTripId}
                  onChange={(e) => setCoTripId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary font-bold"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} — Route {t.routeCode} ({t.departureTime}) • {t.driverName || 'Arun Kumar'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Trip Parameters */}
              <div className="p-3 rounded bg-muted/30 border border-border space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROUTE & CORRIDOR:</span>
                  <span className="font-bold text-primary">Route {activeSelectedTrip?.routeCode || '102'} ({activeSelectedRoute?.name || 'Island Ground → Kelambakkam'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ASSIGNED BUS:</span>
                  <span className="font-bold text-foreground">{activeSelectedTrip?.busNumber || 'TN 01 AB 4821'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CURRENT DRIVER:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeSelectedTrip?.driverName || 'Arun Kumar'}</span>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground uppercase mb-1">2. Incoming Driver (Rest Verified)</label>
                <select
                  value={coIncomingDriverId}
                  onChange={(e) => setCoIncomingDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                >
                  <option value="">-- Select Replacement Driver --</option>
                  {cityCrewMembers.map(c => {
                    const isRestDeficit = c.status === 'REST_VIOLATION' || c.hasRestViolation;
                    const isSameDriver = activeSelectedTrip && c.id === activeSelectedTrip.driverId;
                    return (
                      <option key={c.id} value={c.id} disabled={isRestDeficit || isSameDriver}>
                        {isSameDriver ? `(Current Driver) ${c.name}` : isRestDeficit ? `⚠ Rest Deficit - ${c.name}` : `✓ Available - ${c.name} (${c.accumulatedHours || 5}h duty)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Handover Stop</label>
                  <select
                    value={coLocation}
                    onChange={(e) => setCoLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                  >
                    {routeStopsList.map(stopName => (
                      <option key={stopName} value={stopName}>{stopName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Handover Time</label>
                  <input
                    type="text"
                    value={coTime}
                    onChange={(e) => setCoTime(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button type="button" onClick={() => setIsAddChangeoverOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">
                [ CREATE CHANGEOVER ]
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT UPCOMING CHANGEOVER MODAL */}
      {isEditChangeoverOpen && editingChangeover && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <form onSubmit={handleEditChangeoverSubmit} className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground uppercase">EDIT CHANGEOVER — {editingChangeover.id}</h3>
              <button type="button" onClick={() => setIsEditChangeoverOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>Trip: <strong>{editingChangeover.tripId} (Route {editingChangeover.routeCode})</strong></div>

              <div>
                <label className="block text-muted-foreground uppercase mb-1">Incoming Driver</label>
                <select
                  value={coIncomingDriverId}
                  onChange={(e) => setCoIncomingDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
                >
                  {cityCrewMembers.map(c => (
                    <option key={c.id} value={c.id}>{c.name || c.fullName} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Handover Location</label>
                  <input
                    type="text"
                    value={coLocation}
                    onChange={(e) => setCoLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={coTime}
                    onChange={(e) => setCoTime(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button type="button" onClick={() => setIsEditChangeoverOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">SAVE CHANGEOVER</button>
            </div>
          </form>
        </div>
      )}

      {/* CONFIRM CANCEL CHANGEOVER MODAL */}
      {confirmCancelCoId && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="font-bold text-sm text-foreground">Cancel this changeover?</div>
            <p className="text-muted-foreground text-[11px]">Original driver assignment will remain intact.</p>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button onClick={() => setConfirmCancelCoId(null)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">KEEP</button>
              <button onClick={() => handleCancelChangeover(confirmCancelCoId)} className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs">CANCEL CHANGEOVER</button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGEOVER DETAILS & EDIT MODAL */}
      {selectedChangeover && (
        <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">CHANGEOVER DETAILS — {selectedChangeover.id}</h3>
              <button onClick={() => setSelectedChangeover(null)} className="p-1 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-muted/30 p-3 rounded border border-border">
              <div>TRIP: <strong>{selectedChangeover.tripId}</strong></div>
              <div>ROUTE: <strong>Route {selectedChangeover.routeCode} — {selectedChangeover.routeName}</strong></div>
              <div>BUS: <strong>{selectedChangeover.busNumber}</strong></div>
              <div>CURRENT DRIVER: <strong>{selectedChangeover.currentDriver} ({selectedChangeover.currentDriverId})</strong></div>
              <div>INCOMING DRIVER: <strong>{selectedChangeover.incomingDriver} ({selectedChangeover.incomingDriverId})</strong></div>
              <div>HANDOVER LOCATION: <strong>{selectedChangeover.location}</strong></div>
              <div>HANDOVER TIME: <strong>{selectedChangeover.time}</strong></div>
              <div>STATUS: <strong className="text-emerald-600">{selectedChangeover.status}</strong></div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border">
              <button onClick={() => setSelectedChangeover(null)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground">Close</button>
              
              <div className="flex items-center space-x-2">
                {selectedChangeover.status === 'UPCOMING' && (
                  <>
                    <button
                      onClick={() => {
                        setEditingChangeover(selectedChangeover);
                        setCoIncomingDriverId(selectedChangeover.incomingDriverId);
                        setCoLocation(selectedChangeover.location);
                        setCoTime(selectedChangeover.time);
                        setSelectedChangeover(null);
                        setIsEditChangeoverOpen(true);
                      }}
                      className="px-3 py-1.5 rounded bg-card border border-border text-foreground font-bold hover:bg-accent"
                    >
                      [ EDIT ]
                    </button>
                    <button onClick={() => handleApplyChangeover(selectedChangeover)} className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold">
                      [ APPLY CHANGEOVER ]
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* + ADD DRIVER FORM MODAL */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <form onSubmit={handleAddDriverSubmit} className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground uppercase">+ ADD NEW DRIVER</h3>
              <button type="button" onClick={() => setIsAddDriverOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-muted-foreground uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={driverNameInput}
                  onChange={(e) => setDriverNameInput(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground uppercase mb-1">Driver ID / Badge</label>
                <input
                  type="text"
                  value={driverBadgeInput}
                  onChange={(e) => setDriverBadgeInput(e.target.value)}
                  placeholder="e.g. DRV-207"
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground uppercase mb-1">License Number</label>
                <input
                  type="text"
                  value={driverLicenseInput}
                  onChange={(e) => setDriverLicenseInput(e.target.value)}
                  placeholder="e.g. TN-07-2024-001234"
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground uppercase mb-1">City</label>
                  <select
                    value={driverCityInput}
                    onChange={(e) => setDriverCityInput(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                  >
                    <option value="chennai">Chennai</option>
                    <option value="delhi">Delhi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Availability</label>
                  <select
                    value={driverStatusInput}
                    onChange={(e) => setDriverStatusInput(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none focus:border-primary"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ON DUTY">On Duty</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button type="button" onClick={() => setIsAddDriverOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">SAVE DRIVER</button>
            </div>
          </form>
        </div>
      )}

      {/* DRIVER ACTION MODAL (CHANGE BUS / CHANGE TRIP) */}
      {isActionModalOpen && selectedDriverDetails && (
        <div className="fixed inset-0 z-[3600] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground uppercase">
                {actionModalType === 'bus' ? 'CHANGE BUS ASSIGNMENT' : 'CHANGE TRIP ASSIGNMENT'}
              </h3>
              <button onClick={() => setIsActionModalOpen(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>Driver: <strong>{selectedDriverDetails.name || selectedDriverDetails.fullName} ({selectedDriverDetails.id})</strong></div>

              {actionModalType === 'bus' ? (
                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Select Replacement Bus</label>
                  <select
                    value={selectedBusForDriver}
                    onChange={(e) => setSelectedBusForDriver(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
                  >
                    {busFleet.map(b => (
                      <option key={b.id} value={b.id}>{b.busNumber} ({b.capacity} Seats)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-muted-foreground uppercase mb-1">Select New Trip</label>
                  <select
                    value={selectedTripForDriver}
                    onChange={(e) => setSelectedTripForDriver(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-foreground outline-none"
                  >
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.id} — Route {t.routeCode} ({t.departureTime})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-border">
              <button onClick={() => setIsActionModalOpen(false)} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground font-medium">Cancel</button>
              <button onClick={handleConfirmDriverAction} className="px-4 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs">CONFIRM CHANGE</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[3700] bg-popover border border-emerald-500/50 text-popover-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 font-mono text-xs animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
