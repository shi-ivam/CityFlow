/**
 * CityFlow PRO - Master Operations Dataset & State Model
 * Mission-Critical Transit Operations Cockpit Data
 */

export const DIVISIONS = [
  { id: 'delhi_central', name: 'Delhi Central Division', code: 'DLI-CENTRAL', center: [28.6289, 77.2190], zoom: 13 },
  { id: 'delhi_south', name: 'Delhi South Division', code: 'DLI-SOUTH', center: [28.5244, 77.1855], zoom: 13 },
  { id: 'delhi_north', name: 'Delhi North Division', code: 'DLI-NORTH', center: [28.6942, 77.1720], zoom: 13 }
];

export const INITIAL_BUSES = [
  { id: 'BUS-104', regNumber: 'DL-1AB-104', model: 'Tata Ultra Electric 12m', status: 'IN_SERVICE', batteryPct: 84, speedKmh: 28, driverId: 'VERMA-27', routeId: 'R42', currentDutyId: 'DUTY-104', lat: 28.6328, lng: 77.2195, heading: 95 },
  { id: 'BUS-207', regNumber: 'DL-1AB-207', model: 'Ashok Leyland CNG Low-Floor', status: 'IN_SERVICE', batteryPct: 76, speedKmh: 34, driverId: 'SINGH-42', routeId: 'R17', currentDutyId: 'DUTY-207', lat: 28.6469, lng: 77.2350, heading: 180 },
  { id: 'BUS-312', regNumber: 'DL-1AB-312', model: 'Tata Starbus EV', status: 'IN_SERVICE', batteryPct: 91, speedKmh: 19, driverId: 'PATEL-31', routeId: 'R103', currentDutyId: 'DUTY-312', lat: 28.6180, lng: 77.2150, heading: 45 },
  { id: 'BUS-418', regNumber: 'DL-1AB-418', model: 'JBM ECO-LIFE e12', status: 'IN_SERVICE', batteryPct: 68, speedKmh: 31, driverId: 'KUMAR-19', routeId: 'R204', currentDutyId: 'DUTY-418', lat: 28.6500, lng: 77.2800, heading: 270 },
  { id: 'BUS-522', regNumber: 'DL-1AB-522', model: 'Tata Ultra Electric 12m', status: 'IN_SERVICE', batteryPct: 62, speedKmh: 22, driverId: 'GUPTA-44', routeId: 'R55', currentDutyId: 'DUTY-522', lat: 28.6120, lng: 77.2400, heading: 315 },
  { id: 'BUS-604', regNumber: 'DL-1AB-604', model: 'Ashok Leyland CNG', status: 'IN_SERVICE', batteryPct: 95, speedKmh: 26, driverId: 'MEHRA-12', routeId: 'R42', currentDutyId: 'DUTY-604', lat: 28.6400, lng: 77.2000, heading: 130 },
  { id: 'BUS-710', regNumber: 'DL-1AB-710', model: 'Tata Starbus EV', status: 'STANDBY_DEPOT', batteryPct: 100, speedKmh: 0, driverId: null, routeId: null, currentDutyId: null, lat: 28.6672, lng: 77.2285, heading: 0 },
  { id: 'BUS-801', regNumber: 'DL-1AB-801', model: 'JBM ECO-LIFE e12', status: 'STANDBY_DEPOT', batteryPct: 98, speedKmh: 0, driverId: null, routeId: null, currentDutyId: null, lat: 28.6672, lng: 77.2290, heading: 0 },
  { id: 'BUS-905', regNumber: 'DL-1AB-905', model: 'Tata Ultra Electric 12m', status: 'MAINTENANCE_BAY', batteryPct: 41, speedKmh: 0, driverId: null, routeId: null, currentDutyId: null, lat: 28.6139, lng: 77.2090, heading: 0 }
];

