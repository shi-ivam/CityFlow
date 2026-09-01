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
    <footer className="h-7 bg-[#212227] border-t-2 border-[#8693AB]/40 px-3 sm:px-5 flex items-center justify-between text-[11px] font-mono text-[#F1F5F9] select-none shrink-0 z-20">
      
      {/* Left Telemetry Cluster */}
      <div className="flex items-center space-x-4 overflow-hidden">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#8693AB] font-bold">Telemetry:</span>
          <span className="text-[#F1F5F9] font-black">{telemetryRate} pings/sec</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[#8693AB] font-bold">Headway Sync:</span>
          <span className="text-emerald-400 font-black">Operational</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8693AB]" />
          <span className="text-[#8693AB] font-bold">Fallback Matrix:</span>
          <span className="text-[#AAB9CF] font-black">Ready</span>
        </div>
      </div>

      {/* Right Telemetry Cluster */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[#8693AB] font-bold">GPS:</span>
          <span className="text-[#F1F5F9] font-black">98.7%</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8693AB]" />
          <span className="text-[#8693AB] font-bold">Latency:</span>
          <span className="text-[#AAB9CF] font-black">{latency}ms</span>
        </div>
      </div>

    </footer>
  );
}
