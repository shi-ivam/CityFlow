import React from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical, 
  Wrench, 
  Route, 
  Edit2, 
  CheckSquare, 
  Square,
  Bus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin
} from 'lucide-react';

export default function VehicleTable({
  vehicles = [],
  routes = [],
  crewMembers = [],
  selectedVehicleIds = [],
  onToggleSelectVehicle,
  onToggleSelectAll,
  onOpenVehicleDrawer,
  onEditVehicle,
  onAssignVehicle,
  onScheduleMaintenance,
  sortConfig = { key: 'id', direction: 'asc' },
  onSort,
  columnsConfig = {},
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalItems = 0
}) {
  const isAllSelected = vehicles.length > 0 && selectedVehicleIds.length === vehicles.length;

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 ml-1 inline" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-foreground ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-foreground ml-1 inline" />
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>In Service</span>
          </span>
        );
      case 'STANDBY_READY':
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Standby</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-rose-600 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Maintenance</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            <span>Offline</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs font-sans">
      
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          
          {/* Table Header */}
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
              
              {/* Checkbox Column */}
              <th className="py-3.5 px-4 w-10 text-center">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-foreground" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              {columnsConfig.status && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('status')}>
                  Status {renderSortIcon('status')}
                </th>
              )}

              {columnsConfig.assetId && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('id')}>
                  Asset ID {renderSortIcon('id')}
                </th>
              )}

              {columnsConfig.registration && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('busNumber')}>
                  Registration {renderSortIcon('busNumber')}
                </th>
              )}

              {columnsConfig.vehicleType && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('type')}>
                  Type {renderSortIcon('type')}
                </th>
              )}

              {columnsConfig.depot && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('depot')}>
                  Depot {renderSortIcon('depot')}
                </th>
              )}

              {columnsConfig.route && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('assignedRoute')}>
                  Route {renderSortIcon('assignedRoute')}
                </th>
              )}

              {columnsConfig.driver && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('assignedDriver')}>
                  Driver {renderSortIcon('assignedDriver')}
                </th>
              )}

              {columnsConfig.speed && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('speedKmH')}>
                  Speed {renderSortIcon('speedKmH')}
                </th>
              )}

              {columnsConfig.battery && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('batteryPct')}>
                  Battery / Range {renderSortIcon('batteryPct')}
                </th>
              )}

              {columnsConfig.odometer && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('odometerKm')}>
                  Odometer {renderSortIcon('odometerKm')}
                </th>
              )}

              {columnsConfig.nextService && (
                <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => onSort('nextServiceDate')}>
                  Next Service {renderSortIcon('nextServiceDate')}
                </th>
              )}

              {/* Row Action Column */}
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/40 font-mono">
            {vehicles.map((bus) => {
              const isSelected = selectedVehicleIds.includes(bus.id);
              const isLowBattery = (bus.batteryPct || 100) <= 25;

              return (
                <tr
                  key={bus.id}
                  onClick={() => onOpenVehicleDrawer(bus)}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                    isSelected ? 'bg-muted/40' : ''
                  }`}
                >
                  
                  {/* Row Checkbox */}
                  <td 
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectVehicle(bus.id);
                    }}
                  >
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-foreground" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Status */}
                  {columnsConfig.status && (
                    <td className="py-3.5 px-4 font-sans font-medium">
                      {getStatusBadge(bus.status)}
                    </td>
                  )}

                  {/* Asset ID */}
                  {columnsConfig.assetId && (
                    <td className="py-3.5 px-4 font-bold text-primary">
                      {bus.id}
                    </td>
                  )}

                  {/* Registration Number */}
                  {columnsConfig.registration && (
                    <td className="py-3.5 px-4 font-bold text-foreground font-mono">
                      {bus.busNumber}
                    </td>
                  )}

                  {/* Vehicle Type */}
                  {columnsConfig.vehicleType && (
                    <td className="py-3.5 px-4 text-muted-foreground font-sans text-xs">
                      {bus.type}
                    </td>
                  )}

                  {/* Depot */}
                  {columnsConfig.depot && (
                    <td className="py-3.5 px-4 text-muted-foreground font-sans text-xs">
                      {bus.depot || 'Kashmere Gate ISBT'}
                    </td>
                  )}

                  {/* Route */}
                  {columnsConfig.route && (
                    <td className="py-3.5 px-4 font-bold">
                      {bus.assignedRoute ? (
                        <span className="text-foreground">Route {bus.assignedRoute}</span>
                      ) : (
                        <span className="text-muted-foreground font-normal">Unassigned</span>
                      )}
                    </td>
                  )}

                  {/* Driver */}
                  {columnsConfig.driver && (
                    <td className="py-3.5 px-4 text-foreground font-sans text-xs">
                      {bus.assignedDriver || <span className="text-muted-foreground">Unassigned</span>}
                    </td>
                  )}

                  {/* Speed */}
                  {columnsConfig.speed && (
                    <td className="py-3.5 px-4 text-foreground">
                      {bus.speedKmH > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{bus.speedKmH} km/h</span>
                      ) : (
                        <span className="text-muted-foreground">0 km/h</span>
                      )}
                    </td>
                  )}

                  {/* Battery / Range */}
                  {columnsConfig.battery && (
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isLowBattery ? 'text-rose-500' : 'text-foreground'}`}>
                          {bus.batteryPct}%
                        </span>
                        <span className="text-muted-foreground text-[11px]">({bus.rangeKm || 180} km)</span>
                      </div>
                    </td>
                  )}

                  {/* Odometer */}
                  {columnsConfig.odometer && (
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {bus.odometerKm ? `${(bus.odometerKm / 1000).toFixed(0)}k km` : '50k km'}
                    </td>
                  )}

                  {/* Next Service */}
                  {columnsConfig.nextService && (
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {bus.nextServiceDate || '2026-09-18'}
                    </td>
                  )}

                  {/* Action */}
                  <td 
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-2 font-mono">
                      <button
                        onClick={() => onAssignVehicle(bus)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition cursor-pointer"
                        title="Assign Route / Driver"
                      >
                        <Route className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onScheduleMaintenance(bus)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition cursor-pointer"
                        title="Schedule Workshop Service"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditVehicle(bus)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition cursor-pointer"
                        title="Edit Vehicle Specs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {vehicles.length === 0 && (
              <tr>
                <td colSpan={14} className="py-12 text-center text-muted-foreground font-sans">
                  No vehicles found matching current search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
        <div>
          Showing <strong className="text-foreground">{Math.min(1 + (currentPage - 1) * pageSize, totalItems)}</strong> to <strong className="text-foreground">{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong className="text-foreground">{totalItems}</strong> assets
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="p-1 rounded bg-muted/40 border border-input text-foreground outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-border/60 hover:bg-muted text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-border/60 hover:bg-muted text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
