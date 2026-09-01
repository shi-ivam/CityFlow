/**
 * Master Seed Data Generator for CityFlow
 * Generates production-scale datasets with 55 drivers, 32 buses, 22 routes, and 120 duties.
 */

export const SEED_USERS = [
  {
    id: 'usr-admin-01',
    email: 'admin@cityflow.in',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Aditya Sen',
    designation: 'Operations Lead & Director',
    department: 'Urban Transit Authority',
    badge: 'DIR-001'
  },
  {
    id: 'usr-dispatch-01',
    email: 'dispatcher@cityflow.in',
    username: 'dispatcher',
    password: 'dispatch123',
    role: 'DISPATCHER',
    name: 'Priya Sharma',
    designation: 'Lead Corridor Dispatcher',
    department: 'Control Room Terminal #04',
    badge: 'DISP-104'
  },
  {
    id: 'usr-operator-01',
    email: 'operator@cityflow.in',
    username: 'operator',
    password: 'operator123',
    role: 'OPERATOR',
    name: 'Rohan Verma',
    designation: 'Line Controller & Telemetry Specialist',
    department: 'Live Operations Center',
    badge: 'OPS-212'
  },
  {
    id: 'usr-viewer-01',
    email: 'viewer@cityflow.in',
    username: 'viewer',
    password: 'viewer123',
    role: 'VIEWER',
    name: 'Ananya Iyer',
    designation: 'Safety & Compliance Auditor',
    department: 'Regulatory Compliance Bureau',
    badge: 'AUD-009'
  }
];

export const DEFAULT_SYSTEM_SETTINGS = {
  city: 'delhi',
  minRestHours: 11,
  maxDutyHours: 9,
  handoffBufferMins: 15,
  maxSpeedLimitKmH: 60,
  headwayToleranceMins: 3,
  simulationMode: true,
  simulationSpeed: 1,
  theme: 'system',
  notificationsEnabled: true
};

const INDIAN_MALE_NAMES = [
  'Rajesh Kumar', 'Amit Sharma', 'Vikram Singh', 'Sanjay Verma', 'Manjeet Singh',
  'Harpreet Singh', 'Suresh Yadav', 'Manoj Tiwari', 'Sunil Rathore', 'Deepak Chauhan',
  'Anil Meena', 'Rakesh Gujjar', 'Praveen Tomar', 'Santosh Pandey', 'Dharmendra Yadav',
  'Kuldeep Negi', 'Satish Chandra', 'Ajay Pal', 'Bhupender Rawat', 'Mahesh Mishra',
  'Pankaj Joshi', 'Ashok Tanwar', 'Vinod Bhati', 'Joginder Kadian', 'Balwan Singh',
  'Surinder Paul', 'Naresh Khatri', 'Devinder Gill', 'Jasbir Sandhu', 'Ravinder Malik',
  'Mukesh Aggarwal', 'Mohinder Rana', 'Arun Saxena', 'Karan Sisodia', 'Hemant Goswami',
  'Girish Dubey', 'Trilok Chand', 'Ramesh Chand', 'Gopal Krishnan', 'Virender Sehwag',
  'Sachin Tyagi', 'Nitin Bharadwaj', 'Kamal Nayan', 'Subhash Yadav', 'Om Prakash',
  'Jitender Mann', 'Jagdish Pradhan', 'Lalit Mohan', 'Rohitashwa Gaur', 'Brij Bhushan',
  'Chander Prakash', 'Dayanand Saraswat', 'Eshwar Dayal', 'Fateh Singh', 'Gagan Deep'
];

export function generateCitySeedData(cityId = 'delhi') {
  if (cityId === 'chennai') return generateChennaiData();
  if (cityId === 'bangalore') return generateBangaloreData();
  return generateDelhiData();
}

