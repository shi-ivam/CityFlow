import React, { useState, useEffect } from 'react';

export default function BottomStatusStrip() {
  const [telemetryRate, setTelemetryRate] = useState(124);
  const [latency, setLatency] = useState(42);

  // Periodic subtle realistic fluctuation (Section 25)
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate telemetry slightly between 120 and 129
      setTelemetryRate(prev => Math.max(119, Math.min(131, prev + (Math.floor(Math.random() * 5) - 2))));
      // Fluctuate latency between 38 and 46ms
      setLatency(prev => Math.max(36, Math.min(48, prev + (Math.floor(Math.random() * 3) - 1))));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-7 bg-[#0b0f19] border-t border-[#1f2937] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none shrink-0 z-20">
      
      {/* Left Telemetry Cluster */}
      <div className="flex items-center space-x-4 overflow-hidden">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telemetry:</span>
          <span className="text-white font-bold">{telemetryRate} pings/sec</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Headway Sync:</span>
          <span className="text-emerald-400 font-bold">Operational</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Fallback Matrix:</span>
          <span className="text-indigo-300 font-bold">Ready</span>
        </div>
      </div>

      {/* Right Telemetry Cluster */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>GPS:</span>
          <span className="text-white font-bold">98.7%</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Latency:</span>
          <span className="text-cyan-300 font-bold">{latency}ms</span>
        </div>
      </div>

    </footer>
  );
}
