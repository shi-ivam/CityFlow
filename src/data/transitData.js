/**
 * CityFlow / TransitFlow Multi-City Master Operational Dataset
 * Supports Delhi (NCR) and Chennai (Tamil Nadu) transit networks.
 * Introduces Trip Layer separating reusable Route definitions from scheduled Trips.
 */

export const CITIES_DATA = {
  delhi: {
    name: "Delhi",
    state: "Delhi",
    country: "India",
    coordinates: [28.6139, 77.2090], // [lat, lng]
    hubs: [
      {
        id: "hub-1",
        name: "Kashmere Gate ISBT Hub",
        code: "KG-ISBT",
        coordinates: [77.2285, 28.6672],
        description: "Primary multimodal interstate transit terminal with 12 bay platforms and driver rest lounge",
        bayCount: 12,
        activeTransfers: 5,
      },
      {
        id: "hub-2",
        name: "Anand Vihar ISBT Terminal",
        code: "AV-ISBT",
        coordinates: [77.3150, 28.6469],
        description: "East Delhi & UP border intermodal bus terminal",
        bayCount: 10,
        activeTransfers: 3,
      },
      {
        id: "hub-3",
        name: "Rajiv Chowk Interchange",
        code: "RC-HUB",
        coordinates: [77.2183, 28.6328],
        description: "Central Connaught Place high-density passenger junction",
        bayCount: 8,
        activeTransfers: 4,
      },
      {
        id: "hub-4",
        name: "Gurugram Bus Stand Terminal",
        code: "GUR-HUB",
        coordinates: [77.0266, 28.4595],
        description: "NCR South expressway connector hub",
        bayCount: 6,
        activeTransfers: 2,
      }
    ],
    routes: [
      {
        id: "route-534",
        code: "534",
        name: "Kashmere Gate → AIIMS → Saket Express",
        color: "#2563eb",
        lengthKm: 24.5,
        frequencyMins: 10,
        operatingHours: "05:00 - 23:30 IST",
        bufferMeters: 50,
        stops: [
          { name: "Kashmere Gate ISBT", coordinates: [77.2285, 28.6672] },
          { name: "Connaught Place / Rajiv Chowk", coordinates: [77.2183, 28.6328] },
          { name: "AIIMS Medical Hub", coordinates: [77.2090, 28.5672] },
          { name: "Saket District Centre", coordinates: [77.2066, 28.5244] }
        ],
        pathCoordinates: [
          [77.2285, 28.6672],
          [77.2240, 28.6500],
          [77.2183, 28.6328],
          [77.2130, 28.6000],
          [77.2090, 28.5672],
          [77.2075, 28.5450],
          [77.2066, 28.5244]
        ]
      },
      {
        id: "route-725",
        code: "725",
        name: "Anand Vihar ISBT → Dwarka Sector 21",
        color: "#10b981",
        lengthKm: 32.8,
        frequencyMins: 12,
        operatingHours: "05:30 - 00:00 IST",
        bufferMeters: 50,
        stops: [
          { name: "Anand Vihar ISBT", coordinates: [77.3150, 28.6469] },
          { name: "Laxmi Nagar Metro", coordinates: [77.2770, 28.6300] },
          { name: "Rajiv Chowk Hub", coordinates: [77.2183, 28.6328] },
          { name: "Dhaula Kuan", coordinates: [77.1650, 28.5910] },
          { name: "Dwarka Sector 21", coordinates: [77.0580, 28.5520] }
        ],
        pathCoordinates: [
          [77.3150, 28.6469],
          [77.2950, 28.6380],
          [77.2770, 28.6300],
          [77.2400, 28.6310],
          [77.2183, 28.6328],
          [77.1900, 28.6100],
          [77.1650, 28.5910],
          [77.1100, 28.5700],
          [77.0580, 28.5520]
        ]
      },
      {
        id: "route-410",
        code: "410",
        name: "Delhi Ring Road Circular Corridor",
        color: "#a855f7",
        lengthKm: 48.2,
        frequencyMins: 15,
        operatingHours: "06:00 - 23:00 IST",
        bufferMeters: 50,
        stops: [
          { name: "Kashmere Gate ISBT", coordinates: [77.2285, 28.6672] },
          { name: "ITO Junction", coordinates: [77.2400, 28.6270] },
          { name: "Ashram Chowk", coordinates: [77.2580, 28.5710] },
          { name: "AIIMS Medical Hub", coordinates: [77.2090, 28.5672] },
          { name: "Dhaula Kuan", coordinates: [77.1650, 28.5910] },
          { name: "Punjabi Bagh", coordinates: [77.1250, 28.6700] },
          { name: "Kashmere Gate ISBT", coordinates: [77.2285, 28.6672] }
        ],
        pathCoordinates: [
          [77.2285, 28.6672],
          [77.2350, 28.6450],
          [77.2400, 28.6270],
          [77.2500, 28.6000],
          [77.2580, 28.5710],
          [77.2300, 28.5690],
          [77.2090, 28.5672],
          [77.1850, 28.5800],
          [77.1650, 28.5910],
          [77.1400, 28.6300],
          [77.1250, 28.6700],
          [77.1800, 28.6800],
          [77.2285, 28.6672]
        ]
      },
      {
        id: "route-604",
        code: "604",
        name: "Connaught Place → Gurugram Cyber City",
        color: "#f59e0b",
        lengthKm: 34.0,
        frequencyMins: 15,
        operatingHours: "06:00 - 22:30 IST",
        bufferMeters: 50,
        stops: [
          { name: "Rajiv Chowk / CP", coordinates: [77.2183, 28.6328] },
          { name: "Dhaula Kuan Express", coordinates: [77.1650, 28.5910] },
          { name: "Gurugram Cyber City", coordinates: [77.0880, 28.4950] },
          { name: "Gurugram Bus Stand", coordinates: [77.0266, 28.4595] }
        ],
        pathCoordinates: [
          [77.2183, 28.6328],
          [77.1900, 28.6100],
          [77.1650, 28.5910],
          [77.1300, 28.5400],
          [77.0880, 28.4950],
          [77.0500, 28.4750],
          [77.0266, 28.4595]
        ]
      }
    ],
    buses: [
      { id: "bus-101", busNumber: "DL 1PC 4821", type: "Electric Low-Floor EV", capacity: 50, status: "IN_SERVICE", batteryPct: 92, assignedRoute: "534" },
      { id: "bus-102", busNumber: "DL 1AB 7314", type: "CNG Air-Conditioned", capacity: 55, status: "IN_SERVICE", batteryPct: 88, assignedRoute: "534" },
      { id: "bus-201", busNumber: "MH 12 KT 7421", type: "Articulated 60ft EV", capacity: 110, status: "IN_SERVICE", batteryPct: 79, assignedRoute: "725" },
      { id: "bus-204", busNumber: "KA 01 MN 3827", type: "Electric Low-Floor EV", capacity: 50, status: "IN_SERVICE", batteryPct: 84, assignedRoute: "725" },
      { id: "bus-301", busNumber: "UP 16 BX 1298", type: "CNG Express Coach", capacity: 55, status: "IN_SERVICE", batteryPct: 95, assignedRoute: "410" },
      { id: "bus-302", busNumber: "DL 1CD 5298", type: "Electric Double-Decker", capacity: 85, status: "IN_SERVICE", batteryPct: 67, assignedRoute: "410" },
      { id: "bus-401", busNumber: "RJ 14 CB 9012", type: "Interstate AC Electric", capacity: 55, status: "IN_SERVICE", batteryPct: 91, assignedRoute: "604" },
      { id: "bus-901", busNumber: "DL 01 SBY 001", type: "Reserve Standby EV", capacity: 60, status: "STANDBY_READY", batteryPct: 100, assignedRoute: null }
    ],
    drivers: [
      { id: "DRV-1042", fullName: "Rajesh Kumar", name: "Rajesh Kumar", licenseNumber: "DL-04201800921", badge: "DRV-1042", accumulatedHours: 6, status: "ASSIGNED" },
      { id: "DRV-1043", fullName: "Amit Sharma", name: "Amit Sharma", licenseNumber: "DL-04201904128", badge: "DRV-1043", accumulatedHours: 8, status: "REST_VIOLATION" },
      { id: "DRV-1044", fullName: "Suresh Yadav", name: "Suresh Yadav", licenseNumber: "UP-16201700412", badge: "DRV-1044", accumulatedHours: 5, status: "ASSIGNED" },
      { id: "DRV-1045", fullName: "Vijay Singh", name: "Vijay Singh", licenseNumber: "HR-26202008819", badge: "DRV-1045", accumulatedHours: 7, status: "ASSIGNED" },
      { id: "DRV-1046", fullName: "Manoj Verma", name: "Manoj Verma", licenseNumber: "DL-01201605542", badge: "DRV-1046", accumulatedHours: 6, status: "ASSIGNED" },
      { id: "DRV-SBY-01", fullName: "Ramesh Chand (Reserve)", name: "Ramesh Chand", licenseNumber: "DL-01201500112", badge: "SBY-01", accumulatedHours: 0, status: "STANDBY_READY" }
    ],
    trips: [
      {
        id: "TRIP-534-001",
        routeId: "route-534",
        routeCode: "534",
        date: "2026-09-02",
        departureTime: "06:30 AM",
        busId: "bus-101",
        busNumber: "DL 1PC 4821",
        driverId: "DRV-1042",
        driverName: "Rajesh Kumar",
        status: "COMPLETED",
        currentStop: "Saket District Centre",
        nextStop: "Terminal",
        etaMins: 0,
        occupancyRatio: "42 / 50"
      },
      {
        id: "TRIP-534-002",
        routeId: "route-534",
        routeCode: "534",
        date: "2026-09-02",
        departureTime: "08:30 AM",
        busId: "bus-102",
        busNumber: "DL 1AB 7314",
        driverId: "DRV-1043",
        driverName: "Amit Sharma",
        status: "RUNNING",
        currentStop: "Rajiv Chowk / CP",
        nextStop: "AIIMS Medical Hub",
        etaMins: 5,
        occupancyRatio: "38 / 55"
      },
      {
        id: "TRIP-534-003",
        routeId: "route-534",
        routeCode: "534",
        date: "2026-09-02",
        departureTime: "10:00 AM",
        busId: "bus-101",
        busNumber: "DL 1PC 4821",
        driverId: "DRV-1042",
        driverName: "Rajesh Kumar",
        status: "SCHEDULED",
        currentStop: "Kashmere Gate ISBT",
        nextStop: "Rajiv Chowk / CP",
        etaMins: 15,
        occupancyRatio: "0 / 50"
      },
      {
        id: "TRIP-725-001",
        routeId: "route-725",
        routeCode: "725",
        date: "2026-09-02",
        departureTime: "07:00 AM",
        busId: "bus-201",
        busNumber: "MH 12 KT 7421",
        driverId: "DRV-1044",
        driverName: "Suresh Yadav",
        status: "RUNNING",
        currentStop: "Laxmi Nagar Metro",
        nextStop: "Rajiv Chowk Hub",
        etaMins: 8,
        occupancyRatio: "85 / 110"
      },
      {
        id: "TRIP-410-001",
        routeId: "route-410",
        routeCode: "410",
        date: "2026-09-02",
        departureTime: "07:30 AM",
        busId: "bus-301",
        busNumber: "UP 16 BX 1298",
        driverId: "DRV-1046",
        driverName: "Manoj Verma",
        status: "RUNNING",
        currentStop: "ITO Junction",
        nextStop: "Ashram Chowk",
        etaMins: 6,
        occupancyRatio: "44 / 55"
      },
      {
        id: "TRIP-604-001",
        routeId: "route-604",
        routeCode: "604",
        date: "2026-09-02",
        departureTime: "08:00 AM",
        busId: "bus-401",
        busNumber: "RJ 14 CB 9012",
        driverId: "DRV-1045",
        driverName: "Vijay Singh",
        status: "RUNNING",
        currentStop: "Dhaula Kuan Express",
        nextStop: "Gurugram Cyber City",
        etaMins: 12,
        occupancyRatio: "48 / 55"
      }
    ]
  },

  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    coordinates: [13.0827, 80.2707], // [lat, lng]
    hubs: [
      {
        id: "hub-chn-1",
        name: "CMBT Koyambedu Terminal",
        code: "CMBT-HUB",
        coordinates: [80.1947, 13.0694],
        description: "Asia's largest bus terminal with 16 bay platforms and crew rest lounge",
        bayCount: 16,
        activeTransfers: 6,
      },
      {
        id: "hub-chn-2",
        name: "Chennai Central Railway Interchange",
        code: "MAS-HUB",
        coordinates: [80.2753, 13.0825],
        description: "Primary multimodal interstate rail & bus transit junction",
        bayCount: 12,
        activeTransfers: 4,
      },
      {
        id: "hub-chn-3",
        name: "Guindy Bus & Metro Hub",
        code: "GND-HUB",
        coordinates: [80.2062, 13.0067],
        description: "South Chennai industrial & airport highway connector",
        bayCount: 10,
        activeTransfers: 3,
      },
      {
        id: "hub-chn-4",
        name: "Tambaram Sanatorium Terminal",
        code: "TBM-HUB",
        coordinates: [80.1200, 12.9249],
        description: "South gateway intercity express hub",
        bayCount: 8,
        activeTransfers: 2,
      }
    ],
    routes: [
      {
        id: "route-mtc-102",
        code: "102",
        name: "Official MTC: Island Ground → OMR IT Corridor → Kelambakkam",
        color: "#2563eb",
        lengthKm: 34.5,
        frequencyMins: 6,
        operatingHours: "04:30 - 23:45 IST",
        bufferMeters: 50,
        stops: [
          { name: "Island Ground", coordinates: [80.2800, 13.0720] },
          { name: "Secretariat", coordinates: [80.2840, 13.0780] },
          { name: "Chepauk", coordinates: [80.2800, 13.0620] },
          { name: "Q.M.C", coordinates: [80.2760, 13.0450] },
          { name: "Foreshore Estate", coordinates: [80.2720, 13.0300] },
          { name: "Adyar O.T.", coordinates: [80.2550, 13.0010] },
          { name: "Indira Nagar", coordinates: [80.2500, 12.9880] },
          { name: "Kandanchavadi", coordinates: [80.2450, 12.9650] },
          { name: "Thorappakkam", coordinates: [80.2400, 12.9450] },
          { name: "Karapakkam", coordinates: [80.2350, 12.9250] },
          { name: "Shozhanganallur", coordinates: [80.2280, 12.9010] },
          { name: "Semmancheri", coordinates: [80.2240, 12.8700] },
          { name: "Navalur", coordinates: [80.2200, 12.8450] },
          { name: "Kelambakkam", coordinates: [80.2180, 12.7880] }
        ],
        pathCoordinates: [
          [80.2800, 13.0720],
          [80.2840, 13.0780],
          [80.2800, 13.0620],
          [80.2760, 13.0450],
          [80.2720, 13.0300],
          [80.2550, 13.0010],
          [80.2500, 12.9880],
          [80.2450, 12.9650],
          [80.2400, 12.9450],
          [80.2350, 12.9250],
          [80.2280, 12.9010],
          [80.2240, 12.8700],
          [80.2200, 12.8450],
          [80.2180, 12.7880]
        ]
      },
      {
        id: "route-21g",
        code: "21G",
        name: "CMBT → Guindy → T. Nagar → Tambaram Express",
        color: "#10b981",
        lengthKm: 28.4,
        frequencyMins: 8,
        operatingHours: "05:00 - 23:30 IST",
        bufferMeters: 50,
        stops: [
          { name: "CMBT Koyambedu Terminal", coordinates: [80.1947, 13.0694] },
          { name: "Vadapalani Junction", coordinates: [80.2120, 13.0500] },
          { name: "Guindy Metro Hub", coordinates: [80.2062, 13.0067] },
          { name: "T. Nagar Bus Terminus", coordinates: [80.2330, 13.0400] },
          { name: "Adyar Flyover Junction", coordinates: [80.2550, 13.0010] },
          { name: "Velachery Junction", coordinates: [80.2220, 12.9780] },
          { name: "Tambaram Sanatorium Terminal", coordinates: [80.1200, 12.9249] }
        ],
        pathCoordinates: [
          [80.1947, 13.0694],
          [80.2050, 13.0600],
          [80.2120, 13.0500],
          [80.2062, 13.0067],
          [80.2330, 13.0400],
          [80.2550, 13.0010],
          [80.2220, 12.9780],
          [80.1700, 12.9500],
          [80.1200, 12.9249]
        ]
      },
      {
        id: "route-570",
        code: "570",
        name: "CMBT → OMR IT Corridor → Sholinganallur",
        color: "#a855f7",
        lengthKm: 31.5,
        frequencyMins: 12,
        operatingHours: "06:00 - 23:00 IST",
        bufferMeters: 50,
        stops: [
          { name: "CMBT Koyambedu Terminal", coordinates: [80.1947, 13.0694] },
          { name: "Guindy Metro Hub", coordinates: [80.2062, 13.0067] },
          { name: "Taramani OMR IT Park", coordinates: [80.2450, 12.9800] },
          { name: "Sholinganallur Junction", coordinates: [80.2280, 12.9010] }
        ],
        pathCoordinates: [
          [80.1947, 13.0694],
          [80.2062, 13.0067],
          [80.2450, 12.9800],
          [80.2380, 12.9400],
          [80.2280, 12.9010]
        ]
      },
      {
        id: "route-11g",
        code: "11G",
        name: "Chennai Central → Egmore → T. Nagar",
        color: "#f59e0b",
        lengthKm: 14.2,
        frequencyMins: 10,
        operatingHours: "05:30 - 23:00 IST",
        bufferMeters: 50,
        stops: [
          { name: "Chennai Central Railway", coordinates: [80.2753, 13.0825] },
          { name: "Egmore Railway Station", coordinates: [80.2610, 13.0780] },
          { name: "Anna Salai Mount Road", coordinates: [80.2500, 13.0600] },
          { name: "T. Nagar Bus Terminus", coordinates: [80.2330, 13.0400] }
        ],
        pathCoordinates: [
          [80.2753, 13.0825],
          [80.2610, 13.0780],
          [80.2500, 13.0600],
          [80.2330, 13.0400]
        ]
      }
    ],
    buses: [
      { id: "bus-chn-101", busNumber: "TN 01 AB 4821", type: "Electric Low-Floor EV", capacity: 50, status: "IN_SERVICE", batteryPct: 94, assignedRoute: "102" },
      { id: "bus-chn-102", busNumber: "TN 01 CD 7314", type: "MTC Deluxe Express", capacity: 55, status: "IN_SERVICE", batteryPct: 86, assignedRoute: "102" },
      { id: "bus-chn-201", busNumber: "TN 38 MN 5298", type: "Articulated Electric EV", capacity: 110, status: "IN_SERVICE", batteryPct: 82, assignedRoute: "21G" },
      { id: "bus-chn-202", busNumber: "TN 10 BK 3917", type: "Electric Low-Floor EV", capacity: 50, status: "IN_SERVICE", batteryPct: 89, assignedRoute: "21G" },
      { id: "bus-chn-301", busNumber: "TN 09 KT 8421", type: "OMR IT AC Express", capacity: 55, status: "IN_SERVICE", batteryPct: 90, assignedRoute: "570" },
      { id: "bus-chn-401", busNumber: "TN 01 EF 6612", type: "City Circular EV", capacity: 50, status: "IN_SERVICE", batteryPct: 78, assignedRoute: "11G" },
      { id: "bus-chn-901", busNumber: "TN 01 SBY 001", type: "Reserve Standby EV", capacity: 60, status: "STANDBY_READY", batteryPct: 100, assignedRoute: null }
    ],
    drivers: [
      { id: "DRV-201", fullName: "Arun Kumar", name: "Arun Kumar", licenseNumber: "TN-01201700981", badge: "DRV-201", accumulatedHours: 5, status: "ASSIGNED" },
      { id: "DRV-202", fullName: "Suresh Babu", name: "Suresh Babu", licenseNumber: "TN-02201804112", badge: "DRV-202", accumulatedHours: 7, status: "ASSIGNED" },
      { id: "DRV-203", fullName: "Karthik Raj", name: "Karthik Raj", licenseNumber: "TN-09201908821", badge: "DRV-203", accumulatedHours: 6, status: "ASSIGNED" },
      { id: "DRV-204", fullName: "Prakash V", name: "Prakash V", licenseNumber: "TN-38202005541", badge: "DRV-204", accumulatedHours: 4, status: "ASSIGNED" },
      { id: "DRV-205", fullName: "Ramesh Kumar", name: "Ramesh Kumar", licenseNumber: "TN-01201601192", badge: "DRV-205", accumulatedHours: 8, status: "REST_VIOLATION" },
      { id: "DRV-206", fullName: "Senthil Kumar", name: "Senthil Kumar", licenseNumber: "TN-01202003312", badge: "DRV-206", accumulatedHours: 5, status: "ASSIGNED" },
      { id: "DRV-207", fullName: "Mohan Raj", name: "Mohan Raj", licenseNumber: "TN-09201509914", badge: "DRV-207", accumulatedHours: 3, status: "ASSIGNED" }
    ],
    trips: [
      {
        id: "TRIP-102-001",
        routeId: "route-mtc-102",
        routeCode: "102",
        date: "2026-09-02",
        departureTime: "06:30 AM",
        busId: "bus-chn-101",
        busNumber: "TN 01 AB 4821",
        driverId: "DRV-201",
        driverName: "Arun Kumar",
        status: "COMPLETED",
        currentStop: "Kelambakkam",
        nextStop: "Terminal",
        etaMins: 0,
        occupancyRatio: "48 / 50"
      },
      {
        id: "TRIP-102-002",
        routeId: "route-mtc-102",
        routeCode: "102",
        date: "2026-09-02",
        departureTime: "07:00 AM",
        busId: "bus-chn-102",
        busNumber: "TN 01 CD 7314",
        driverId: "DRV-202",
        driverName: "Suresh Babu",
        status: "COMPLETED",
        currentStop: "Kelambakkam",
        nextStop: "Terminal",
        etaMins: 0,
        occupancyRatio: "52 / 55"
      },
      {
        id: "TRIP-102-003",
        routeId: "route-mtc-102",
        routeCode: "102",
        date: "2026-09-02",
        departureTime: "08:30 AM",
        busId: "bus-chn-201",
        busNumber: "TN 38 MN 5298",
        driverId: "DRV-203",
        driverName: "Karthik Raj",
        status: "RUNNING",
        currentStop: "Adyar O.T.",
        nextStop: "Indira Nagar",
        etaMins: 6,
        occupancyRatio: "42 / 50"
      },
      {
        id: "TRIP-102-004",
        routeId: "route-mtc-102",
        routeCode: "102",
        date: "2026-09-02",
        departureTime: "09:00 AM",
        busId: "bus-chn-301",
        busNumber: "TN 09 KT 8421",
        driverId: "DRV-204",
        driverName: "Prakash V",
        status: "SCHEDULED",
        currentStop: "Island Ground",
        nextStop: "Secretariat",
        etaMins: 14,
        occupancyRatio: "0 / 55"
      },
      {
        id: "TRIP-21G-001",
        routeId: "route-21g",
        routeCode: "21G",
        date: "2026-09-02",
        departureTime: "07:30 AM",
        busId: "bus-chn-202",
        busNumber: "TN 10 BK 3917",
        driverId: "DRV-206",
        driverName: "Senthil Kumar",
        status: "RUNNING",
        currentStop: "Guindy Metro Hub",
        nextStop: "T. Nagar Bus Terminus",
        etaMins: 7,
        occupancyRatio: "41 / 50"
      },
      {
        id: "TRIP-570-001",
        routeId: "route-570",
        routeCode: "570",
        date: "2026-09-02",
        departureTime: "08:00 AM",
        busId: "bus-chn-301",
        busNumber: "TN 09 KT 8421",
        driverId: "DRV-207",
        driverName: "Mohan Raj",
        status: "RUNNING",
        currentStop: "Taramani OMR IT Park",
        nextStop: "Sholinganallur Junction",
        etaMins: 9,
        occupancyRatio: "39 / 55"
      }
    ]
  }
};

