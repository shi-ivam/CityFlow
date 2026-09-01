import React from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================================
// 1. CF BUTTON
// ============================================================
export interface CFButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'soft' | 'success' | 'planning' | 'sand' | 'lavender' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const CFButton: React.FC<CFButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-mono',
    md: 'px-4 py-2 text-xs font-mono',
    lg: 'px-5 py-2.5 text-sm font-mono',
  }[size];

  const variantClasses = {
    primary: 'bg-cf-primary text-white hover:bg-cf-primary/90 shadow-xs border border-cf-primary',
    secondary: 'bg-cf-aqua text-[#133a40] hover:bg-cf-aqua/90 font-medium border border-[#7ebfc7]',
    soft: 'bg-cf-sky text-[#103b4d] hover:bg-cf-sky/90 font-medium border border-[#93e0ff]',
    success: 'bg-cf-mint text-[#1e3a1e] hover:bg-cf-mint/90 font-medium border border-[#bbf7b5]',
    planning: 'bg-cf-olive text-[#3b421a] hover:bg-cf-olive/90 font-medium border border-[#dce3b8]',
    sand: 'bg-cf-sand text-[#3d351b] hover:bg-cf-sand/90 font-medium border border-[#d8cba0]',
    lavender: 'bg-cf-lavender text-[#3730a3] hover:bg-cf-lavender/90 font-medium border border-[#c4b5fd]',
    outline: 'bg-card text-foreground hover:bg-muted/80 border border-border',
    ghost: 'bg-transparent text-foreground hover:bg-muted/60 border-transparent',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
};