export const INITIAL_DRIVERS = [
  { id: 'VERMA-27', name: 'R. K. Verma', badge: 'EMP-1042', status: 'ASSIGNED', continuousDrivingMinutes: 265, maxLimitMinutes: 270, lastShiftEnd: 'Yesterday 21:00', currentDutyId: 'DUTY-104', isStandby: false, restStatus: 'APPROACHING_LIMIT' },
  { id: 'SHARMA-18', name: 'Vipin Sharma', badge: 'EMP-1091', status: 'STANDBY', continuousDrivingMinutes: 0, maxLimitMinutes: 270, lastShiftEnd: 'Yesterday 18:30', currentDutyId: null, isStandby: true, restStatus: 'RESTED_COMPLIANT' },
  { id: 'SINGH-42', name: 'Gurpreet Singh', badge: 'EMP-1077', status: 'ASSIGNED', continuousDrivingMinutes: 140, maxLimitMinutes: 270, lastShiftEnd: 'Yesterday 20:00', currentDutyId: 'DUTY-207', isStandby: false, restStatus: 'RESTED_COMPLIANT' },
  { id: 'PATEL-31', name: 'Manish Patel', badge: 'EMP-1065', status: 'ASSIGNED', continuousDrivingMinutes: 190, maxLimitMinutes: 270, lastShiftEnd: 'Yesterday 19:30', currentDutyId: 'DUTY-312', isStandby: false, restStatus: 'RESTED_COMPLIANT' },
  { id: 'KUMAR-19', name: 'Sanjay Kumar', badge: 'EMP-1033', status: 'ASSIGNED', continuousDrivingMinutes: 110, maxLimitMinutes: 270, lastShiftEnd: 'Yesterday 22:00', currentDutyId: 'DUTY-418', isStandby: false, restStatus: 'RESTED_COMPLIANT' },
  { id: 'GUPTA-44', name: 'Anil Gupta', badge: 'EMP-1088', status: 'ASSIGNED', continuousDrivingMinutes: 95, maxLimitMinutes: 270, lastShiftEnd: 'Yesterday 20:45', currentDutyId: 'DUTY-522', isStandby: false, restStatus: 'RESTED_COMPLIANT' },
  { id: 'MEHRA-12', name: 'Devendra Mehra', badge: 'EMP-1014', status: 'BREAK', continuousDrivingMinutes: 0, maxLimitMinutes: 270, lastShiftEnd: 'Today 08:00', currentDutyId: 'DUTY-604', isStandby: false, restStatus: 'ON_BREAK' },
  { id: 'RAO-22', name: 'K. S. Rao', badge: 'EMP-1050', status: 'BREAK', continuousDrivingMinutes: 0, maxLimitMinutes: 270, lastShiftEnd: 'Today 07:45', currentDutyId: null, isStandby: false, restStatus: 'ON_BREAK' }
];

export const INITIAL_ROUTES = [
  {
    id: 'R42',
    name: 'Route 42: Connaught Place ⇄ Anand Vihar ISBT',
    code: '42',
    color: '#6366f1',
    activeBuses: 2,
    lengthKm: 14.8,
    status: 'ACTIVE_CONFLICT',
    coordinates: [
      [28.6328, 77.2195], // Connaught Place
      [28.6295, 77.2340], // Mandi House
      [28.6300, 77.2450], // ITO Junction
      [28.6360, 77.2750], // Laxmi Nagar
      [28.6469, 77.3150]  // Anand Vihar ISBT
    ],
    stops: ['Connaught Place', 'Mandi House', 'ITO Metro Hub', 'Laxmi Nagar', 'Anand Vihar ISBT']
  },
  {
    id: 'R17',
    name: 'Route 17: Kashmere Gate ⇄ Pragati Maidan ⇄ Nizamuddin',
    code: '17',
    color: '#f59e0b',
    activeBuses: 1,
    lengthKm: 16.2,
    status: 'CORRIDOR_OVERLAP',
    coordinates: [
      [28.6672, 77.2285], // Kashmere Gate
      [28.6460, 77.2380], // Delhi Gate
      [28.6300, 77.2450], // ITO Junction (Overlap with R42)
      [28.6200, 77.2480], // Pragati Maidan
      [28.5880, 77.2530]  // Hazrat Nizamuddin
    ],
    stops: ['Kashmere Gate ISBT', 'Delhi Gate', 'ITO Junction', 'Pragati Maidan', 'Hazrat Nizamuddin']
  },
  {
    id: 'R103',
    name: 'Route 103: Red Fort ⇄ Dhaula Kuan Express',
    code: '103',
    color: '#10b981',
    activeBuses: 1,
    lengthKm: 18.5,
    status: 'NOMINAL',
    coordinates: [
      [28.6562, 77.2410],
      [28.6380, 77.2100],
      [28.6150, 77.1950],
      [28.5920, 77.1650]
    ],
    stops: ['Red Fort', 'Pahar Ganj', 'RML Hospital', 'Dhaula Kuan Hub']
  },
  {
    id: 'R204',
    name: 'Route 204: Sarai Kale Khan ⇄ Rohini West',
    code: '204',
    color: '#06b6d4',
    activeBuses: 1,
    lengthKm: 24.1,
    status: 'NOMINAL',
    coordinates: [
      [28.5900, 77.2580],
      [28.6200, 77.2200],
      [28.6700, 77.1500],
      [28.7150, 77.1150]
    ],
    stops: ['Sarai Kale Khan', 'Barakhamba', 'Shalimar Bagh', 'Rohini West']
  },
  {
    id: 'R55',
    name: 'Route 55: AIIMS Ring Corridor Feeder',
    code: '55',
    color: '#a855f7',
    activeBuses: 1,
    lengthKm: 12.0,
    status: 'NOMINAL',
    coordinates: [
      [28.5680, 77.2100],
      [28.5750, 77.2300],
      [28.6050, 77.2350],
      [28.6120, 77.2400]
    ],
    stops: ['AIIMS South Gate', 'South Extension', 'JLN Stadium', 'Sundar Nagar']
  }
];

