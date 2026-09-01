# Product Requirement Document (PRD)

**Product Name:** TransitFlow — Smart Scheduling & Route Management Engine

**Tech Stack:** React.js, Node.js (Express/Fastify), PostgreSQL (PostGIS)

---

## 1. System Architecture & Dual-View Paradigm

TransitFlow unifies crew scheduling and spatial route planning into a single reactive operational state. Changes in spatial routes immediately update duty rosters, and crew constraints dynamically flag route viability.

```
                      +----------------------------------+
                      |        React Frontend            |
                      |  (Deck.gl Map + Gantt Schedule)  |
                      +----------------------------------+
                                        |  WebSocket / REST
                      +----------------------------------+
                      |          Node.js API             |
                      |  (Constraint Engine + Spatial)  |
                      +----------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
  +-----------------------------+               +------------------------------+
  |    PostgreSQL + PostGIS     |               |    Crew Constraint Engine    |
  |  (Spatial Indexing & Routes)|               | (Rest Rules & Shift Solver)  |
  +-----------------------------+               +------------------------------+

```

---

## 2. Technical Stack & Data Schema

### Core Architecture

* **Frontend:** React.js, Deck.gl / Mapbox GL (Spatial Rendering), Redux Toolkit, TailwindCSS.
* **Backend:** Node.js, PostGraphile / Express, Turf.js (Spatial computations), OR-Tools / Custom Solver.
* **Database:** PostgreSQL 16 with PostGIS extension.

### PostgreSQL Schema Blueprint

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crew Master & Rest Tracking
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    max_weekly_hours INT DEFAULT 48,
    last_shift_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bus Routes (Spatial Lines)
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    path GEOMETRY(LineString, 4326) NOT NULL,
    buffer_meters INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bus Fleet
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE'
);

-- Duty Assignments (Linked & Unlinked)
CREATE TYPE duty_type AS ENUM ('LINKED', 'UNLINKED');
CREATE TYPE duty_status AS ENUM ('SCHEDULED', 'ACTIVE', 'CONFLICT', 'UNASSIGNED');

CREATE TABLE duty_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duty_type duty_type NOT NULL,
    crew_id UUID REFERENCES crew_members(id),
    bus_id UUID REFERENCES buses(id),
    route_id UUID REFERENCES routes(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    mandatory_rest_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status duty_status DEFAULT 'SCHEDULED',
    CONSTRAINT rest_period_check CHECK (mandatory_rest_end > end_time)
);

-- Spatial Indexing
CREATE INDEX idx_routes_path ON routes USING GIST (path);
CREATE INDEX idx_duty_times ON duty_assignments (start_time, end_time);

```

---

## 3. Feature Specifications

### 3.1 Dual Duty Scheduling Engine (Linked vs. Unlinked)

| Duty Type | Operational Definition | System Constraint Rule | Visual Indicator |
| --- | --- | --- | --- |
| **Linked Duty** | A single crew member is locked to a single bus for the entire shift duration across one or more routes. | `crew_id` and `bus_id` must maintain a 1:1 pairing across contiguous shift blocks. | **Solid Blue Border & Unified Card** on Gantt schedule. |
| **Unlinked Duty** | Crew members switch buses or routes at designated interchange hubs. | `crew_id` and `bus_id` pairs break at shift nodes. Min. 15-min handoff buffer required. | **Dashed Amber Border & Split Node Card** on Gantt schedule. |

```
Linked Duty Layout:
[ Crew A | Bus 101 ] -----------------------------> [ Continuous Shift ]

Unlinked Duty Layout:
[ Crew A | Bus 101 ] --> (15m Handoff Hub) --> [ Crew A | Bus 204 ]

```

#### Mandated Rest Period Verification

* **Rest Rule:** Every driver must receive a minimum continuous rest period (e.g., 11 hours) between duty blocks.
* **Node.js Validator:**
```javascript
function validateRestPeriod(lastShiftEnd, newShiftStart, minRestHours = 11) {
  const restMillis = minRestHours * 60 * 60 * 1000;
  const actualRest = new Date(newShiftStart) - new Date(lastShiftEnd);
  return actualRest >= restMillis;
}

```



---

### 3.2 Spatial Route Planning & Overlap Detection

The vector drawing interface allows route planners to plot or edit routes directly on the map.

```
Existing Route A -------------------
                           \  (Overlap Detected via ST_Buffer & ST_Intersection)
Proposed Route B  ==========+========

