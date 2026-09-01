import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import GlobalSearchModal from './GlobalSearchModal';
import ActivityAlertDrawer from '../cockpit/ActivityAlertDrawer';

export default function AdminLayout({
  children,
  operationalTime,
  setOperationalTime,
  isSimulating,
  setIsSimulating,
  simSpeed,
  setSimSpeed,
  conflictsCount = 0,
  onOpenFallbackModal,
  onOpenPRDModal,
  darkMode,
  setDarkMode,
  busFleet = [],
  crewMembers = [],
  routes = [],
  dutyAssignments = [],
  activeConflicts = [],
  selectedCity = 'delhi',
  onSelectCity
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const location = useLocation();

  const isCockpit = location.pathname === '/admin' || 
                    location.pathname === '/admin/' || 
                    location.pathname === '/admin/dashboard';

  const enhancedChildren = React.isValidElement(children)
    ? React.cloneElement(children, {
        onToggleSidebar: () => setIsSidebarCollapsed(prev => !prev),
        isSidebarCollapsed
      })
    : children;

  const mockActivityEvents = [
    { id: '1', type: 'SOLVER', message: 'Automated 3-tier constraint solver verified 11h rest gap for Shift A.', timestamp: '08:42 AM', severity: 'nominal' },
    { id: '2', type: 'ROSTER', message: 'Driver Rajesh Kumar assigned to Route 534 (Corridor Mehrauli).', timestamp: '08:35 AM', severity: 'nominal' },
    { id: '3', type: 'REST', message: 'Driver DRV-1021 flagged for pending rest compliance check.', timestamp: '08:15 AM', severity: 'warning' },
    { id: '4', type: 'FLEET', message: 'Bus BUS-104 scheduled for preventive workshop inspection.', timestamp: '07:50 AM', severity: 'nominal' }
  ];

  return (
    <div className={`h-screen w-screen flex bg-[#F5F4F8] dark:bg-[#191821] text-foreground font-sans antialiased overflow-hidden select-none ${darkMode ? 'dark' : ''}`}>
      
      {/* Sidebar: In cockpit mode, off-canvas drawer; in sub-modules, docked sidebar */}
      {isCockpit ? (
        <>
          {/* Backdrop when drawer is open on cockpit */}
          {!isSidebarCollapsed && (
            <div
              onClick={() => setIsSidebarCollapsed(true)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in transition-opacity"
            />
          )}
          <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 shadow-2xl ${
            isSidebarCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
          }`}>
            <AdminSidebar
              isCollapsed={false}
              setIsCollapsed={setIsSidebarCollapsed}
              conflictsCount={conflictsCount}
            />
          </div>
        </>
      ) : (
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          conflictsCount={conflictsCount}
        />
      )}

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Render standard AdminHeader on sub-modules, omit on cockpit which has its own TopControlDeck */}
        {!isCockpit && (
          <AdminHeader
            onOpenSearch={() => setIsSearchOpen(true)}
            operationalTime={operationalTime}
            setOperationalTime={setOperationalTime}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            simSpeed={simSpeed}
            setSimSpeed={setSimSpeed}
            conflictsCount={conflictsCount}
            onOpenFallbackModal={onOpenFallbackModal}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            alertCount={mockActivityEvents.length}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            selectedCity={selectedCity}
            onSelectCity={onSelectCity}
          />
        )}

        {/* Content View */}
        <main className={`flex-1 min-h-0 ${isCockpit ? 'overflow-hidden p-0' : 'overflow-y-auto bg-background'}`}>
          {enhancedChildren}
        </main>
      </div>

      {/* Global Command HUD Modal */}
      {!isCockpit && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          busFleet={busFleet}
          crewMembers={crewMembers}
          routes={routes}
          dutyAssignments={dutyAssignments}
          activeConflicts={activeConflicts}
        />
      )}

      {/* Activity Alert Drawer */}
      <ActivityAlertDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        events={mockActivityEvents}
        onClearEvents={() => {}}
      />

    </div>
  );
}
