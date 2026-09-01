import React, { useEffect, useRef } from 'react';
import { ActiveBus, TransitRoute } from '../../types/transit';
import { Radio, X, ChevronRight, Zap } from 'lucide-react';

interface DriverTransitionOverlayProps {
  bus: ActiveBus;
  route?: TransitRoute;
  stage: 'intercept' | 'rear_zoom' | 'cockpit_warp' | 'complete';
  onCancel: () => void;
  onSkip: () => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
  size: number;
  speedMultiplier: number;
}

export const DriverTransitionOverlay: React.FC<DriverTransitionOverlayProps> = ({
  bus,
  route,
  stage,
  onCancel,
  onSkip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const routeName = route?.name || `Route ${bus.routeCode}`;

  const isWarp = stage === 'cockpit_warp';
  const isRearZoom = stage === 'rear_zoom' || stage === 'cockpit_warp';

  // 60FPS Clean Hyperloop Light Streaks Canvas (Pure Alpha Transparency - Zero Blue Screen Tint)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = 300;
    const particles: Particle[] = [];
    // Clean, crisp luminous white, silver and subtle ice photon colors (No muddy blue wash)
    const colors = [
      '#ffffff',
      'rgba(255, 255, 255, 0.95)',
      'rgba(240, 249, 255, 0.9)',
      '#e0f2fe',
      'rgba(186, 230, 253, 0.85)',
      '#ffffff',
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000,
        pz: 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1,
        speedMultiplier: Math.random() * 0.4 + 0.8,
      });
    }

    let ringZ = [250, 500, 750, 1000];

    const renderWormhole = () => {
      // 100% Clear transparent background - reveals map & 3D bus model with zero blue veil
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Base speed scaled for balanced 2.25s duration
      let baseSpeed = 10;
      if (stage === 'intercept') baseSpeed = 6;
      if (stage === 'rear_zoom') baseSpeed = 22;
      if (stage === 'cockpit_warp') baseSpeed = 50;

      // 1. Draw Clean Subtle Hyperloop Depth Rings
      if (isRearZoom) {
        for (let r = 0; r < ringZ.length; r++) {
          ringZ[r] -= baseSpeed * 1.1;
          if (ringZ[r] <= 10) ringZ[r] = 1000;

          const z = ringZ[r];
          const k = 400 / z;
          const radius = Math.min(width, height) * 0.42 * k;
          const alpha = Math.min(0.4, (1 - z / 1000) * (isWarp ? 0.6 : 0.35));

          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0, radius), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, 2.5 * k);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.stroke();
        }
      }

      // 2. Draw Hyperloop Light Streaks
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pz = p.z;
        p.z -= baseSpeed * p.speedMultiplier;

        if (p.z <= 1) {
          p.z = 1000;
          p.pz = 1000;
          p.x = (Math.random() - 0.5) * width * 2.2;
          p.y = (Math.random() - 0.5) * height * 2.2;
        }

        const k = 350 / p.z;
        const pk = 350 / p.pz;

        const x = p.x * k + cx;
        const y = p.y * k + cy;
        const px = p.x * pk + cx;
        const py = p.y * pk + cy;

        if (x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50) {
          const alpha = Math.min(1, (1 - p.z / 1000) * (isWarp ? 0.95 : 0.75));

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.lineWidth = Math.max(1, p.size * k * (isWarp ? 1.8 : 1.1));
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // 3. Crisp Focal Light Glow at Center Vanishing Point
      if (isRearZoom) {
        const glowRadius = isWarp ? 100 : 45;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        grad.addColorStop(0, isWarp ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(0.4, isWarp ? 'rgba(224, 242, 254, 0.4)' : 'rgba(224, 242, 254, 0.2)');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle white flash at the very end of warp
      if (isWarp) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(renderWormhole);
    };

    animId = requestAnimationFrame(renderWormhole);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [stage, isRearZoom, isWarp]);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-4 md:p-8 overflow-hidden font-mono">
      {/* 60FPS Clean Transparent Hyperloop Canvas (Zero Blue Screen Cast) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top Bar: Clean Target Telemetry Header */}
      <div className="relative z-50 flex items-start justify-between w-full pointer-events-auto">
        {/* Left: Minimal Pilot Info Card */}
        <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl p-3.5 rounded-lg max-w-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2 text-foreground text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Pilot Focus // Trajectory Lock</span>
          </div>

          <div className="text-foreground text-sm font-bold flex items-center gap-2">
            <span>{bus.driverName}</span>
            <span className="text-muted-foreground text-xs font-normal">({bus.driverId})</span>
          </div>

          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
            <span>
              Route: <strong className="text-foreground">{bus.routeCode}</strong>
            </span>
            <span>•</span>
            <span>
              Bus: <strong className="text-foreground">{bus.id}</strong>
            </span>
          </div>

          {/* Clean Progress Line */}
          <div className="mt-2 w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300 rounded-full"
              style={{
                width:
                  stage === 'intercept' ? '40%' : stage === 'rear_zoom' ? '80%' : '100%',
              }}
            />
          </div>
        </div>

        {/* Right: Abort / Skip Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-card/95 hover:bg-foreground hover:text-background text-foreground backdrop-blur-md border border-border rounded text-xs font-bold shadow-lg transition-all cursor-pointer"
            title="Instant Jump to Driver Portal"
          >
            <span>Skip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onCancel}
            className="flex items-center justify-center p-1.5 bg-card/95 hover:bg-destructive hover:text-destructive-foreground text-foreground backdrop-blur-md border border-border rounded shadow-lg transition-all cursor-pointer"
            title="Cancel Transition (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Subtitle Pill (Clean & Minimal) */}
      <div className="relative z-40 self-center flex flex-col items-center justify-center pointer-events-none">
        <div className="px-3.5 py-1 bg-card/95 backdrop-blur-md border border-border rounded text-foreground text-xs font-mono font-bold tracking-wider uppercase shadow-xl animate-pulse">
          {stage === 'intercept' && '>> ALIGNING 3D TRAJECTORY <<'}
          {stage === 'rear_zoom' && '>> HYPERLOOP LIGHT TUNNEL <<'}
          {stage === 'cockpit_warp' && '>> WARPING INTO DRIVER DECK <<'}
        </div>
      </div>

      {/* Bottom Telemetry HUD Ribbon */}
      <div className="relative z-50 w-full max-w-xl mx-auto bg-card/95 backdrop-blur-md border border-border shadow-2xl p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs pointer-events-auto font-mono">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-secondary text-foreground flex items-center justify-center border border-border">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">CORRIDOR</div>
            <div className="font-bold text-foreground truncate max-w-xs">{routeName}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] text-muted-foreground">SPEED</div>
            <div className="font-bold text-foreground">{bus.speedKmH} km/h</div>
          </div>
          <div className="h-5 w-px bg-border" />
          <div>
            <div className="text-[10px] text-muted-foreground">NEXT STOP</div>
            <div className="font-bold text-foreground">{bus.nextStopName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverTransitionOverlay;