```

#### Automatic Overlap & Conflict Engine

When a user draws a proposed route ($R_{new}$), the system calculates both geographic spatial overlap and temporal schedule collision:

1. **Spatial Buffer Overlap:** Identifies shared road segments using PostGIS.
2. **Temporal Collision:** Checks if overlapping segments occur during concurrent operational hours.

```sql
-- PostGIS Spatial Overlap Calculation
SELECT 
    r.id AS existing_route_id,
    r.route_code,
    ST_Length(ST_Intersection(r.path, ST_Buffer(ST_GeomFromText($1, 4326)::geography, 50)::geometry)) AS overlap_length_meters,
    (ST_Length(ST_Intersection(r.path, ST_Buffer(ST_GeomFromText($1, 4326)::geography, 50)::geometry)) / ST_Length(r.path)) * 100 AS overlap_percentage
FROM routes r
WHERE ST_Intersects(r.path, ST_Buffer(ST_GeomFromText($1, 4326)::geography, 50)::geometry);

```

---

### 3.3 Single Unified Operational Dashboard

The user interface combines map vector rendering with a timeline view. Interacting with an element in one view highlights it in the other.

```
+-----------------------------------------------------------------------+
|                       TRANSITFLOW DASHBOARD                           |
+-----------------------------------+-----------------------------------+
|  ROUTE MAP EDITOR (Deck.gl)       |  CREW & BUS GANTT TIMELINE        |
|                                   |                                   |
|   [Route 101 - Active]            | Crew A: [ Linked: Bus 12  ]       |
|   ========\                       | Crew B: [ Unlinked: Bus 05] [Bus 8]|
|            \==== [New Route B]    | Crew C: [!! REST CONFLICT !!]     |
|             (Overlap Alert)       |                                   |
+-----------------------------------+-----------------------------------+
| METRICS & SUMMARY PANEL                                               |
| Active Routes: 24 | Crew Util: 87% | Coverage: 412 km | Conflicts: 1   |
+-----------------------------------------------------------------------+

```

* **Interactive Bidirectional Sync:** Selecting a route on the map highlights all associated driver timelines in the Gantt chart. Hovering over a duty block isolates its route segment on the map.

---

## 4. Operational Summary Analytics

The system generates aggregate metrics directly from the unified spatial and temporal database:

* **Crew Utilization Rate ($CU$):**

$$CU = \left( \frac{\sum \text{Scheduled Duty Hours}}{\sum \text{Available Contracted Hours}} \right) \times 100$$


* **Network Route Coverage:** Total unique linear kilometers served, excluding overlapping buffer segments calculated via `ST_Union(path)`.
* **Deadhead Ratio:** Percentage of non-revenue travel time incurred during unlinked duty bus switches.

---

## 5. Automated Conflict Resolution & Fallback Logic

When a scheduling conflict occurs—such as a driver being assigned without meeting the mandated rest period—the system executes a defined fallback workflow.

```
[ Scheduling Request Issued ]
              |
              v
     { Is Crew Rested? }
      /               \
   (Yes)              (No)
    /                   \
[ Assign Duty ]    [ TRIGGER FALLBACK ]
                         |
                         +---> 1. Check Reserve Standby Crew Pool
                         |         |
                         |         +--> (Available) --> Auto-Assign Standby Crew
                         |         |
                         |         +--> (Unavailable) --> Step 2
                         |
                         +---> 2. Split Duty to Unlinked Shift
                         |         |
                         |         +--> Break shift; assign Segment 1 to Crew X,
                         |              Segment 2 to Crew Y
                         |
                         +---> 3. System Flag & Escalation
                                   |
                                   +--> Render Duty as 'UNASSIGNED (RED)'
                                   +--> Alert Operations Manager Dashboard

```

### Fallback Implementation Spec

1. **Standby Auto-Assign:** The backend queries the `crew_members` table for active members whose `last_shift_end` satisfies the minimum rest threshold and who are not currently assigned to active duties.
2. **Duty Deconstruction:** If no single crew member can take the full shift, the backend converts the linked duty into an **Unlinked Duty**, splitting the shift at a transit interchange node to allow two separate drivers to complete the route within their legal hours.
3. **Hard Constraint Alert:** If no standby crew is available and splitting the shift fails, the assignment drops into an **`UNASSIGNED_CONFLICT`** state, triggering a high-priority alert on the dispatch dashboard and blocking dispatch confirmation until resolved.
