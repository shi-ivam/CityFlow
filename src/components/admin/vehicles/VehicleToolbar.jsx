import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  RefreshCw, 
  Columns, 
  X, 
  SlidersHorizontal, 
  Check,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react';

export default function VehicleToolbar({
  searchTerm = '',
  onSearchChange,
  filters = {},
  onFilterChange,
  onResetFilters,
  columnsConfig = {},
  onToggleColumn,
  onResetColumns,
  onRefresh,
  onAddVehicle,
  onExport,
  totalResults = 0,
  isRefreshing = false
}) {
  const searchInputRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeFilterList = [];
  if (filters.status && filters.status !== 'ALL') {
    activeFilterList.push({ key: 'status', label: `Status: ${filters.status.replace('_', ' ')}` });
  }
  if (filters.fuelType && filters.fuelType !== 'ALL') {
    activeFilterList.push({ key: 'fuelType', label: `Type: ${filters.fuelType}` });
  }
  if (filters.depot && filters.depot !== 'ALL') {
    activeFilterList.push({ key: 'depot', label: `Depot: ${filters.depot}` });
  }
  if (filters.battery && filters.battery !== 'ALL') {
    activeFilterList.push({ key: 'battery', label: `Battery: ${filters.battery}` });
  }
  if (filters.maintenance && filters.maintenance !== 'ALL') {
    activeFilterList.push({ key: 'maintenance', label: `Maintenance: ${filters.maintenance}` });
  }
  if (filters.gps && filters.gps !== 'ALL') {
    activeFilterList.push({ key: 'gps', label: `GPS: ${filters.gps}` });
  }

  return (
    <div className="space-y-3 font-sans">
      
      {/* Primary Toolbar Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
        
        {/* Left: Search Box with Ctrl+K */}
        <div className="flex items-center space-x-2 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search vehicle ID, registration number, route, driver, depot..."
              className="w-full pl-9 pr-14 py-1.5 rounded-md bg-muted/40 border border-input text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card transition font-sans"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border">
              <span>⌘</span><span>K</span>
            </div>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-1.5 rounded-md border text-xs font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
              isFilterOpen || activeFilterList.length > 0
                ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                : 'bg-card border-border text-foreground hover:bg-muted/50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-foreground text-primary text-[10px] font-bold flex items-center justify-center">
                {activeFilterList.length}
              </span>
            )}
          </button>
        </div>

        {/* Right: Actions, Column Selector & Add Vehicle */}
        <div className="flex items-center justify-end space-x-2 shrink-0 font-mono text-xs">
          
          {/* Column Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
              className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-muted/50 transition flex items-center space-x-1.5 cursor-pointer"
              title="Customize Visible Columns"
            >
              <Columns className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden md:inline">Columns</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {isColumnPickerOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl p-2 z-50 space-y-1 text-xs">
                <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                  <span>Visible Columns</span>
                  <button 
                    onClick={onResetColumns} 
                    className="text-primary text-[10px] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                {Object.entries(columnsConfig).map(([key, isVisible]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 cursor-pointer text-foreground"
                  >
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => onToggleColumn(key)}
                      className="accent-primary rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-muted/50 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden md:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-lg shadow-xl p-1 z-50 space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    onExport('csv');
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left hover:bg-muted/50 text-foreground transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    onExport('json');
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left hover:bg-muted/50 text-foreground transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => {
                    onExport('print');
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-left hover:bg-muted/50 text-foreground transition"
                >
                  <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Print Roster</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Vehicle Primary CTA */}
          <button
            onClick={onAddVehicle}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:opacity-90 transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>

        </div>

      </div>

      {/* Expandable Advanced Filters Tray */}
      {isFilterOpen && (
        <div className="bg-card border border-border rounded-lg p-4 shadow-xs space-y-4 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-foreground uppercase tracking-wider flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Advanced Filter Matrix</span>
            </span>
            <button
              onClick={onResetFilters}
              className="text-primary hover:underline text-[11px] font-bold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Status Filter */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Status
              </label>
              <select
                value={filters.status || 'ALL'}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full p-1.5 rounded bg-muted/40 border border-input text-foreground text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_SERVICE">In Service</option>
                <option value="STANDBY_READY">Standby (Reserve)</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INSPECTION_DUE">Inspection Due</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            {/* Fuel / Vehicle Type */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Vehicle Type
              </label>
              <select
                value={filters.fuelType || 'ALL'}
                onChange={(e) => onFilterChange('fuelType', e.target.value)}
                className="w-full p-1.5 rounded bg-muted/40 border border-input text-foreground text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Types</option>
                <option value="ELECTRIC">Electric EV</option>
                <option value="CNG">CNG Coach</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            {/* Depot Filter */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Depot Location
              </label>
              <select
                value={filters.depot || 'ALL'}
                onChange={(e) => onFilterChange('depot', e.target.value)}
                className="w-full p-1.5 rounded bg-muted/40 border border-input text-foreground text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Depots</option>
                <option value="Kashmere Gate ISBT">Kashmere Gate ISBT</option>
                <option value="Anand Vihar Hub">Anand Vihar Hub</option>
                <option value="Dwarka Sector 21 Depot">Dwarka Sector 21</option>
                <option value="Rohini Sector 14 Depot">Rohini Sector 14</option>
              </select>
            </div>

            {/* Battery / Fuel State */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Battery / Fuel
              </label>
              <select
                value={filters.battery || 'ALL'}
                onChange={(e) => onFilterChange('battery', e.target.value)}
                className="w-full p-1.5 rounded bg-muted/40 border border-input text-foreground text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Levels</option>
                <option value="CRITICAL">Critical (&lt; 20%)</option>
                <option value="LOW">Low (20% - 50%)</option>
                <option value="NORMAL">Normal (&gt; 50%)</option>
              </select>
            </div>

            {/* Maintenance State */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                Maintenance
              </label>
              <select
                value={filters.maintenance || 'ALL'}
                onChange={(e) => onFilterChange('maintenance', e.target.value)}
                className="w-full p-1.5 rounded bg-muted/40 border border-input text-foreground text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Schedules</option>
                <option value="DUE_THIS_WEEK">Due within 15 Days</option>
                <option value="HEALTHY">Up to Date</option>
              </select>
            </div>

            {/* GPS Telemetry Status */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                GPS Connection
              </label>
              <select
                value={filters.gps || 'ALL'}
                onChange={(e) => onFilterChange('gps', e.target.value)}
                className="w-full p-1.5 rounded bg-muted/40 border border-input text-foreground text-xs outline-none focus:border-primary"
              >
                <option value="ALL">All Connections</option>
                <option value="ONLINE">Online (Live)</option>
                <option value="STALE">Stale (&gt; 5 min)</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* Active Filter Chips Bar */}
      {activeFilterList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-[11px] text-muted-foreground">Active Filters:</span>
          {activeFilterList.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
            >
              <span>{f.label}</span>
              <button
                onClick={() => onFilterChange(f.key, 'ALL')}
                className="hover:opacity-75 transition cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onResetFilters}
            className="text-[11px] text-muted-foreground hover:text-foreground underline transition cursor-pointer ml-1"
          >
            Clear all
          </button>
          <span className="text-muted-foreground text-[11px] ml-auto">
            Showing {totalResults} matches
          </span>
        </div>
      )}

    </div>
  );
}