function generateDelhiData() {
  // 1. Hubs
  const hubs = [
    {
      id: 'hub-kg',
      name: 'Kashmere Gate ISBT Hub',
      code: 'KG-ISBT',
      coordinates: [77.2285, 28.6672],
      description: 'North Delhi multimodal interstate terminal with 12 bay platforms & crew rest lounge',
      bayCount: 12,
      activeTransfers: 6
    },
    {
      id: 'hub-av',
      name: 'Anand Vihar ISBT Terminal',
      code: 'AV-ISBT',
      coordinates: [77.3150, 28.6469],
      description: 'East Delhi intermodal transit terminal with metro & rail connectivity',
      bayCount: 10,
      activeTransfers: 4
    },
    {
      id: 'hub-rc',
      name: 'Rajiv Chowk Interchange',
      code: 'RC-HUB',
      coordinates: [77.2183, 28.6328],
      description: 'Central Connaught Place high-capacity junction with subterranean pedestrian links',
      bayCount: 8,
      activeTransfers: 5
    },
    {
      id: 'hub-gur',
      name: 'Gurugram IFFCO Chowk Terminal',
      code: 'IFFCO-HUB',
      coordinates: [77.0725, 28.4715],
      description: 'NCR expressway southern gateway terminal with EV charging infrastructure',
      bayCount: 8,
      activeTransfers: 3
    }
  ];

  // 2. Routes (22 Corridors)
  const routeDefinitions = [
    { code: '534', name: 'Kashmere Gate → AIIMS → Saket Express', len: 24.5, freq: 8, color: '#2563eb' },
    { code: '725', name: 'Anand Vihar ISBT → Dhaula Kuan → Dwarka Sec 21', len: 32.8, freq: 10, color: '#10b981' },
    { code: '419', name: 'Old Delhi Railway Station → Ambedkar Nagar', len: 21.0, freq: 12, color: '#f59e0b' },
    { code: '544', name: 'Badarpur Border → Nehru Place → R.K. Puram', len: 26.2, freq: 9, color: '#8b5cf6' },
    { code: '260', name: 'Kashmere Gate → Connaught Place → Kendriya Terminal', len: 15.4, freq: 7, color: '#ec4899' },
    { code: '391', name: 'Kalyanpuri → ITO → Central Secretariat', len: 18.6, freq: 10, color: '#06b6d4' },
    { code: '108', name: 'Nehru Vihar → Azadpur → Hari Nagar Depot', len: 28.3, freq: 12, color: '#84cc16' },
    { code: '429', name: 'Kashmere Gate → Lajpat Nagar → DDA Flats Kalkaji', len: 23.1, freq: 10, color: '#3b82f6' },
    { code: '620', name: 'Shivaji Stadium → Vasant Kunj Sector C', len: 19.5, freq: 11, color: '#6366f1' },
    { code: '781', name: 'New Delhi Railway Station → Najafgarh Terminal', len: 35.0, freq: 14, color: '#14b8a6' },
    { code: '801', name: 'Inderlok Metro → Janakpuri West B-Block', len: 16.8, freq: 8, color: '#f97316' },
    { code: '901', name: 'Mangolpuri Q-Block → Kamla Market', len: 22.4, freq: 10, color: '#eab308' },
    { code: '181', name: 'Nizamuddin Railway Station → Jahangirpuri', len: 27.0, freq: 12, color: '#a855f7' },
    { code: '405', name: 'Mori Gate Terminal → Badarpur Border', len: 29.5, freq: 11, color: '#ef4444' },
    { code: '522', name: 'Lado Sarai Firni → Sarojini Nagar Depot', len: 14.2, freq: 9, color: '#10b981' },
    { code: '615', name: 'Minto Road → JNU Old Campus', len: 18.0, freq: 10, color: '#0284c7' },
    { code: '711', name: 'Sarojini Nagar → Uttam Nagar Terminal', len: 22.8, freq: 12, color: '#d97706' },
    { code: '764', name: 'Nehru Place Terminal → Najafgarh Terminal', len: 34.2, freq: 15, color: '#7c3aed' },
    { code: '825', name: 'Tilak Nagar → Dichaon Kalan Depot', len: 20.1, freq: 10, color: '#db2777' },
    { code: '930', name: 'Nehru Place → Sultanpuri Terminal', len: 31.5, freq: 13, color: '#059669' },
    { code: '970', name: 'Jawaharlal Nehru Stadium → Rohini Sector 22', len: 33.0, freq: 12, color: '#2563eb' },
    { code: 'EXP-JP', name: 'Delhi ISBT → Kotputli → Jaipur Express (Interstate)', len: 280.0, freq: 60, color: '#dc2626' }
  ];

  const routes = routeDefinitions.map((def, idx) => {
    const latBase = 28.52 + (idx % 8) * 0.02;
    const lngBase = 77.15 + (idx % 6) * 0.03;
    return {
      id: `route-${def.code.toLowerCase()}`,
      code: def.code,
      name: def.name,
      origin: def.name.split('→')[0].trim(),
      destination: def.name.split('→')[def.name.split('→').length - 1].trim(),
      color: def.color,
      lengthKm: def.len,
      frequencyMins: def.freq,
      operatingHours: '05:00 - 23:30 IST',
      bufferMeters: 50,
      status: 'ACTIVE',
      city: 'delhi',
      stops: [
        { name: def.name.split('→')[0].trim(), coordinates: [lngBase, latBase] },
        { name: 'Rajiv Chowk Metro Junction', coordinates: [77.2183, 28.6328] },
        { name: 'AIIMS Ring Road Interchange', coordinates: [77.2090, 28.5672] },
        { name: def.name.split('→')[def.name.split('→').length - 1].trim(), coordinates: [lngBase + 0.05, latBase + 0.06] }
      ],
      pathCoordinates: [
        [lngBase, latBase],
        [lngBase + 0.015, latBase + 0.02],
        [77.2183, 28.6328],
        [77.2090, 28.5672],
        [lngBase + 0.035, latBase + 0.045],
        [lngBase + 0.05, latBase + 0.06]
      ]
    };
  });

  // 3. Buses (32 Units)
  const busModels = [
    'Tata Starbus EV 12m Ultra', 'Ashok Leyland Circuit-F Electric',
    'Olectra K9 Pure Electric AC', 'DTC Low-Floor Green CNG 12m'
  ];

  const buses = Array.from({ length: 32 }, (_, i) => {
    const num = 4800 + i;
    const isElectric = i % 3 !== 0;
    const assignedRoute = routes[i % routes.length];
    const status = i === 11 ? 'MAINTENANCE' : (i % 6 === 4 ? 'STANDBY_READY' : 'IN_SERVICE');
    return {
      id: `bus-del-${100 + i}`,
      busNumber: `DL 1PC ${num}`,
      registrationNumber: `DL 1PC ${num}`,
      model: busModels[i % busModels.length],
      type: isElectric ? 'ELECTRIC' : 'CNG',
      capacity: isElectric ? 50 : 54,
      batteryPct: isElectric ? Math.round(45 + Math.random() * 50) : 100,
      status,
      assignedRoute: status === 'IN_SERVICE' ? assignedRoute.code : null,
      assignedRouteId: status === 'IN_SERVICE' ? assignedRoute.id : null,
      depot: i % 2 === 0 ? 'Kashmere Gate Depot #1' : 'BBM Central Workshop Depot #3',
      odometerKm: Math.round(18000 + i * 3420),
      lastServiceDate: '2026-08-14',
      nextServiceDue: i === 11 ? '2026-09-02 (Overdue Inspection)' : '2026-09-28',
      city: 'delhi'
    };
  });

  // 4. Drivers (55 Crew Members)
  const drivers = Array.from({ length: 55 }, (_, i) => {
    const name = INDIAN_MALE_NAMES[i % INDIAN_MALE_NAMES.length];
    const isRestViolation = (i === 1 || i === 7 || i === 14);
    const lastShiftEnd = isRestViolation
      ? new Date(Date.now() - 5.5 * 3600 * 1000).toISOString()
      : new Date(Date.now() - 13.5 * 3600 * 1000).toISOString();

    const isStandby = (i >= 42 && i <= 50);
    let status = 'ASSIGNED';
    if (isStandby) status = 'STANDBY_READY';
    else if (i > 50) status = 'RESTING_COMPLIANT';
    else if (isRestViolation) status = 'ASSIGNED';

    const assignedRoute = routes[i % routes.length];
    const assignedBus = buses[i % buses.length];

    return {
      id: `DRV-${1001 + i}`,
      name,
      fullName: name,
      licenseNumber: `DL-04${1990 + (i % 25)}${String(100000 + i * 31).slice(0, 6)}`,
      badgeNumber: `DTC-B${3000 + i}`,
      badge: `DRV-${1001 + i}`,
      phone: `+91 98${String(10000000 + i * 1147).slice(0, 8)}`,
      experienceYears: 4 + (i % 18),
      accumulatedHours: 5 + (i % 4),
      lastShiftEnd,
      status,
      isStandby,
      complianceScore: isRestViolation ? 74 : (94 + (i % 6)),
      assignedRouteId: status === 'ASSIGNED' ? assignedRoute.id : null,
      assignedRouteCode: status === 'ASSIGNED' ? assignedRoute.code : null,
      assignedBusId: status === 'ASSIGNED' ? assignedBus.id : null,
      assignedBusNumber: status === 'ASSIGNED' ? assignedBus.busNumber : null,
      city: 'delhi',
      qualification: ['ELECTRIC_HEAVY', 'CNG_LOW_FLOOR', 'CORRIDOR_EXPRESS']
    };
  });

  // 5. Duties (120 Shifts across Delhi)
  const duties = Array.from({ length: 120 }, (_, i) => {
    const route = routes[i % routes.length];
    const bus = buses[i % buses.length];
    const driver = drivers[i % drivers.length];
    const isUnlinked = (i % 4 === 0);
    const shiftType = i % 3 === 0 ? 'MORNING' : (i % 3 === 1 ? 'AFTERNOON' : 'NIGHT');

    const startH = shiftType === 'MORNING' ? 5 + (i % 3) : (shiftType === 'AFTERNOON' ? 13 + (i % 2) : 21);
    const endH = startH + 8;
    const startTime = new Date(Date.UTC(2026, 8, 2, startH, (i % 4) * 15)).toISOString();
    const endTime = new Date(Date.UTC(2026, 8, 2, endH, (i % 4) * 15)).toISOString();

    const isConflict = (driver.id === 'DRV-1002' || driver.id === 'DRV-1008');

    return {
      id: `duty-del-${1000 + i}`,
      dutyCode: `DUTY-${route.code}-${shiftType.slice(0, 1)}${(i % 5) + 1}`,
      routeId: route.id,
      routeCode: route.code,
      busId: bus.id,
      busNumber: bus.busNumber,
      crewId: driver.id,
      crewName: driver.fullName,
      shift: shiftType,
      startTime,
      endTime,
      dutyType: isUnlinked ? 'UNLINKED' : 'LINKED',
      handoffHub: isUnlinked ? 'Kashmere Gate ISBT Hub' : null,
      handoffBufferMinutes: isUnlinked ? 15 : null,
      status: isConflict ? 'CONFLICT' : (i % 8 === 0 ? 'RUNNING' : 'ACTIVE_SCHEDULED'),
      notes: isUnlinked ? 'Transfer handoff scheduled at interchange bay #04' : 'Direct full-corridor duty',
      city: 'delhi'
    };
  });

  // 6. Scheduled Trips (150 Departures)
  const trips = Array.from({ length: 150 }, (_, i) => {
    const route = routes[i % routes.length];
    const bus = buses[i % buses.length];
    const driver = drivers[i % drivers.length];
    const hour = 5 + Math.floor(i / 8);
    const min = (i % 4) * 15;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const depTime = `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;

    const status = i < 18 ? 'RUNNING' : (i > 130 ? 'COMPLETED' : 'SCHEDULED');
    const stop1 = route.stops[0]?.name || 'Origin Terminal';
    const stop2 = route.stops[1]?.name || 'Interchange Hub';
    const stopEnd = route.stops[route.stops.length - 1]?.name || 'Destination Terminal';

    return {
      id: `TRIP-${route.code}-${String(100 + i).slice(-3)}`,
      routeId: route.id,
      routeCode: route.code,
      departureTime: depTime,
      busId: bus.id,
      busNumber: bus.busNumber,
      driverId: driver.id,
      driverName: driver.fullName,
      status,
      currentStop: status === 'RUNNING' ? stop2 : stop1,
      nextStop: status === 'RUNNING' ? stopEnd : stop2,
      etaMins: 4 + (i % 11),
      occupancyRatio: `${32 + (i % 16)} / 50`,
      city: 'delhi'
    };
  });

  // 7. Active Conflicts
  const conflicts = [
    {
      id: 'conf-del-01',
      severity: 'CRITICAL',
      type: 'REST_PERIOD_VIOLATION',
      title: 'Mandated 11h Rest Interval Violation',
      description: 'Driver Amit Sharma (DRV-1002) has only 5h 20m rest prior to Route 534 duty.',
      affectedDutyId: 'duty-del-1001',
      affectedDriverId: 'DRV-1002',
      affectedBusId: 'bus-del-101',
      status: 'OPEN',
      suggestedResolution: 'Auto-assign qualified standby driver Manjeet Singh (DRV-1043) with 14h rest.',
      createdAt: '2026-09-01T20:30:00.000Z',
      city: 'delhi'
    },
    {
      id: 'conf-del-02',
      severity: 'HIGH',
      type: 'HEADWAY_COLLISION',
      title: 'Headway Bunched Departure on Corridor 725',
      description: 'Trips TRIP-725-001 and TRIP-725-002 scheduled with only 2 min gap at Anand Vihar.',
      affectedDutyId: 'duty-del-1004',
      affectedDriverId: 'DRV-1004',
      affectedBusId: 'bus-del-103',
      status: 'OPEN',
      suggestedResolution: 'Stagger departure by +6 mins to restore nominal headway.',
      createdAt: '2026-09-01T21:15:00.000Z',
      city: 'delhi'
    },
    {
      id: 'conf-del-03',
      severity: 'MEDIUM',
      type: 'MAINTENANCE_DUE',
      title: 'EV Battery & Brake Inspection Overdue',
      description: 'Bus DL 1PC 4831 (BUS-112) has exceeded 120,000 km mandatory service interval.',
      affectedDutyId: 'duty-del-1011',
      affectedDriverId: 'DRV-1011',
      affectedBusId: 'bus-del-112',
      status: 'OPEN',
      suggestedResolution: 'Route bus to BBM Central Workshop Depot #3 and replace with standby bus BUS-104.',
      createdAt: '2026-09-01T21:40:00.000Z',
      city: 'delhi'
    }
  ];

  // 8. Alerts
  const alerts = [
    {
      id: 'alt-del-01',
      severity: 'CRITICAL',
      category: 'SAFETY',
      title: 'DRIVER FATIGUE RISK',
      message: 'Driver Amit Sharma assigned duty without meeting mandatory 11-hour legal rest window.',
      status: 'ACTIVE',
      timestamp: '2026-09-01T22:05:00.000Z',
      city: 'delhi'
    },
    {
      id: 'alt-del-02',
      severity: 'WARNING',
      category: 'OPERATIONS',
      title: 'TERMINAL CONGESTION AT KASHMERE GATE',
      message: '72 waiting passengers vs 50 seat capacity on Corridor 534 (22 overflow). Standby deployed.',
      status: 'ACTIVE',
      timestamp: '2026-09-01T22:12:00.000Z',
      city: 'delhi'
    },
    {
      id: 'alt-del-03',
      severity: 'INFO',
      category: 'TELEMETRY',
      title: 'GPS TELEMETRY NOMINAL',
      message: 'All 32 GPS transponders reporting via 4G telemetry (14ms round-trip latency).',
      status: 'RESOLVED',
      timestamp: '2026-09-01T22:15:00.000Z',
      city: 'delhi'
    }
  ];

  return { hubs, routes, buses, drivers, duties, trips, conflicts, alerts };
}

function generateChennaiData() {
  const base = generateDelhiData();
  return {
    ...base,
    routes: base.routes.map(r => ({ ...r, city: 'chennai', name: r.name.replace('Kashmere Gate', 'CMBT Koyambedu').replace('Saket', 'Tambaram') })),
    buses: base.buses.map(b => ({ ...b, city: 'chennai', busNumber: b.busNumber.replace('DL 1PC', 'TN 01 AN') })),
    drivers: base.drivers.map(d => ({ ...d, city: 'chennai', licenseNumber: d.licenseNumber.replace('DL-04', 'TN-01') }))
  };
}

function generateBangaloreData() {
  const base = generateDelhiData();
  return {
    ...base,
    routes: base.routes.map(r => ({ ...r, city: 'bangalore', name: r.name.replace('Kashmere Gate', 'Majestic Kempegowda').replace('Saket', 'Electronic City') })),
    buses: base.buses.map(b => ({ ...b, city: 'bangalore', busNumber: b.busNumber.replace('DL 1PC', 'KA 01 F') })),
    drivers: base.drivers.map(d => ({ ...d, city: 'bangalore', licenseNumber: d.licenseNumber.replace('DL-04', 'KA-01') }))
  };
}