// ============================================================
// 2. CF STATUS BADGE
// ============================================================
export interface CFBadgeProps {
  status?: string;
  variant?: 'mint' | 'sky' | 'olive' | 'aqua' | 'sand' | 'lavender' | 'peach' | 'primary' | 'critical' | 'warning' | 'neutral';
  children?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const CFBadge: React.FC<CFBadgeProps> = ({
  status,
  variant,
  children,
  dot = true,
  className = '',
}) => {
  let resolvedVariant = variant || 'neutral';
  const text = children || status || '';
  const normalized = String(status || children || '').toUpperCase();

  if (!variant) {
    if (['IN_SERVICE', 'AVAILABLE', 'ACTIVE', 'VALID', 'READY', 'COMPLETED', 'HEALTHY', 'PASS', 'CONNECTED'].includes(normalized)) {
      resolvedVariant = 'mint';
    } else if (['STANDBY', 'STANDBY_READY', 'LIVE', 'TELEMETRY', 'SCHEDULED', 'INFO'].includes(normalized)) {
      resolvedVariant = 'sky';
    } else if (['PENDING', 'PLANNING', 'EXPIRING', 'WARNING', 'DUE'].includes(normalized)) {
      resolvedVariant = 'olive';
    } else if (['CONNECTIVITY', 'EN_ROUTE', 'ASSIGNED'].includes(normalized)) {
      resolvedVariant = 'aqua';
    } else if (['STANDBY_RESERVE', 'DEPOT'].includes(normalized)) {
      resolvedVariant = 'sand';
    } else if (['INSIGHT', 'ANALYTICS', 'AUTOMATED'].includes(normalized)) {
      resolvedVariant = 'lavender';
    } else if (['ATTENTION', 'ADVISORY'].includes(normalized)) {
      resolvedVariant = 'peach';
    } else if (['MAINTENANCE', 'WORKSHOP', 'OFFLINE', 'EXPIRED', 'BLOCKED', 'CRITICAL', 'CONFLICT', 'VIOLATION'].includes(normalized)) {
      resolvedVariant = 'critical';
    }
  }

  const badgeStyles = {
    mint: 'bg-[#E4FDE1] text-[#1e3a1e] border-[#bbf7b5]',
    sky: 'bg-[#C1EEFF] text-[#103b4d] border-[#93e0ff]',
    olive: 'bg-[#EDF0DA] text-[#3b421a] border-[#dce3b8]',
    aqua: 'bg-[#A6CFD5] text-[#133a40] border-[#7ebfc7]',
    sand: 'bg-[#E8DDB5] text-[#3d351b] border-[#d8cba0]',
    lavender: 'bg-[#EDE9FE] text-[#3730a3] border-[#c4b5fd]',
    peach: 'bg-[#FFF3E0] text-[#7c2d12] border-[#fed7aa]',
    primary: 'bg-[#3B597B] text-white border-[#3B597B]',
    critical: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    neutral: 'bg-muted/70 text-muted-foreground border-border',
  }[resolvedVariant];

  const dotColors = {
    mint: 'bg-emerald-600',
    sky: 'bg-sky-600',
    olive: 'bg-amber-600',
    aqua: 'bg-[#3B597B]',
    sand: 'bg-amber-700',
    lavender: 'bg-indigo-600',
    peach: 'bg-orange-600',
    primary: 'bg-white',
    critical: 'bg-rose-600',
    warning: 'bg-amber-600',
    neutral: 'bg-muted-foreground',
  }[resolvedVariant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${badgeStyles} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      <span>{text}</span>
    </span>
  );
};

// ============================================================
// 3. CF KPI CARD
// ============================================================
export interface CFKPIProps {
  label: string;
  value: string | number;
  context?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'mint' | 'sky' | 'olive' | 'aqua' | 'sand' | 'lavender';
  icon?: LucideIcon;
  onClick?: () => void;
  selected?: boolean;
}

export const CFKPI: React.FC<CFKPIProps> = ({
  label,
  value,
  context,
  trend,
  trendDirection = 'up',
  variant = 'default',
  icon: Icon,
  onClick,
  selected = false,
}) => {
  const accentBorder = {
    default: selected ? 'border-cf-primary ring-1 ring-cf-primary/30' : 'border-border hover:border-cf-primary/50',
    mint: 'border-[#bbf7b5] bg-[#E4FDE1]/30 hover:bg-[#E4FDE1]/50',
    sky: 'border-[#93e0ff] bg-[#C1EEFF]/30 hover:bg-[#C1EEFF]/50',
    olive: 'border-[#dce3b8] bg-[#EDF0DA]/30 hover:bg-[#EDF0DA]/50',
    aqua: 'border-[#7ebfc7] bg-[#A6CFD5]/30 hover:bg-[#A6CFD5]/50',
    sand: 'border-[#d8cba0] bg-[#E8DDB5]/30 hover:bg-[#E8DDB5]/50',
    lavender: 'border-[#c4b5fd] bg-[#EDE9FE]/30 hover:bg-[#EDE9FE]/50',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-card border transition-all duration-150 shadow-xs ${accentBorder} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {Icon && <Icon className="w-4 h-4 text-cf-primary" />}
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-light font-mono tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-mono text-emerald-700 font-medium">
            {trend}
          </span>
        )}
      </div>

      {context && (
        <div className="text-xs text-muted-foreground mt-1 font-sans">
          {context}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 4. CF CARD
// ============================================================
export interface CFCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  headerAccent?: 'primary' | 'mint' | 'sky' | 'olive' | 'aqua' | 'sand' | 'lavender' | 'none';
}

export const CFCard: React.FC<CFCardProps> = ({
  title,
  subtitle,
  action,
  headerAccent = 'none',
  children,
  className = '',
  ...props
}) => {
  const accentBorderTop = {
    primary: 'border-t-2 border-t-cf-primary',
    mint: 'border-t-2 border-t-[#E4FDE1]',
    sky: 'border-t-2 border-t-[#C1EEFF]',
    olive: 'border-t-2 border-t-[#EDF0DA]',
    aqua: 'border-t-2 border-t-[#A6CFD5]',
    sand: 'border-t-2 border-t-[#E8DDB5]',
    lavender: 'border-t-2 border-t-[#EDE9FE]',
    none: '',
  }[headerAccent];

  return (
    <div
      className={`bg-card border border-border/80 rounded-xl shadow-xs overflow-hidden ${accentBorderTop} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between gap-3 bg-muted/30">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold font-sans text-foreground">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};
