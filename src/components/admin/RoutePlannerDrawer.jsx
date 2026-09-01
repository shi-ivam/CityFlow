import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Bus, Users, Clock, Sparkles, ArrowRight } from 'lucide-react';

export default function RoutePlannerDrawer({
  isOpen,
  onClose,
  busFleet = [],
  crewMembers = [],
  onSaveRoute,
  showSuccessToast,
  selectedCity = 'chennai'
}) {
  const delhiStops = [
    'Kashmere Gate ISBT',
    'Anand Vihar ISBT',
    'Rajiv Chowk / CP',
    'Mandi House',
    'AIIMS Medical Hub',
    'Hauz Khas',
    'Saket District Centre',
    'Mehrauli Terminal',
    'Dwarka Sector 21',
    'Noida Sector 62',
    'Gurugram Bus Stand'
  ];

  const chennaiStops = [
    'Island Ground',
    'Secretariat',
    'Chepauk',
    'Q.M.C',
    'Foreshore Estate',
    'Adyar O.T.',
    'Indira Nagar',
    'Kandanchavadi',
    'Thorappakkam',
    'Karapakkam',
    'Shozhanganallur',
    'Semmancheri',
    'Navalur',
    'Kelambakkam',
    'CMBT Koyambedu',
    'Chennai Central',
    'Guindy Metro',
    'T. Nagar',
    'Tambaram'
  ];

  const stopsList = selectedCity === 'chennai' ? chennaiStops : delhiStops;

  const [wizardStep, setWizardStep] = useState(1);
  const [origin, setOrigin] = useState(stopsList[0]);
  const [destination, setDestination] = useState(stopsList[stopsList.length - 1]);
  const [viaStops, setViaStops] = useState([stopsList[2] || 'Rajiv Chowk / CP', stopsList[4] || 'AIIMS Medical Hub']);

  const [selectedBusId, setSelectedBusId] = useState(busFleet[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(crewMembers[0]?.id || '');
  const [departureTime, setDepartureTime] = useState('08:30 AM');

  const handleAddStop = () => {
    setViaStops([...viaStops, stopsList[3] || 'Mandi House']);
  };

  const handleRemoveStop = (idx) => {
    setViaStops(viaStops.filter((_, i) => i !== idx));
  };

  const handleMoveStop = (idx, dir) => {
    const newStops = [...viaStops];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;
    const temp = newStops[idx];
    newStops[idx] = newStops[targetIdx];
    newStops[targetIdx] = temp;
    setViaStops(newStops);
  };

  const handleSave = () => {
    if (onSaveRoute) {
      onSaveRoute({
        code: `${Math.floor(500 + Math.random() * 400)}`,
        name: `${origin.split(' ')[0]} → ${destination.split(' ')[0]} Express`,
        lengthKm: 26.4,
        stopsCount: viaStops.length + 2,
        busId: selectedBusId,
        driverId: selectedDriverId
      });
    }
    if (showSuccessToast) {
      showSuccessToast(`✓ ROUTE CREATED: ${origin.split(' ')[0]} → ${destination.split(' ')[0]} added to ${selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Network!`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans select-none">
      <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-modal overflow-hidden flex flex-col">
        
        {/* Header & Step Indicator */}
        <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Add Route Wizard ({selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Network)
            </h2>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            <span className={`px-2 py-0.5 rounded ${wizardStep === 1 ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}>1. Start/End</span>
            <span>→</span>
            <span className={`px-2 py-0.5 rounded ${wizardStep === 2 ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}>2. Stops</span>
            <span>→</span>
            <span className={`px-2 py-0.5 rounded ${wizardStep === 3 ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}>3. Solution</span>
          </div>
        </div>

        {/* Wizard Step 1: Start & End */}
        {wizardStep === 1 && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                Step 1: Where should the route start?
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-xs font-mono text-foreground outline-none focus:border-primary"
              >
                {stopsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                Step 2: Where should it end?
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-xs font-mono text-foreground outline-none focus:border-primary"
              >
                {stopsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Wizard Step 2: Intermediate Stops */}
        {wizardStep === 2 && (
          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-foreground">
                Step 3: Which stops should it include? ({viaStops.length} intermediate)
              </span>
              <button
                onClick={handleAddStop}
                className="text-xs font-mono text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2 rounded bg-muted/40 border border-border flex items-center justify-between text-muted-foreground">
                <span>1. {origin} (Start)</span>
                <span className="text-[10px] text-emerald-600 font-bold">START</span>
              </div>

              {viaStops.map((stop, idx) => (
                <div key={idx} className="p-2 rounded bg-card border border-border flex items-center justify-between">
                  <span>{idx + 2}. {stop}</span>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleMoveStop(idx, -1)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleMoveStop(idx, 1)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleRemoveStop(idx)} className="p-1 rounded hover:bg-muted text-rose-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-2 rounded bg-muted/40 border border-border flex items-center justify-between text-muted-foreground">
                <span>{viaStops.length + 2}. {destination} (End)</span>
                <span className="text-[10px] text-primary font-bold">END</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Step 3: CityFlow Automated Solution & Recommender */}
        {wizardStep === 3 && (
          <div className="p-5 space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-emerald-800 dark:text-emerald-300">
              <div className="font-bold flex items-center space-x-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>ROUTE READY & OPTIMIZED BY CITYFLOW</span>
              </div>
              <div className="text-muted-foreground text-xs">
                {origin.split(' ')[0]} → {destination.split(' ')[0]} Corridor • 26.4 km • 58 min • {viaStops.length + 2} Stops
              </div>
              <div className="border-t border-emerald-500/20 pt-2 space-y-1 text-xs">
                <div>✓ Recommended Bus: <strong>{busFleet[0]?.busNumber || 'DL 1PC 4821'}</strong></div>
                <div>✓ Recommended Driver: <strong>{crewMembers[0]?.name || 'Amit Sharma'}</strong></div>
                <div>✓ Recommended Departure: <strong>08:30 AM</strong></div>
                <div>✓ 0 Schedule Conflicts • 0 Rest Violations</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between font-mono text-xs">
          {wizardStep > 1 ? (
            <button
              onClick={() => setWizardStep(prev => prev - 1)}
              className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground font-medium"
            >
              Back
            </button>
          ) : (
            <button onClick={onClose} className="px-3.5 py-1.5 rounded bg-muted text-muted-foreground hover:text-foreground font-medium">
              Cancel
            </button>
          )}

          {wizardStep < 3 ? (
            <button
              onClick={() => setWizardStep(prev => prev + 1)}
              className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm flex items-center space-x-1"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-5 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition-all"
            >
              Create Route
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
