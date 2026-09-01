import React from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  Zap, 
  Fuel, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit2,
  Calendar
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
  const isIndeterminate = selectedVehicleIds.length > 0 && selectedVehicleIds.length < vehicles.length;

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 ml-1 inline" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary ml-1 inline" />
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_SERVICE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            In Service
          </span>
        );
      case 'STANDBY_READY':
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            Standby
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3 mr-1 text-rose-500" />
            Maintenance
          </span>
        );
      case 'INSPECTION_DUE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/30">
            <AlertTriangle className="w-3 h-3 mr-1 text-orange-500" />
            Inspection Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          
          <thead>
            <tr className="bg-muted/60 border-b border-border text-muted-foreground font-mono uppercase text-[11px] font-semibold tracking-wider select-none">
              
              {/* Checkbox */}
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => el && (el.indeterminate = isIndeterminate)}
                  onChange={onToggleSelectAll}
                  className="accent-primary rounded cursor-pointer"
                />
              </th>

              {columnsConfig.status && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('status')}>
                  Status {renderSortIndicator('status')}
                </th>
              )}

              {columnsConfig.assetId && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('id')}>
                  Asset ID {renderSortIndicator('id')}
                </th>
              )}

              {columnsConfig.registration && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('busNumber')}>
                  Registration {renderSortIndicator('busNumber')}
                </th>
              )}

              {columnsConfig.vehicleType && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('type')}>
                  Vehicle Type {renderSortIndicator('type')}
                </th>
              )}

              {columnsConfig.depot && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('depot')}>
                  Depot {renderSortIndicator('depot')}
                </th>
              )}

              {columnsConfig.route && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('assignedRoute')}>
                  Route {renderSortIndicator('assignedRoute')}
                </th>
              )}

              {columnsConfig.driver && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('assignedDriver')}>
                  Driver {renderSortIndicator('assignedDriver')}
                </th>
              )}

              {columnsConfig.speed && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('speedKmH')}>
                  Speed {renderSortIndicator('speedKmH')}
                </th>
              )}

              {columnsConfig.battery && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('batteryPct')}>
                  Battery / Fuel {renderSortIndicator('batteryPct')}
                </th>
              )}

              {columnsConfig.odometer && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('odometerKm')}>
                  Odometer {renderSortIndicator('odometerKm')}
                </th>
              )}

              {columnsConfig.nextService && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('nextServiceDate')}>
                  Next Service {renderSortIndicator('nextServiceDate')}
                </th>
              )}

              {columnsConfig.lastGpsUpdate && (
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSort('lastGpsUpdate')}>
                  Last GPS {renderSortIndicator('lastGpsUpdate')}
                </th>
              )}

              <th className="p-3 text-right">Actions</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {vehicles.map((bus) => {
              const isSelected = selectedVehicleIds.includes(bus.id);
              const isLowBattery = bus.batteryPct <= 25;

              return (
                <tr
                  key={bus.id}
                  className={`group hover:bg-muted/30 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  
                  {/* Select Checkbox */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectVehicle(bus.id)}
                      className="accent-primary rounded cursor-pointer"
                    />
                  </td>

                  {/* Status */}
                  {columnsConfig.status && (
                    <td className="p-3 cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {getStatusBadge(bus.status)}
                    </td>
                  )}

                  {/* Asset ID */}
                  {columnsConfig.assetId && (
                    <td className="p-3 font-mono font-bold text-foreground cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.id}
                    </td>
                  )}

                  {/* Registration Number */}
                  {columnsConfig.registration && (
                    <td className="p-3 font-mono font-bold text-primary cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.busNumber}
                    </td>
                  )}

                  {/* Vehicle Type & Specs */}
                  {columnsConfig.vehicleType && (
                    <td className="p-3 text-foreground cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      <div>{bus.type}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {bus.capacity} Seats • {bus.manufacturer || 'EV'}
                      </div>
                    </td>
                  )}

                  {/* Depot Location */}
                  {columnsConfig.depot && (
                    <td className="p-3 text-muted-foreground font-mono text-[11px] cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.depot || 'Kashmere Gate ISBT'}
                    </td>
                  )}

                  {/* Assigned Route */}
                  {columnsConfig.route && (
                    <td className="p-3 cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.assignedRoute ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono text-[11px] font-semibold">
                          Route {bus.assignedRoute}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-mono italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                  )}

                  {/* Assigned Driver */}
                  {columnsConfig.driver && (
                    <td className="p-3 text-foreground font-medium cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.assignedDriver ? (
                        <div>
                          <span>{bus.assignedDriver}</span>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {bus.driverId || 'DRV-OK'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs font-mono italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                  )}

                  {/* Speed */}
                  {columnsConfig.speed && (
                    <td className="p-3 font-mono cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.speedKmH > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {bus.speedKmH} km/h
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0 km/h (Stationary)</span>
                      )}
                    </td>
                  )}

                  {/* Battery / Fuel */}
                  {columnsConfig.battery && (
                    <td className="p-3 cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      <div className="flex items-center space-x-2 font-mono">
                        {bus.fuelType === 'CNG' ? (
                          <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Zap className={`w-3.5 h-3.5 ${isLowBattery ? 'text-rose-500' : 'text-emerald-500'}`} />
                        )}
                        <span className={`font-bold ${isLowBattery ? 'text-rose-500' : 'text-foreground'}`}>
                          {bus.batteryPct}%
                        </span>
                      </div>
                      <div className="w-16 bg-muted h-1 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${bus.batteryPct}%` }}
                          className={`h-full ${isLowBattery ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </td>
                  )}

                  {/* Odometer */}
                  {columnsConfig.odometer && (
                    <td className="p-3 font-mono text-muted-foreground cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      {bus.odometerKm ? `${bus.odometerKm.toLocaleString()} km` : '—'}
                    </td>
                  )}

                  {/* Next Service Date */}
                  {columnsConfig.nextService && (
                    <td className="p-3 font-mono text-[11px] cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      <div className="text-foreground font-medium">{bus.nextServiceDate || '2026-09-24'}</div>
                      <div className="text-[10px] text-muted-foreground">Periodic Inspection</div>
                    </td>
                  )}

                  {/* Last GPS Update */}
                  {columnsConfig.lastGpsUpdate && (
                    <td className="p-3 font-mono text-muted-foreground text-[11px] cursor-pointer" onClick={() => onOpenVehicleDrawer(bus)}>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{bus.lastGpsUpdate || '12 sec ago'}</span>
                      </div>
                    </td>
                  )}

                  {/* Action Menu Buttons */}
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onOpenVehicleDrawer(bus)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
                        title="View Vehicle Telemetry Drawer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditVehicle(bus)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
                        title="Edit Vehicle Specs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onAssignVehicle(bus)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
                        title="Assign Route & Driver"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {vehicles.length === 0 && (
              <tr>
                <td colSpan={14} className="p-10 text-center text-muted-foreground font-sans">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="text-sm font-bold text-foreground">No fleet vehicles found</div>
                    <div className="text-xs text-muted-foreground">
                      No vehicles match your active search terms or filter criteria.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-3 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="p-1 rounded bg-card border border-input text-foreground text-xs outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} assets
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-2 py-1 rounded bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 transition flex items-center space-x-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-muted-foreground font-bold px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 rounded bg-card border border-border text-foreground hover:bg-muted disabled:opacity-40 transition flex items-center space-x-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
