import React, { useState } from 'react';
import { Settings, Shield, Sliders, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [minRestHours, setMinRestHours] = useState(11);
  const [bufferMeters, setBufferMeters] = useState(50);
  const [handoffMins, setHandoffMins] = useState(15);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto font-sans">
      
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase">
          <Settings className="w-3.5 h-3.5 text-primary" />
          <span>Control Parameters</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
          System Configuration & Operational Thresholds
        </h1>
        <p className="text-xs text-muted-foreground">
          Configure rest rules, PostGIS buffer tolerances, and dispatch solver constraints.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Rest Period Configuration */}
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border/50 pb-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">Mandated Driver Rest Regulations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                Minimum Continuous Rest Period (Hours)
              </label>
              <input
                type="number"
                value={minRestHours}
                onChange={(e) => setMinRestHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-muted/50 border border-input text-foreground font-mono text-sm outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Drivers must receive at least this continuous gap between shift blocks. Default: 11 hours.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                Unlinked Duty Handoff Buffer (Minutes)
              </label>
              <input
                type="number"
                value={handoffMins}
                onChange={(e) => setHandoffMins(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md bg-muted/50 border border-input text-foreground font-mono text-sm outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Minimum handover interval required when crew switches buses at interchange hubs. Default: 15 mins.
              </p>
            </div>
          </div>
        </div>

        {/* GIS Spatial Buffer Configuration */}
        <div className="bg-card border border-border rounded-lg shadow-card p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border/50 pb-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">PostGIS Spatial Overlap Buffer Settings</h2>
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
              Route Polygon Buffer Radius (Meters)
            </label>
            <input
              type="number"
              value={bufferMeters}
              onChange={(e) => setBufferMeters(Number(e.target.value))}
              className="w-full max-w-xs px-3 py-1.5 rounded-md bg-muted/50 border border-input text-foreground font-mono text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Geographic corridor buffer calculated via PostGIS <code className="font-mono text-primary">ST_Buffer(path, meters)</code>. Default: 50m.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Parameters</span>
          </button>

          {savedToast && (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration saved successfully!</span>
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
