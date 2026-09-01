/**
 * CityFlow / TransitFlow Master Operational Dataset
 * High-fidelity GIS data, fleet records, crew rosters, and duty schedules.
 */

// Key Interchange Hubs where unlinked duty handoffs occur (15-minute buffer requirement)
export const INTERCHANGE_HUBS = [
  {
    id: "hub-1",
    name: "Central Metro Plaza Hub",
    code: "CMP-HUB",
    coordinates: [-122.4194, 37.7749], // [lng, lat]
    description: "Primary multimodal interchange with 8 bay platforms and crew lounge",
    bayCount: 8,
    activeTransfers: 4,
  },
  {
    id: "hub-2",
    name: "North Intermodal Terminal",
    code: "NIT-HUB",
    coordinates: [-122.4050, 37.7985],
    description: "Financial District & Ferry connector interchange",
    bayCount: 6,
    activeTransfers: 2,
  },
  {
    id: "hub-3",
    name: "Bayview Tech Gateway",
    code: "BTG-HUB",
    coordinates: [-122.3890, 37.7380],
    description: "Industrial & Innovation park junction",
    bayCount: 4,
    activeTransfers: 1,
  },
  {
    id: "hub-4",
    name: "Westgate Civic Transit Center",
    code: "WTC-HUB",
    coordinates: [-122.4760, 37.7600],
    description: "Ocean & Sunset corridor express hub",
    bayCount: 5,
    activeTransfers: 2,
  }
];

// Active Bus Routes in the network
export const INITIAL_ROUTES = [
  {
    id: "route-101",
    code: "101",
    name: "Downtown — Airport Express",
    color: "#0ea5e9", // Sky Blue
    lengthKm: 16.4,
    frequencyMins: 10,
    operatingHours: "05:30 - 23:30",
    bufferMeters: 50,
    stops: [
      { name: "North Terminal (NIT)", coordinates: [-122.4050, 37.7985] },
      { name: "Union Square", coordinates: [-122.4075, 37.7880] },
      { name: "Central Metro Plaza (CMP)", coordinates: [-122.4194, 37.7749] },
      { name: "Mission & 16th", coordinates: [-122.4199, 37.7650] },
      { name: "Potrero Transit Way", coordinates: [-122.4060, 37.7520] },
      { name: "Bayview Tech Gateway (BTG)", coordinates: [-122.3890, 37.7380] },
      { name: "International Airport T3", coordinates: [-122.3830, 37.7180] }
    ],
    pathCoordinates: [
      [-122.4050, 37.7985],
      [-122.4062, 37.7930],
      [-122.4075, 37.7880],
      [-122.4120, 37.7810],
      [-122.4194, 37.7749],
      [-122.4199, 37.7650],
      [-122.4150, 37.7580],
      [-122.4060, 37.7520],
      [-122.3980, 37.7450],
      [-122.3890, 37.7380],
      [-122.3850, 37.7280],
      [-122.3830, 37.7180]
    ]
  },
  {
    id: "route-204",
    code: "204",
    name: "North Spine — Sunset Crosstown",
    color: "#10b981", // Emerald
    lengthKm: 21.2,
    frequencyMins: 12,
    operatingHours: "06:00 - 00:00",
    bufferMeters: 50,
    stops: [
      { name: "North Terminal (NIT)", coordinates: [-122.4050, 37.7985] },
      { name: "Civic Center Hub", coordinates: [-122.4180, 37.7790] },
      { name: "Central Metro Plaza (CMP)", coordinates: [-122.4194, 37.7749] },
      { name: "Twin Peaks Parkway", coordinates: [-122.4460, 37.7550] },
      { name: "Westgate Civic (WTC)", coordinates: [-122.4760, 37.7600] },
      { name: "Ocean Beach Boulevard", coordinates: [-122.5080, 37.7620] }
    ],
    pathCoordinates: [
      [-122.4050, 37.7985],
      [-122.4110, 37.7890],
      [-122.4180, 37.7790],
      [-122.4194, 37.7749],
      [-122.4310, 37.7680],
      [-122.4460, 37.7550],
      [-122.4620, 37.7570],
      [-122.4760, 37.7600],
      [-122.4920, 37.7610],
      [-122.5080, 37.7620]
    ]
  },
  {
    id: "route-305",
    code: "305",
    name: "Metro Central — Innovation Ring",
    color: "#a855f7", // Purple
    lengthKm: 14.8,
    frequencyMins: 15,
    operatingHours: "06:30 - 22:30",
    bufferMeters: 50,
    stops: [
      { name: "Central Metro Plaza (CMP)", coordinates: [-122.4194, 37.7749] },
      { name: "SOMA Arts District", coordinates: [-122.4020, 37.7780] },
      { name: "Mission Bay Health Hub", coordinates: [-122.3920, 37.7680] },
      { name: "Bayview Tech Gateway (BTG)", coordinates: [-122.3890, 37.7380] },
      { name: "Bernal Heights Loop", coordinates: [-122.4150, 37.7420] },
      { name: "Central Metro Plaza (CMP)", coordinates: [-122.4194, 37.7749] }
    ],
    pathCoordinates: [
      [-122.4194, 37.7749],
      [-122.4090, 37.7760],
      [-122.4020, 37.7780],
      [-122.3950, 37.7730],
      [-122.3920, 37.7680],
      [-122.3880, 37.7530],
      [-122.3890, 37.7380],
      [-122.4020, 37.7390],
      [-122.4150, 37.7420],
      [-122.4200, 37.7580],
      [-122.4194, 37.7749]
    ]
  },
  {
    id: "route-408",
    code: "408",
    name: "Westgate — Bayview Transbay",
    color: "#f59e0b", // Amber
    lengthKm: 19.5,
    frequencyMins: 15,
    operatingHours: "06:00 - 22:00",
    bufferMeters: 50,
    stops: [
      { name: "Westgate Civic (WTC)", coordinates: [-122.4760, 37.7600] },
      { name: "Cesar Chavez Blvd", coordinates: [-122.4250, 37.7480] },
      { name: "Bayview Tech Gateway (BTG)", coordinates: [-122.3890, 37.7380] }
    ],
    pathCoordinates: [
      [-122.4760, 37.7600],
      [-122.4550, 37.7520],
      [-122.4380, 37.7490],
      [-122.4250, 37.7480],
      [-122.4050, 37.7440],
      [-122.3890, 37.7380]
    ]
  }
];

