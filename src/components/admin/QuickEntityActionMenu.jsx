import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, RefreshCw, UserCheck, Bus, Calendar, XCircle, Trash2, Power } from 'lucide-react';

export default function QuickEntityActionMenu({
  entityType = 'bus', // 'bus' | 'driver' | 'route' | 'schedule'
  entityId,
  onAction
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrigger = (actionType) => {
    setIsOpen(false);
    if (onAction) onAction(actionType, entityId, entityType);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Admin Quick Action Menu [⋮]"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-lg shadow-popover py-1 z-[2500] font-mono text-xs text-popover-foreground animate-in fade-in duration-100">
          <div className="px-3 py-1 text-[10px] text-muted-foreground font-bold uppercase border-b border-border/50">
            {entityType} Actions
          </div>

          <button
            onClick={() => handleTrigger('edit')}
            className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
          >
            <Edit className="w-3.5 h-3.5 text-primary" />
            <span>Edit Entity</span>
          </button>

          {entityType === 'route' && (
            <>
              <button
                onClick={() => handleTrigger('change_bus')}
                className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
              >
                <Bus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Assign Bus</span>
              </button>
              <button
                onClick={() => handleTrigger('change_driver')}
                className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Assign Driver</span>
              </button>
            </>
          )}

          {entityType === 'bus' && (
            <>
              <button
                onClick={() => handleTrigger('change_route')}
                className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>Change Route</span>
              </button>
              <button
                onClick={() => handleTrigger('change_driver')}
                className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Change Driver</span>
              </button>
            </>
          )}

          {entityType === 'driver' && (
            <>
              <button
                onClick={() => handleTrigger('change_route')}
                className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>Change Route</span>
              </button>
              <button
                onClick={() => handleTrigger('change_bus')}
                className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center space-x-2"
              >
                <Bus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Change Bus</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleTrigger('cancel_trip')}
            className="w-full px-3 py-1.5 text-left hover:bg-accent text-amber-600 dark:text-amber-400 flex items-center space-x-2 border-t border-border/50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Trip</span>
          </button>

          <button
            onClick={() => handleTrigger('deactivate')}
            className="w-full px-3 py-1.5 text-left hover:bg-accent text-rose-600 dark:text-rose-400 flex items-center space-x-2"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Deactivate</span>
          </button>
        </div>
      )}
    </div>
  );
}
