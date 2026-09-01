import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable SidebarAccordion Component
 * 
 * Supports:
 * - Top-level expandable accordion with smooth chevron rotation
 * - Nested dropdown areas / sub-accordions (e.g. Scheduling, Smart Assignment, Fleet)
 * - Row-wide clicking & chevron clicking
 * - Keyboard accessibility (Enter & Space toggles)
 * - Active route & sub-filter detection
 * - Smooth CSS height & opacity transitions
 * - Collapsed sidebar support with hover tooltips
 */
export default function SidebarAccordion({
  label,
  icon: Icon,
  badge = null,
  badgeColor = 'bg-primary text-primary-foreground',
  isOpen = false,
  onToggle,
  isParentActive = false,
  isCollapsed = false,
  items = []
}) {
  // Track open state of nested sub-accordions
  const [openSubAccordions, setOpenSubAccordions] = useState({});

  const toggleSub = (key, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenSubAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (onToggle) onToggle();
    }
  };

  const handleRowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggle) onToggle();
  };

  return (
    <div className="space-y-0.5 select-none relative group/accordion">
      {/* Top-Level Accordion Trigger Row */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`${label} dropdown`}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 select-none group ${
          isParentActive
            ? 'bg-primary/15 text-primary font-semibold border-l-2 border-primary shadow-xs'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {Icon && (
            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
              isParentActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            }`} />
          )}
          {!isCollapsed && (
            <span className="truncate tracking-tight font-medium">
              {label}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center space-x-1.5 shrink-0 ml-1">
            {badge !== null && badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${badgeColor}`}>
                {badge}
              </span>
            )}
            <span
              className={`p-0.5 rounded text-muted-foreground group-hover:text-foreground inline-flex items-center justify-center transition-transform duration-200 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Tooltip for collapsed mode */}
        {isCollapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/accordion:opacity-100 transition-opacity z-50 whitespace-nowrap border border-border">
            {label}
            {badge && <span className="ml-1.5 font-bold text-rose-500">({badge})</span>}
          </div>
        )}
      </div>

      {/* Expandable Submenu Container */}
      {!isCollapsed && items.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l border-border/70 ml-4 mt-0.5">
            {items.map((item, idx) => {
              const hasSubitems = item.subitems && item.subitems.length > 0;
              // Auto-expand nested dropdown if a child is active, unless explicitly toggled
              const isSubOpen = openSubAccordions[item.key] !== undefined
                ? openSubAccordions[item.key]
                : (item.isSubParentActive || item.isActive || item.isSubExpanded);

              if (hasSubitems) {
                return (
                  <div key={item.key || idx} className="space-y-0.5">
                    {/* Nested Dropdown Trigger Area */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isSubOpen}
                      onClick={(e) => toggleSub(item.key, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleSub(item.key, e);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                        item.isSubParentActive
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <div className="flex items-center space-x-1 shrink-0 ml-1">
                        {item.badge && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${item.badgeColor || 'bg-rose-500 text-white'}`}>
                            {item.badge}
                          </span>
                        )}
                        <span className={`p-0.5 transition-transform duration-200 ${isSubOpen ? 'rotate-180' : 'rotate-0'}`}>
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Nested Subitems List */}
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isSubOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-border/50 ml-3">
                        {item.subitems.map((sub, sIdx) => (
                          <NavLink
                            key={sub.key || sub.path || sIdx}
                            to={sub.path}
                            className={() => `block px-2 py-1 rounded text-[10.5px] font-mono transition-colors cursor-pointer ${
                              sub.isActive
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                            }`}
                          >
                            <span className="truncate">• {sub.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard Link Item
              return (
                <NavLink
                  key={item.key || item.path || idx}
                  to={item.path}
                  className={() => `block px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                    item.isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">• {item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${item.badgeColor || 'bg-rose-500 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