// Pre-configured proposed routes for demoing the overlap GIS engine
export const PROPOSED_ROUTE_TEMPLATES = [
  {
    id: "prop-601",
    name: "Midtown Radial Connector (Proposed)",
    code: "P-601",
    description: "Runs heavily along Market & Mission corridors (High corridor collision with Route 101 & 204)",
    color: "#f43f5e",
    pathCoordinates: [
      [-122.4040, 37.7990],
      [-122.4075, 37.7880], // Overlap segment
      [-122.4120, 37.7810], // Overlap segment
      [-122.4194, 37.7749], // Overlap segment
      [-122.4199, 37.7650], // Overlap segment
      [-122.4280, 37.7550],
      [-122.4350, 37.7450]
    ]
  },
  {
    id: "prop-702",
    name: "South Waterfront Greenway (Proposed)",
    code: "P-702",
    description: "Independent shoreline corridor with low overlap (Expands network reach by 12.8 km)",
    color: "#06b6d4",
    pathCoordinates: [
      [-122.3900, 37.7950],
      [-122.3870, 37.7830],
      [-122.3850, 37.7690],
      [-122.3830, 37.7550],
      [-122.3810, 37.7390],
      [-122.3780, 37.7200]
    ]
  }
];

// Bus Fleet
export const BUS_FLEET = [
  { id: "bus-101", busNumber: "EV-101", type: "Electric Double-Decker", capacity: 85, status: "IN_SERVICE", batteryPct: 92, assignedRoute: "101" },
  { id: "bus-102", busNumber: "EV-102", type: "Standard 40ft EV", capacity: 55, status: "IN_SERVICE", batteryPct: 88, assignedRoute: "101" },
  { id: "bus-201", busNumber: "EV-201", type: "Articulated 60ft", capacity: 110, status: "IN_SERVICE", batteryPct: 79, assignedRoute: "204" },
  { id: "bus-204", busNumber: "EV-204", type: "Standard 40ft EV", capacity: 55, status: "IN_SERVICE", batteryPct: 84, assignedRoute: "204" },
  { id: "bus-301", busNumber: "EV-301", type: "Standard 40ft EV", capacity: 55, status: "IN_SERVICE", batteryPct: 95, assignedRoute: "305" },
  { id: "bus-302", busNumber: "EV-302", type: "Electric Double-Decker", capacity: 85, status: "IN_SERVICE", batteryPct: 67, assignedRoute: "305" },
  { id: "bus-401", busNumber: "EV-401", type: "Standard 40ft EV", capacity: 55, status: "IN_SERVICE", batteryPct: 91, assignedRoute: "408" },
  { id: "bus-402", busNumber: "EV-402", type: "Standard 40ft EV", capacity: 55, status: "IN_SERVICE", batteryPct: 73, assignedRoute: "408" },
  { id: "bus-901", busNumber: "SB-901", type: "Reserve Standby EV", capacity: 55, status: "STANDBY_READY", batteryPct: 100, assignedRoute: null },
  { id: "bus-902", busNumber: "SB-902", type: "Reserve Standby EV", capacity: 55, status: "STANDBY_READY", batteryPct: 100, assignedRoute: null }
];

