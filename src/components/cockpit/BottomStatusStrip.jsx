import React, { useState, useEffect } from 'react';

export default function BottomStatusStrip() {
  const [telemetryRate, setTelemetryRate] = useState(124);
  const [latency, setLatency] = useState(41);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryRate(prev => Math.max(119, Math.min(131, prev + (Math.floor(Math.random() * 5) - 2))));
      setLatency(prev => Math.max(36, Math.min(48, prev + (Math.floor(Math.random() * 3) - 1))));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-6.5 bg-[#FAF9FC] dark:bg-[#1E1C27] border-t border-border px-3 sm:px-4 flex items-center justify-between text-[10px] font-mono text-muted-foreground select-none shrink-0 z-20">
      
      {/* Left Telemetry Cluster */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-foreground">● Dispatch Active</span>
        </div>

        <span className="text-muted-foreground/40">•</span>

        <div className="hidden sm:flex items-center space-x-1">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Scheduling Engine Operational</span>
        </div>

        <span className="text-muted-foreground/40 hidden sm:inline">•</span>

        <div className="hidden md:flex items-center space-x-1">
          <span>GPS Simulation Mode</span>
        </div>
      </div>

      {/* Right Telemetry Cluster */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <span>Telemetry:</span>
          <strong className="text-foreground">{telemetryRate} pings/s</strong>
        </div>

        <span className="text-muted-foreground/40">•</span>

        <div className="flex items-center space-x-1">
          <span>Latency:</span>
          <strong className="text-foreground">{latency}ms</strong>
        </div>
      </div>

    </footer>
  );
}