export const INITIAL_DUTIES = [
  {
    id: 'DUTY-104',
    dutyCode: 'DT-104',
    busId: 'BUS-104',
    driverId: 'VERMA-27',
    routeId: 'R42',
    startTime: '06:00',
    endTime: '10:30',
    type: 'LINKED', // Solid Electric Indigo
    isLocked: true,
    status: 'CRITICAL_REST_VIOLATION',
    restRequirementMinutes: 45,
    nextReliefStop: 'Mandi House (Stop 2)',
    notes: 'Driver approaching 4.5h threshold. Scheduled departure 09:15 at risk.'
  },
  {
    id: 'DUTY-207',
    dutyCode: 'DT-207',
    busId: 'BUS-207',
    driverId: 'SINGH-42',
    routeId: 'R17',
    startTime: '07:00',
    endTime: '11:30',
    type: 'LINKED',
    isLocked: false,
    status: 'CORRIDOR_OVERLAP_WARNING',
    restRequirementMinutes: 45,
    nextReliefStop: 'ITO Junction (Stop 3)',
    notes: 'Concurrent departure with Route 42 causing 18.4% corridor bunching.'
  },
  {
    id: 'DUTY-208',
    dutyCode: 'DT-208',
    busId: 'BUS-312',
    driverId: 'PATEL-31',
    routeId: 'R103',
    startTime: '10:30',
    endTime: '14:00',
    type: 'UNLINKED', // Amber striped
    isLocked: false,
    status: 'FLOATING_STANDBY',
    restRequirementMinutes: 45,
    nextReliefStop: 'Dhaula Kuan Hub',
    notes: 'Floating unlinked duty block awaiting crew roster lock.'
  },
  {
    id: 'DUTY-312',
    dutyCode: 'DT-312',
    busId: 'BUS-312',
    driverId: 'PATEL-31',
    routeId: 'R103',
    startTime: '06:30',
    endTime: '10:15',
    type: 'LINKED',
    isLocked: true,
    status: 'COMPLIANT',
    restRequirementMinutes: 45,
    nextReliefStop: 'Pahar Ganj',
    notes: 'Nominal operation.'
  },
  {
    id: 'DUTY-418',
    dutyCode: 'DT-418',
    busId: 'BUS-418',
    driverId: 'KUMAR-19',
    routeId: 'R204',
    startTime: '08:00',
    endTime: '12:30',
    type: 'LINKED',
    isLocked: true,
    status: 'COMPLIANT',
    restRequirementMinutes: 45,
    nextReliefStop: 'Shalimar Bagh',
    notes: 'Nominal operation.'
  },
  {
    id: 'DUTY-522',
    dutyCode: 'DT-522',
    busId: 'BUS-522',
    driverId: 'GUPTA-44',
    routeId: 'R55',
    startTime: '07:30',
    endTime: '11:00',
    type: 'LINKED',
    isLocked: false,
    status: 'COMPLIANT',
    restRequirementMinutes: 45,
    nextReliefStop: 'JLN Stadium',
    notes: 'Nominal operation.'
  },
  {
    id: 'DUTY-604',
    dutyCode: 'DT-604',
    busId: 'BUS-604',
    driverId: 'MEHRA-12',
    routeId: 'R42',
    startTime: '09:00',
    endTime: '13:30',
    type: 'LINKED',
    isLocked: false,
    status: 'REST_PERIOD',
    restRequirementMinutes: 45,
    nextReliefStop: 'Connaught Place',
    notes: 'Driver on mandated 45-min mid-shift rest break.'
  }
];