// Crew Members with last shift end times and rest tracking
export const CREW_MEMBERS = [
  {
    id: "crew-01",
    fullName: "Elena Rostova",
    licenseNumber: "CDL-CA-88392",
    badge: "DRV-101",
    contractHours: 40,
    weeklyHoursUsed: 28,
    lastShiftEnd: "2026-08-31T19:00:00Z", // 11h+ Rested
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.9,
    certifications: ["EV_ARTICULATED", "NIGHT_SERVICE"]
  },
  {
    id: "crew-02",
    fullName: "Marcus Vance",
    licenseNumber: "CDL-CA-99412",
    badge: "DRV-102",
    contractHours: 40,
    weeklyHoursUsed: 34,
    // Planned conflict: finished shift at 00:30 today, new shift starts at 07:00 -> Only 6.5h rest (Violation!)
    lastShiftEnd: "2026-09-01T00:30:00Z",
    status: "FATIGUE_CONFLICT",
    isStandby: false,
    rating: 4.7,
    certifications: ["EV_STANDARD"]
  },
  {
    id: "crew-03",
    fullName: "Sarah Chen",
    licenseNumber: "CDL-CA-77123",
    badge: "DRV-103",
    contractHours: 40,
    weeklyHoursUsed: 24,
    lastShiftEnd: "2026-08-31T18:00:00Z",
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.95,
    certifications: ["EV_DOUBLE_DECKER", "EV_ARTICULATED"]
  },
  {
    id: "crew-04",
    fullName: "David Kim",
    licenseNumber: "CDL-CA-66510",
    badge: "DRV-104",
    contractHours: 40,
    weeklyHoursUsed: 31,
    lastShiftEnd: "2026-08-31T17:30:00Z",
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.8,
    certifications: ["EV_STANDARD"]
  },
  {
    id: "crew-05",
    fullName: "Amina Al-Mansoor",
    licenseNumber: "CDL-CA-55421",
    badge: "DRV-105",
    contractHours: 40,
    weeklyHoursUsed: 26,
    lastShiftEnd: "2026-08-31T19:30:00Z",
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.88,
    certifications: ["EV_DOUBLE_DECKER", "EV_STANDARD"]
  },
  {
    id: "crew-06",
    fullName: "Carlos Mendez",
    licenseNumber: "CDL-CA-44390",
    badge: "DRV-106",
    contractHours: 40,
    weeklyHoursUsed: 30,
    lastShiftEnd: "2026-08-31T20:00:00Z",
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.75,
    certifications: ["EV_STANDARD"]
  },
  {
    id: "crew-07",
    fullName: "Priya Sharma",
    licenseNumber: "CDL-CA-33219",
    badge: "DRV-107",
    contractHours: 40,
    weeklyHoursUsed: 22,
    lastShiftEnd: "2026-08-31T18:00:00Z",
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.92,
    certifications: ["EV_ARTICULATED", "EV_DOUBLE_DECKER"]
  },
  {
    id: "crew-08",
    fullName: "James O'Connor",
    licenseNumber: "CDL-CA-22104",
    badge: "DRV-108",
    contractHours: 40,
    weeklyHoursUsed: 27,
    lastShiftEnd: "2026-08-31T17:00:00Z",
    status: "ASSIGNED",
    isStandby: false,
    rating: 4.85,
    certifications: ["EV_STANDARD"]
  },
  // Standby Reserve Pool (For Tier 1 Fallback Resolution)
  {
    id: "crew-standby-01",
    fullName: "Lucas Thorne (Reserve Standby)",
    licenseNumber: "CDL-CA-11001",
    badge: "SBY-01",
    contractHours: 40,
    weeklyHoursUsed: 14,
    lastShiftEnd: "2026-08-31T14:00:00Z", // Fully rested (17+ hours rest)
    status: "STANDBY_READY",
    isStandby: true,
    rating: 4.95,
    certifications: ["EV_STANDARD", "EV_ARTICULATED", "EV_DOUBLE_DECKER"]
  },
  {
    id: "crew-standby-02",
    fullName: "Maya Lin (Reserve Standby)",
    licenseNumber: "CDL-CA-11002",
    badge: "SBY-02",
    contractHours: 40,
    weeklyHoursUsed: 16,
    lastShiftEnd: "2026-08-31T16:00:00Z", // Fully rested (15+ hours rest)
    status: "STANDBY_READY",
    isStandby: true,
    rating: 4.9,
    certifications: ["EV_STANDARD", "EV_DOUBLE_DECKER"]
  },
  {
    id: "crew-standby-03",
    fullName: "Tariq Washington (Relief Crew)",
    licenseNumber: "CDL-CA-11003",
    badge: "SBY-03",
    contractHours: 40,
    weeklyHoursUsed: 18,
    lastShiftEnd: "2026-08-31T15:30:00Z",
    status: "STANDBY_READY",
    isStandby: true,
    rating: 4.8,
    certifications: ["EV_STANDARD"]
  }
];

