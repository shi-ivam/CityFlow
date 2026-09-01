import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import GlobalSearchModal from './GlobalSearchModal';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const isCockpit = location.pathname === '/admin' || 
                    location.pathname === '/admin/' || 
                    location.pathname === '/admin/dashboard' || 
                    location.pathname === '/admin/operations';

  const enhancedChildren = React.isValidElement(children)
    ? React.cloneElement(children, {
        onToggleSidebar: () => setIsSidebarCollapsed(prev => !prev),
        isSidebarCollapsed
      })
    : children;

  return (
    <div className={`h-screen w-screen flex bg-[#0b0f19] text-foreground font-sans antialiased overflow-hidden select-none ${darkMode ? 'dark' : ''}`}>
      
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
            onOpenPRDModal={onOpenPRDModal}
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

    </div>
  );
}
