import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bus, Check, AlertCircle } from 'lucide-react';

export default function AddEditVehicleModal({
  isOpen,
  onClose,
  onSave,
  editVehicle = null,
  existingVehicles = []
}) {
  const isEditing = !!editVehicle;

  const [formData, setFormData] = useState({
    id: '',
    busNumber: '',
    type: 'Electric Low-Floor EV',
    fuelType: 'ELECTRIC',
    manufacturer: 'Tata Motors',
    model: 'Starbus EV 12m',
    year: 2024,
    capacity: 50,
    depot: 'Kashmere Gate ISBT',
    status: 'IN_SERVICE',
    assignedRoute: '',
    vin: '',
    batteryPct: 95,
    rangeKm: 200,
    odometerKm: 45000,
    speedKmH: 0,
    insuranceExpiry: '2027-04-15',
    fitnessExpiry: '2026-11-30',
    pollutionExpiry: '2026-10-15'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editVehicle) {
      setFormData({
        id: editVehicle.id || '',
        busNumber: editVehicle.busNumber || '',
        type: editVehicle.type || 'Electric Low-Floor EV',
        fuelType: editVehicle.fuelType || 'ELECTRIC',
        manufacturer: editVehicle.manufacturer || 'Tata Motors',
        model: editVehicle.model || 'Starbus EV',
        year: editVehicle.year || 2024,
        capacity: editVehicle.capacity || 50,
        depot: editVehicle.depot || 'Kashmere Gate ISBT',
        status: editVehicle.status || 'IN_SERVICE',
        assignedRoute: editVehicle.assignedRoute || '',
        vin: editVehicle.vin || '',
        batteryPct: editVehicle.batteryPct || 90,
        rangeKm: editVehicle.rangeKm || 180,
        odometerKm: editVehicle.odometerKm || 50000,
        speedKmH: editVehicle.speedKmH || 0,
        insuranceExpiry: editVehicle.compliance?.insuranceExpiry || '2027-04-15',
        fitnessExpiry: editVehicle.compliance?.fitnessExpiry || '2026-11-30',
        pollutionExpiry: editVehicle.compliance?.pollutionExpiry || '2026-10-15'
      });
    } else {
      // Auto-generate a clean new asset ID
      const newNum = existingVehicles.length + 101;
      setFormData({
        id: `bus-${newNum}`,
        busNumber: 'DL 1PC 9901',
        type: 'Electric Low-Floor EV',
        fuelType: 'ELECTRIC',
        manufacturer: 'Tata Motors',
        model: 'Starbus Ultra EV 12m',
        year: 2024,
        capacity: 50,
        depot: 'Kashmere Gate ISBT',
        status: 'STANDBY_READY',
        assignedRoute: '',
        vin: `MAT${newNum}001N8A94120`,
        batteryPct: 100,
        rangeKm: 220,
        odometerKm: 5000,
        speedKmH: 0,
        insuranceExpiry: '2027-06-30',
        fitnessExpiry: '2027-03-31',
        pollutionExpiry: '2026-12-15'
      });
    }
    setErrors({});
  }, [editVehicle, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.id.trim()) errs.id = 'Asset ID is required';
    if (!formData.busNumber.trim()) errs.busNumber = 'Registration number is required';
    if (!formData.capacity || formData.capacity <= 0) errs.capacity = 'Capacity must be positive';
    
    // Duplicate ID check if adding new
    if (!isEditing && existingVehicles.some(v => v.id.toLowerCase() === formData.id.toLowerCase())) {
      errs.id = 'Asset ID already exists in fleet';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      compliance: {
        insuranceExpiry: formData.insuranceExpiry,
        fitnessExpiry: formData.fitnessExpiry,
        pollutionExpiry: formData.pollutionExpiry,
        permitExpiry: '2028-06-30'
      }
    };

    onSave(payload);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-foreground">
      <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 lg:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Bus className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold font-mono text-foreground">
                {isEditing ? `Edit Vehicle (${formData.id})` : 'Register New Fleet Asset'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter technical parameters, Indian registration plate, depot, and compliance records.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 lg:p-6 space-y-5 font-mono text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Asset Identity */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
              1. Asset Identity &amp; Registration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Asset ID *</label>
                <input
                  type="text"
                  disabled={isEditing}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="bus-103"
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none focus:border-primary font-bold"
                />
                {errors.id && <span className="text-rose-500 text-[10px]">{errors.id}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Registration Plate *</label>
                <input
                  type="text"
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  placeholder="DL 1PC 4821"
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none focus:border-primary font-bold text-primary"
                />
                {errors.busNumber && <span className="text-rose-500 text-[10px]">{errors.busNumber}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">VIN / Chassis Number</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="MAT624001N8A94120"
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specifications */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
              2. Technical Specifications
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Powertrain / Fuel</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                >
                  <option value="ELECTRIC">Electric EV</option>
                  <option value="CNG">CNG Coach</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Vehicle Classification</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                >
                  <option value="Electric Low-Floor EV">Electric Low-Floor EV</option>
                  <option value="CNG Air-Conditioned">CNG Air-Conditioned</option>
                  <option value="Articulated 60ft EV">Articulated 60ft EV</option>
                  <option value="Electric Double-Decker">Electric Double-Decker</option>
                  <option value="Interstate AC Electric">Interstate AC Electric</option>
                  <option value="Reserve Standby EV">Reserve Standby EV</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Seating Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Tata Motors"
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Model Name</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Starbus Ultra EV"
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operations & Depot */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
              3. Operations &amp; Status
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Depot Base</label>
                <select
                  value={formData.depot}
                  onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                >
                  <option value="Kashmere Gate ISBT">Kashmere Gate ISBT</option>
                  <option value="Anand Vihar Hub">Anand Vihar Hub</option>
                  <option value="Dwarka Sector 21 Depot">Dwarka Sector 21</option>
                  <option value="Rohini Sector 14 Depot">Rohini Sector 14</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none font-bold"
                >
                  <option value="IN_SERVICE">In Service</option>
                  <option value="STANDBY_READY">Standby (Reserve)</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Assigned Route Code</label>
                <input
                  type="text"
                  value={formData.assignedRoute}
                  onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                  placeholder="534 (Optional)"
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Compliance Expiry Dates */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
              4. Compliance Certificate Expiry Dates
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Insurance Expiry</label>
                <input
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">Fitness Expiry</label>
                <input
                  type="date"
                  value={formData.fitnessExpiry}
                  onChange={(e) => setFormData({ ...formData, fitnessExpiry: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">PUC Expiry</label>
                <input
                  type="date"
                  value={formData.pollutionExpiry}
                  onChange={(e) => setFormData({ ...formData, pollutionExpiry: e.target.value })}
                  className="w-full p-2 rounded bg-muted/40 border border-input text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Register Vehicle'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
