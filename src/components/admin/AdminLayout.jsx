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
      
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        conflictsCount={conflictsCount}
      />

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
