# CityFlow / TransitFlow (V-02)
### Smart Scheduling & Spatial Route Management Engine for City Bus Networks

> **Unified Operational Picture:** Eliminating the silo between crew-to-bus scheduling and spatial GIS route planning.

---

## 🚌 Overview & Core Paradigm

**CityFlow** treats crew-to-bus assignments and spatial route planning as **two views of one reactive operational state**. 
- Spatial vector route changes immediately re-validate shift rosters.
- Driver rest constraints dynamically test route viability.

---

## 🌟 Key Features Delivered

### 1. Unified Dual-View Operational Dashboard
- **Synchronized Split View:** Interactive Leaflet GIS Map on the left, Crew & Bus Gantt Timeline on the right.
- **Bi-directional Cross-Sync:**
  - Hovering or selecting a route on the map highlights corresponding crew assignments, buses, and Gantt timeline blocks in real time.
  - Hovering or clicking a duty card on the Gantt highlights that route path, bus position, and interchange transfer nodes on the spatial map.

### 2. Dual Duty Scheduling Engine (Linked vs. Unlinked)
- **Linked Duty (1:1 Bus Lock):** A single crew member is locked to a single bus for the entire shift duration across routes. Displayed with a **solid blue border** (`#0ea5e9`) and locked 1:1 badge.
- **Unlinked Duty (Interchange Hub Transfer):** Crew members switch buses or routes at designated interchange hubs. Displayed with a **dashed amber border** (`#f59e0b`) and a prominent **15-minute handoff buffer node** at the interchange transfer hub (`Central Metro Plaza Hub`, `North Terminal`, etc.).

### 3. Mandated Rest Period Verification (11-Hour Rule)
- Continuous tracking of driver prior shift conclusion (`lastShiftEnd`) vs. new shift start (`startTime`).
- Shift assignments scheduled with less than the mandated 11 hours of continuous rest are visually flagged with **glowing crimson violation alerts** (`#f43f5e`), displaying the exact rest deficit (e.g. `Deficit: 4h 30m / Actual: 6h 30m`).

### 4. Spatial Route Map & Overlap GIS Detection Engine
- **Interactive Vector Route Placer:** Planners can click on the map to place waypoints, plot proposed express links, and adjust nodes in real time.
- **50-Meter Corridor Buffer Calculation:** Computes PostGIS-style corridor buffers (`turf.buffer(line, 50m)`).
- **Automated Overlap & Conflict HUD:**
  - Evaluates spatial intersection and overlapping road mileage (km and %).
  - Classifies corridor congestion (`OPTIMAL <15%`, `MODERATE 15-40%`, `CRITICAL >40%`).
  - Flags timetable headway clashes and bus bunching risks on shared road segments.
  - One-click commit to active network with instant coverage recalculation.

### 5. Automated 3-Tier Fallback Solver Protocol
When a rest period violation or crew unavailability occurs, the system provides a deterministic 3-tier fallback resolution workflow:
- **Tier 1 (Reserve Standby Pool Auto-Assign):** Queries the reserve standby pool for qualified drivers who meet the $\ge 11$h rest requirement. One-click instant assignment with zero service interruption.
- **Tier 2 (Duty Deconstruction & Unlinked Split):** Splits the continuous shift into two unlinked duty segments at a primary interchange hub with a 15-minute handoff buffer.
- **Tier 3 (Escalated Dispatch Lock & Mitigation):** Flags assignment in `UNASSIGNED_CONFLICT_LOCKED` state, blocking dispatch confirmation until authorized with a supervisor waiver or headway relaxation.

### 6. Operational Summary & Performance KPI Dashboard
Generates real-time metrics directly from the underlying spatial and temporal data:
- **Crew Utilization Rate ($CU$):**
  $$CU = \left( \frac{\sum \text{Scheduled Duty Hours}}{\sum \text{Available Contracted Hours}} \right) \times 100$$
- **Unique Linear Route Coverage:** Deduplicated network linear kilometers served, calculated using corridor buffer unions.
- **Deadhead Ratio:** Percentage of non-revenue travel/buffer time incurred during unlinked duty bus switches.
- **Fleet EV Readiness & Battery Trackers:** Real-time state of charge (SoC) and vehicle assignment tracking.
- **KPI Export:** Downloadable JSON operational audit telemetry.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Spatial GIS & Geometry:** Leaflet.js, Turf.js (`@turf/turf`)
- **State Management:** Reactive bidirectional state engine with real-time operational clock simulation (1x, 5x, 15x speeds)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Build for Production
```bash
npm run build
```