// Duty Assignments (Linked vs Unlinked + Rest Rule Records)
// Note: Today's reference date is 2026-09-01
export const INITIAL_DUTIES = [
  {
    id: "duty-101",
    dutyCode: "DT-LINK-101",
    dutyType: "LINKED", // 1:1 Crew locked to Bus 101 across shift
    crewId: "crew-01", // Elena Rostova
    busId: "bus-101",
    routeId: "route-101",
    startTime: "2026-09-01T06:00:00Z",
    endTime: "2026-09-01T14:00:00Z",
    mandatoryRestEnd: "2026-09-02T01:00:00Z", // 11h mandatory rest after shift
    status: "ACTIVE_SCHEDULED",
    notes: "Continuous Morning Peak corridor run. Bus EV-101 dedicated.",
    handoffHub: null,
    segments: [
      { start: "06:00", end: "14:00", busNumber: "EV-101", routeCode: "101", type: "DRIVE" }
    ]
  },
  {
    id: "duty-102",
    dutyCode: "DT-UNLK-204",
    dutyType: "UNLINKED", // Switches bus at Central Metro Plaza with 15m handoff
    crewId: "crew-03", // Sarah Chen
    busId: "bus-201",
    secondBusId: "bus-301",
    routeId: "route-204",
    secondRouteId: "route-305",
    startTime: "2026-09-01T06:30:00Z",
    endTime: "2026-09-01T14:30:00Z",
    mandatoryRestEnd: "2026-09-02T01:30:00Z",
    status: "ACTIVE_SCHEDULED",
    handoffHub: "Central Metro Plaza Hub",
    handoffBufferMinutes: 15,
    notes: "Segment 1 on EV-201 (06:30-10:15) -> 15m Transfer at CMP -> Segment 2 on EV-301 (10:30-14:30)",
    segments: [
      { start: "06:30", end: "10:15", busNumber: "EV-201", routeCode: "204", type: "DRIVE", hub: "NIT -> CMP" },
      { start: "10:15", end: "10:30", busNumber: "TRANSFER", routeCode: "HUB", type: "HANDOFF_BUFFER", hub: "Central Metro Plaza Hub" },
      { start: "10:30", end: "14:30", busNumber: "EV-301", routeCode: "305", type: "DRIVE", hub: "CMP -> Ring" }
    ]
  },
  {
    id: "duty-103",
    dutyCode: "DT-LINK-305",
    dutyType: "LINKED",
    crewId: "crew-04", // David Kim
    busId: "bus-302",
    routeId: "route-305",
    startTime: "2026-09-01T07:00:00Z",
    endTime: "2026-09-01T15:00:00Z",
    mandatoryRestEnd: "2026-09-02T02:00:00Z",
    status: "ACTIVE_SCHEDULED",
    notes: "Innovation District loop duty. 1:1 dedicated assignment.",
    handoffHub: null,
    segments: [
      { start: "07:00", end: "15:00", busNumber: "EV-302", routeCode: "305", type: "DRIVE" }
    ]
  },
  {
    id: "duty-104",
    dutyCode: "DT-CONFLICT-02",
    dutyType: "LINKED",
    crewId: "crew-02", // Marcus Vance (FATIGUE CONFLICT!)
    busId: "bus-204",
    routeId: "route-204",
    startTime: "2026-09-01T07:00:00Z",
    endTime: "2026-09-01T15:30:00Z",
    mandatoryRestEnd: "2026-09-02T02:30:00Z",
    status: "CONFLICT_REST_VIOLATION", // Flagged by constraint engine
    conflictDetails: {
      type: "REST_PERIOD_DEFICIT",
      actualRestHours: 6.5,
      requiredRestHours: 11.0,
      deficitHours: 4.5,
      lastShiftEnd: "2026-09-01T00:30:00Z",
      newShiftStart: "2026-09-01T07:00:00Z",
      message: "Mandated 11h rest violated by 4h 30m. Driver finished night run at 00:30 AM."
    },
    notes: "CRITICAL: Illegal assignment. Requires 3-Tier Fallback Solver execution.",
    handoffHub: null,
    segments: [
      { start: "07:00", end: "15:30", busNumber: "EV-204", routeCode: "204", type: "DRIVE" }
    ]
  },
  {
    id: "duty-105",
    dutyCode: "DT-UNLK-408",
    dutyType: "UNLINKED",
    crewId: "crew-05", // Amina Al-Mansoor
    busId: "bus-401",
    secondBusId: "bus-402",
    routeId: "route-408",
    secondRouteId: "route-408",
    startTime: "2026-09-01T08:00:00Z",
    endTime: "2026-09-01T16:00:00Z",
    mandatoryRestEnd: "2026-09-02T03:00:00Z",
    status: "ACTIVE_SCHEDULED",
    handoffHub: "Westgate Civic Transit Center",
    handoffBufferMinutes: 20,
    notes: "Midday battery charge vehicle swap at Westgate Hub (20m buffer)",
    segments: [
      { start: "08:00", end: "11:50", busNumber: "EV-401", routeCode: "408", type: "DRIVE", hub: "Westgate" },
      { start: "11:50", end: "12:10", busNumber: "TRANSFER", routeCode: "HUB", type: "HANDOFF_BUFFER", hub: "Westgate Civic Center" },
      { start: "12:10", end: "16:00", busNumber: "EV-402", routeCode: "408", type: "DRIVE", hub: "Westgate -> Bayview" }
    ]
  },
  {
    id: "duty-106",
    dutyCode: "DT-LINK-102",
    dutyType: "LINKED",
    crewId: "crew-06", // Carlos Mendez
    busId: "bus-102",
    routeId: "route-101",
    startTime: "2026-09-01T14:00:00Z",
    endTime: "2026-09-01T22:00:00Z",
    mandatoryRestEnd: "2026-09-02T09:00:00Z",
    status: "ACTIVE_SCHEDULED",
    notes: "Afternoon/Evening airport corridor shift.",
    handoffHub: null,
    segments: [
      { start: "14:00", end: "22:00", busNumber: "EV-102", routeCode: "101", type: "DRIVE" }
    ]
  },
  {
    id: "duty-107",
    dutyCode: "DT-UNLK-205",
    dutyType: "UNLINKED",
    crewId: "crew-07", // Priya Sharma
    busId: "bus-201",
    secondBusId: "bus-101",
    routeId: "route-204",
    secondRouteId: "route-101",
    startTime: "2026-09-01T14:30:00Z",
    endTime: "2026-09-01T22:30:00Z",
    mandatoryRestEnd: "2026-09-02T09:30:00Z",
    status: "ACTIVE_SCHEDULED",
    handoffHub: "North Intermodal Terminal",
    handoffBufferMinutes: 15,
    notes: "Intermodal vehicle exchange at North Terminal (15m buffer)",
    segments: [
      { start: "14:30", end: "18:20", busNumber: "EV-201", routeCode: "204", type: "DRIVE", hub: "NIT" },
      { start: "18:20", end: "18:35", busNumber: "TRANSFER", routeCode: "HUB", type: "HANDOFF_BUFFER", hub: "North Intermodal Terminal" },
      { start: "18:35", end: "22:30", busNumber: "EV-101", routeCode: "101", type: "DRIVE", hub: "NIT -> Airport" }
    ]
  },
  {
    id: "duty-108",
    dutyCode: "DT-LINK-401",
    dutyType: "LINKED",
    crewId: "crew-08", // James O'Connor
    busId: "bus-401",
    routeId: "route-408",
    startTime: "2026-09-01T16:00:00Z",
    endTime: "2026-09-01T23:30:00Z",
    mandatoryRestEnd: "2026-09-02T10:30:00Z",
    status: "ACTIVE_SCHEDULED",
    notes: "Transbay evening connector schedule.",
    handoffHub: null,
    segments: [
      { start: "16:00", end: "23:30", busNumber: "EV-401", routeCode: "408", type: "DRIVE" }
    ]
  }
];