export const INITIAL_CONFLICTS = [
  {
    id: 'CF-204',
    code: 'CF-204',
    type: 'CREW_AVAILABILITY',
    severity: 'CRITICAL',
    affectedBusId: 'BUS-104',
    affectedRouteId: 'R42',
    affectedDutyId: 'DUTY-104',
    departureTime: '09:15',
    driverId: 'VERMA-27',
    driverName: 'R. K. Verma',
    issue: 'Maximum continuous driving limit reached (4h 25m / 4h 30m). No rested crew currently assigned for 09:15 departure.',
    impact: 'Departure delayed by 18+ minutes without standby relief.',
    recommendation: 'Assign Standby Crew (SHARMA-18 available at Central Depot)',
    options: ['Assign Standby Crew', 'Overtime Protocol', 'Split-Shift Fallback'],
    status: 'ACTIVE'
  },
  {
    id: 'CF-109',
    code: 'CF-109',
    type: 'CORRIDOR_OVERLAP',
    severity: 'WARNING',
    affectedBusId: 'BUS-207',
    affectedRouteId: 'R17',
    overlappingRouteId: 'R42',
    affectedDutyId: 'DUTY-207',
    departureTime: '09:00',
    driverId: 'SINGH-42',
    driverName: 'Gurpreet Singh',
    issue: 'Corridor overlap between Route 17 & Route 42 (18.4% headway clash). 3 shared passenger stops.',
    impact: 'Bus bunching and headway degradation along ITO Junction corridor.',
    recommendation: 'Adjust Route 17 departure by +8 min to restore 12-min headway separation.',
    options: ['Adjust Departure +8 min', 'Reroute Variant'],
    status: 'ACTIVE'
  }
];

export const DEPOTS = [
  { id: 'DEPOT-1', name: 'Central Millennium Depot', code: 'CMD-01', lat: 28.6672, lng: 77.2285, capacity: 80, activeFleet: 42, standbyDrivers: 4 },
  { id: 'DEPOT-2', name: 'South Delhi Depot (Okhla)', code: 'SDD-02', lat: 28.5350, lng: 77.2700, capacity: 60, activeFleet: 31, standbyDrivers: 2 }
];

export const RELIEF_POINTS = [
  { id: 'RP-1', name: 'Relief Point R1 (Mandi House)', code: 'RP-MANDI', lat: 28.6295, lng: 77.2340, facilities: ['Rest Lounge', 'Time Clock', 'Water/Tea'] },
  { id: 'RP-2', name: 'Relief Point R2 (ITO Junction)', code: 'RP-ITO', lat: 28.6300, lng: 77.2450, facilities: ['Rest Lounge', 'Driver Handover Bay'] }
];

export const INITIAL_ACTIVITY_LOG = [
  { id: 'ev-1', timestamp: '08:30:15', type: 'SYSTEM', message: 'Transit Operations Cockpit initialized at 08:30:15 IST', severity: 'info' },
  { id: 'ev-2', timestamp: '08:29:51', type: 'TELEMETRY', message: 'BUS-104 telemetry received (Speed: 28 km/h, Battery: 84%)', severity: 'nominal' },
  { id: 'ev-3', timestamp: '08:29:43', type: 'CREW', message: 'Driver SHARMA-18 verified present at Central Depot standby pool', severity: 'nominal' },
  { id: 'ev-4', timestamp: '08:29:12', type: 'CONFLICT', message: 'Route 42 and Route 17 corridor overlap flagged (18.4%)', severity: 'warning' },
  { id: 'ev-5', timestamp: '08:28:30', type: 'ALERT', message: 'Driver VERMA-27 continuous driving warning: 265/270 minutes', severity: 'critical' }
];
