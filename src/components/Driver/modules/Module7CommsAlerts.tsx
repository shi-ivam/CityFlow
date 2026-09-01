import React, { useState } from 'react';
import {
  Radio,
  Bell,
  Volume2,
  AlertTriangle,
  Send,
  CheckCircle2,
  Shield,
  Flame,
  Truck,
  Stethoscope,
  VolumeX,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'CRITICAL' | 'SHIFT' | 'SAFETY' | 'DISPATCH';
  title: string;
  body: string;
  timeAgo: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'SHIFT',
    title: 'Upcoming Shift Roster Assigned',
    body: 'Tomorrow Morning shift (06:00 - 14:00) on Route 29C with Bus TN-01-N-9024 confirmed.',
    timeAgo: '12m ago',
    unread: true,
  },
  {
    id: 'n2',
    category: 'SAFETY',
    title: 'Fatigue Advisory Warning',
    body: 'Continuous driving hours reached 75% threshold. Mandatory 15-minute rest recommended.',
    timeAgo: '35m ago',
    unread: true,
  },
  {
    id: 'n3',
    category: 'DISPATCH',
    title: 'Route Detour Assistance Completed',
    body: 'Saidapet passenger overflow resolved. Resumed standard timetable with +4 min adjustment.',
    timeAgo: '1h ago',
    unread: false,
  },
  {
    id: 'n4',
    category: 'CRITICAL',
    title: 'Approaching Changeover Hub',
    body: 'Inter-district route segment 1 changeover at Tindivanam Hub scheduled in 15 km.',
    timeAgo: '2h ago',
    unread: false,
  },
];

interface QuickCode {
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  severity: 'high' | 'medium' | 'normal';
}

const QUICK_CODES: QuickCode[] = [
  { code: '10-33', label: 'Emergency / Collision Incident', icon: Flame, severity: 'high' },
  { code: '10-50', label: 'Heavy Traffic Gridlock', icon: Truck, severity: 'medium' },
  { code: '10-70', label: 'Route Blocked / Obstruction', icon: AlertTriangle, severity: 'medium' },
  { code: '10-80', label: 'Mechanical / Vehicle Fault', icon: Shield, severity: 'medium' },
  { code: '10-99', label: 'Passenger Medical Assistance', icon: Stethoscope, severity: 'high' },
];

export const Module7CommsAlerts: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [chimePlaying, setChimePlaying] = useState<boolean>(false);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleBroadcastCode = (qc: QuickCode) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setLastBroadcast(`Broadcast [${qc.code}: ${qc.label}] sent to Central Dispatch at ${timeStr} IST. Status: ACKNOWLEDGED.`);
  };

  const handleTestChime = () => {
    setChimePlaying(true);
    setTimeout(() => {
      setChimePlaying(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Direct Dispatcher Quick-Comms Broadcast Matrix */}
      <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Dispatcher Quick-Comms (10-Codes)
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-secondary text-foreground font-medium rounded-sm text-[10px] border border-border">
            Instant Broadcast
          </span>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed mb-3 font-sans">
          One-touch dispatch standard situation codes to Central Operations Desk:
        </p>

        <div className="space-y-1.5 mb-3">
          {QUICK_CODES.map((qc) => {
            const Icon = qc.icon;
            const isHigh = qc.severity === 'high';
            return (
              <button
                key={qc.code}
                onClick={() => handleBroadcastCode(qc)}
                className={`w-full p-2.5 rounded-sm border transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                  isHigh
                    ? 'bg-secondary/30 hover:bg-secondary/60 border-border text-foreground'
                    : 'bg-secondary/20 hover:bg-secondary/50 border-border text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isHigh ? 'text-destructive' : 'text-foreground'}`} />
                  <div>
                    <strong className="text-foreground">{qc.code}</strong>
                    <span className="text-muted-foreground ml-2">{qc.label}</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Live Broadcast Feedback */}
        {lastBroadcast && (
          <div className="p-2.5 bg-secondary/40 rounded-sm border border-border text-[11px] text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
            <span>{lastBroadcast}</span>
          </div>
        )}
      </div>

      {/* 2. Real-Time Operational Notification Feed */}
      <div className="bg-card border border-border p-4 rounded-md font-sans">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
              In-App Notification Feed
            </h3>
          </div>
          <button
            onClick={markAllRead}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {notifications.map((n) => {
            const isCrit = n.category === 'CRITICAL';
            const isShift = n.category === 'SHIFT';
            const isSafety = n.category === 'SAFETY';

            return (
              <div
                key={n.id}
                className={`p-3 rounded-sm border text-xs transition-colors ${
                  n.unread
                    ? 'bg-secondary/40 border-border'
                    : 'bg-secondary/15 border-border opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-mono">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-sm uppercase border ${
                      isCrit
                        ? 'bg-destructive text-destructive-foreground border-destructive'
                        : isSafety
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-secondary text-foreground border-border'
                    }`}
                  >
                    {n.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{n.timeAgo}</span>
                </div>

                <div className="font-semibold text-foreground mt-1">{n.title}</div>
                <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{n.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Audio & Chime Alert Settings */}
      <div className="bg-card border border-border p-4 rounded-md font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-foreground" />
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
              Auditory Signals & Priority Chimes
            </h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Audio Engine</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5 font-sans">
            <span className="text-foreground font-medium block text-xs">Critical Dispatch Audio Signals</span>
            <span className="text-[10px] text-muted-foreground font-mono">High-priority pulse on emergency detour and rest alert</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={handleTestChime}
              className="px-2.5 py-1 bg-secondary hover:bg-accent text-foreground rounded-sm border border-border text-[11px] cursor-pointer active:scale-[0.98]"
            >
              {chimePlaying ? 'Playing Signal...' : 'Test Signal'}
            </button>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-1.5 rounded-sm border transition-colors cursor-pointer active:scale-[0.98] ${
                audioEnabled
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-secondary text-muted-foreground border-border'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
