import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subvalue,
  status = 'nominal', // 'nominal' | 'warning' | 'critical' | 'success'
  statusLabel,
  icon: Icon,
  onClick,
  trend, // { direction: 'up' | 'down', label: string }
  badgeText
}) {
  const getStatusStyles = () => {
    switch (status) {
      case 'critical':
        return {
          border: 'border-rose-500/40 dark:border-rose-500/50',
          bg: 'bg-rose-500/5 dark:bg-rose-950/20',
          badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          indicator: 'bg-rose-500',
        };
      case 'warning':
        return {
          border: 'border-amber-500/40 dark:border-amber-500/50',
          bg: 'bg-amber-500/5 dark:bg-amber-950/20',
          badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
          indicator: 'bg-amber-500',
        };
      case 'success':
        return {
          border: 'border-emerald-500/30 dark:border-emerald-500/40',
          bg: 'bg-emerald-500/5 dark:bg-emerald-950/20',
          badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          indicator: 'bg-emerald-500',
        };
      default:
        return {
          border: 'border-border',
          bg: 'bg-card',
          badge: 'bg-muted text-muted-foreground border-border',
          indicator: 'bg-primary',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border ${styles.border} ${styles.bg} p-4 shadow-card hover:shadow-popover transition-all duration-150 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-sans">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-md bg-muted/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl lg:text-3xl font-bold font-mono text-foreground tracking-tight tabular-nums">
          {value}
        </span>
        {subvalue && (
          <span className="text-xs font-mono text-muted-foreground font-medium">
            {subvalue}
          </span>
        )}
      </div>

      {/* Footer Info & Badges */}
      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
        {statusLabel ? (
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${styles.indicator} ${status === 'critical' ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-[11px] font-medium text-foreground">{statusLabel}</span>
          </div>
        ) : trend ? (
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className={trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {trend.label}
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-muted-foreground">Real-time status</span>
        )}

        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${styles.badge}`}>
            {badgeText}
          </span>
        )}

        {onClick && (
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
        )}
      </div>
    </div>
  );
}
