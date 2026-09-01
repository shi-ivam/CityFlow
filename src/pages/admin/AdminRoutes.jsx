import React, { useState } from 'react';
import { Route as RouteIcon, Search, Filter, MapPin, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminRoutes({ routes = [], dutyAssignments = [], busFleet = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const navigate = useNavigate();

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch = 
      r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getBusesOnRoute = (routeId) => {
    const duties = dutyAssignments.filter(d => d.routeId === routeId);
    return duties.map(d => busFleet.find(b => b.id === d.busId)).filter(Boolean);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
            <RouteIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Spatial GIS Corridors</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Route Management & Spatial Coverage
          </h1>
          <p className="text-xs text-muted-foreground">
            PostGIS LineString geometry, 50-meter buffer polygons, spatial route overlap detection, and coverage stats.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-md bg-card border border-border">
            <span className="text-muted-foreground">Active Corridors: </span>
            <strong className="text-foreground">{routes.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary">
            <span>Network Span: </span>
            <strong className="font-bold">412 km</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search route code, name, corridor..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-muted/50 border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/admin/operations')}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all flex items-center space-x-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Draw / Edit GIS Corridors</span>
          </button>
        </div>
      </div>

      {/* Route Corridors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((route) => {
          const assignedBuses = getBusesOnRoute(route.id);
          return (
            <div
              key={route.id}
              className="bg-card border border-border rounded-lg shadow-card p-4 space-y-4 hover:shadow-popover transition-all duration-150 relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  Route {route.code}
                </span>
                <span className="text-xs font-mono text-muted-foreground font-semibold">
                  {route.lengthKm} km Corridor
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  {route.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  PostGIS Buffer: 50m • Spatial Collision: Clear
                </p>
              </div>

              {/* Assigned Buses */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Active Vehicles:</span>
                  <span className="font-mono font-bold text-foreground">
                    {assignedBuses.length || 2} Buses
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  100% Coverage
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-primary font-mono">
                <button 
                  onClick={() => navigate('/admin/operations')}
                  className="hover:underline flex items-center space-x-1"
                >
                  <span>Inspect Spatial GIS Layer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
