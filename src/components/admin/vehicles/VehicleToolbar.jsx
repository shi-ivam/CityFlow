import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Columns, 
  Plus, 
  Download, 
  RefreshCw, 
  X, 
  Check, 
  Command,
  Bookmark
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
  onOpenCommandPalette,
  totalResults = 0,
  isRefreshing = false,
  density = 'compact',
  onDensityChange,
  onSelectSavedView
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSavedViewsOpen, setIsSavedViewsOpen] = useState(false);
  const [selectedSavedView, setSelectedSavedView] = useState('All Fleet');

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenCommandPalette) onOpenCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== 'ALL' && v !== '' && v !== null).length;

  const savedViews = [
    { id: 'all', name: 'All Fleet', filters: { status: 'ALL', fuelType: 'ALL', depot: 'ALL', battery: 'ALL', maintenance: 'ALL', gps: 'ALL' } },
    { id: 'active', name: 'In Service', filters: { status: 'IN_SERVICE', fuelType: 'ALL', depot: 'ALL', battery: 'ALL', maintenance: 'ALL', gps: 'ALL' } },
    { id: 'low_bat', name: 'Low Battery (<50%)', filters: { status: 'ALL', fuelType: 'ALL', depot: 'ALL', battery: 'LOW', maintenance: 'ALL', gps: 'ALL' } },
    { id: 'maint_due', name: 'Maintenance Due', filters: { status: 'ALL', fuelType: 'ALL', depot: 'ALL', battery: 'ALL', maintenance: 'DUE_THIS_WEEK', gps: 'ALL' } },
    { id: 'standby', name: 'Standby Reserve', filters: { status: 'STANDBY_READY', fuelType: 'ALL', depot: 'ALL', battery: 'ALL', maintenance: 'ALL', gps: 'ALL' } }
  ];

  const handleApplySavedView = (view) => {
    setSelectedSavedView(view.name);
    setIsSavedViewsOpen(false);
    if (onSelectSavedView) onSelectSavedView(view.filters);
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Spacious Search & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Clean Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search vehicles, routes, drivers..."
            className="w-full pl-10 pr-16 py-2.5 rounded-lg bg-card border border-border/70 text-foreground outline-none text-xs focus:border-foreground/40 transition placeholder:text-muted-foreground"
          />
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-muted/60 border border-border/50 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
            title="Command Palette (Ctrl+K)"
          >
            ⌘K
          </button>
        </div>

        {/* Clean Minimal Controls */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end font-mono text-xs">
          
          {/* Saved Views */}
          <div className="relative">
            <button
              onClick={() => { setIsSavedViewsOpen(!isSavedViewsOpen); setIsFilterOpen(false); setIsColumnsOpen(false); setIsExportOpen(false); }}
              className="px-3 py-2 rounded-lg bg-card border border-border/70 hover:border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden md:inline">{selectedSavedView}</span>
            </button>

            {isSavedViewsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 font-sans text-xs">
                <div className="text-[10px] font-mono text-muted-foreground uppercase px-2 py-1">Saved Views</div>
                <div className="space-y-0.5 font-mono">
                  {savedViews.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleApplySavedView(v)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        selectedSavedView === v.name ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{v.name}</span>
                      {selectedSavedView === v.name && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Trigger */}
          <div className="relative">
            <button
              onClick={() => { setIsFilterOpen(!isFilterOpen); setIsColumnsOpen(false); setIsExportOpen(false); setIsSavedViewsOpen(false); }}
              className={`px-3 py-2 rounded-lg border transition flex items-center space-x-1.5 cursor-pointer ${
                activeFilterCount > 0 
                  ? 'bg-primary/10 border-primary text-primary font-bold' 
                  : 'bg-card border-border/70 hover:border-border text-foreground'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-mono font-bold uppercase text-[11px] text-foreground">Filter Assets</span>
                  <button onClick={onResetFilters} className="text-primary hover:underline text-[11px] font-mono cursor-pointer">
                    Clear all
                  </button>
                </div>

                <div className="space-y-2.5 font-mono">
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase mb-1">Status</label>
                    <select
                      value={filters.status || 'ALL'}
                      onChange={(e) => onFilterChange('status', e.target.value)}
                      className="w-full p-2 rounded-lg bg-muted/40 border border-input text-foreground outline-none text-xs"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="IN_SERVICE">In Service</option>
                      <option value="STANDBY_READY">Standby (Reserve)</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OFFLINE">Offline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase mb-1">Depot</label>
                    <select
                      value={filters.depot || 'ALL'}
                      onChange={(e) => onFilterChange('depot', e.target.value)}
                      className="w-full p-2 rounded-lg bg-muted/40 border border-input text-foreground outline-none text-xs"
                    >
                      <option value="ALL">All Depots</option>
                      <option value="Kashmere Gate ISBT">Kashmere Gate ISBT</option>
                      <option value="Anand Vihar Hub">Anand Vihar Hub</option>
                      <option value="Dwarka Sector 21 Depot">Dwarka Sector 21</option>
                      <option value="Rohini Sector 14 Depot">Rohini Sector 14</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase mb-1">Powertrain</label>
                    <select
                      value={filters.fuelType || 'ALL'}
                      onChange={(e) => onFilterChange('fuelType', e.target.value)}
                      className="w-full p-2 rounded-lg bg-muted/40 border border-input text-foreground outline-none text-xs"
                    >
                      <option value="ALL">All Types</option>
                      <option value="ELECTRIC">Electric EV</option>
                      <option value="CNG">CNG Coach</option>
                      <option value="DIESEL">Diesel</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs cursor-pointer font-mono"
                  >
                    Apply ({totalResults} Results)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columns */}
          <div className="relative">
            <button
              onClick={() => { setIsColumnsOpen(!isColumnsOpen); setIsFilterOpen(false); setIsExportOpen(false); }}
              className="px-3 py-2 rounded-lg bg-card border border-border/70 hover:border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Columns className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden md:inline">Columns</span>
            </button>

            {isColumnsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl p-3 z-50 space-y-2 animate-in fade-in zoom-in-95 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <span className="font-mono font-bold uppercase text-[10px] text-foreground">Visible Columns</span>
                  <button onClick={onResetColumns} className="text-primary hover:underline text-[10px] font-mono cursor-pointer">
                    Reset
                  </button>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto font-mono text-xs">
                  {Object.entries(columnsConfig).map(([key, isVisible]) => (
                    <label key={key} className="flex items-center space-x-2 p-1 hover:bg-muted/40 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => onToggleColumn(key)}
                        className="rounded border-border text-primary focus:ring-0"
                      />
                      <span className="capitalize text-foreground">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => { setIsExportOpen(!isExportOpen); setIsFilterOpen(false); setIsColumnsOpen(false); }}
              className="px-3 py-2 rounded-lg bg-card border border-border/70 hover:border-border text-foreground transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95 font-mono text-xs">
                <button
                  onClick={() => { onExport('csv'); setIsExportOpen(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => { onExport('json'); setIsExportOpen(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => { onExport('print'); setIsExportOpen(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition cursor-pointer"
                >
                  Print Roster
                </button>
              </div>
            )}
          </div>

          {/* Add Vehicle Button */}
          <button
            onClick={onAddVehicle}
            className="px-4 py-2 rounded-lg bg-foreground text-background font-bold hover:opacity-90 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>

        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs pt-1">
          <span className="text-muted-foreground text-[11px]">{totalResults} matched:</span>
          
          {filters.status !== 'ALL' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/60 text-foreground border border-border/60 text-[11px]">
              <span>Status: {filters.status}</span>
              <button onClick={() => onFilterChange('status', 'ALL')} className="ml-1.5 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.depot !== 'ALL' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/60 text-foreground border border-border/60 text-[11px]">
              <span>Depot: {filters.depot}</span>
              <button onClick={() => onFilterChange('depot', 'ALL')} className="ml-1.5 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.fuelType !== 'ALL' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/60 text-foreground border border-border/60 text-[11px]">
              <span>Fuel: {filters.fuelType}</span>
              <button onClick={() => onFilterChange('fuelType', 'ALL')} className="ml-1.5 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-primary hover:underline text-[11px] font-bold ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

    </div>
  );
}