// Default exports for initial backward compatibility
export const INTERCHANGE_HUBS = CITIES_DATA.delhi.hubs;
export const INITIAL_ROUTES = CITIES_DATA.delhi.routes;
export const BUS_FLEET = CITIES_DATA.delhi.buses;
export const CREW_MEMBERS = CITIES_DATA.delhi.drivers;

export const PROPOSED_ROUTE_TEMPLATES = [
  {
    id: "prop-601",
    name: "CP Radial Connector (Proposed)",
    code: "P-601",
    description: "Runs heavily along Connaught Place & Ring Road corridors (High corridor collision with Route 534)",
    color: "#f43f5e",
    pathCoordinates: [
      [77.2285, 28.6672],
      [77.2183, 28.6328],
      [77.2090, 28.5672]
    ]
  },
  {
    id: "prop-702",
    name: "Gurugram Expressway Express (Proposed)",
    code: "P-702",
    description: "Independent expressway corridor with low overlap (Expands network reach by 18.2 km)",
    color: "#06b6d4",
    pathCoordinates: [
      [77.1650, 28.5910],
      [77.1300, 28.5400],
      [77.0880, 28.4950],
      [77.0266, 28.4595]
    ]
  }
];

export const INITIAL_DUTIES = [
  {
    id: "duty-534-1",
    dutyCode: "DT-LINK-534",
    dutyType: "LINKED",
    crewId: "DRV-1042",
    busId: "bus-101",
    routeId: "route-534",
    startTime: "2026-09-01T06:00:00Z",
    endTime: "2026-09-01T14:00:00Z",
    mandatoryRestEnd: "2026-09-02T01:00:00Z",
    status: "ACTIVE_SCHEDULED",
    notes: "Kashmere Gate to Saket Express run. DL 1PC 4821 dedicated."
  }
];
