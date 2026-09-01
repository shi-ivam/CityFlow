import React, { useState } from 'react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className={`h-screen w-screen flex bg-background text-foreground font-sans antialiased overflow-hidden select-none ${darkMode ? 'dark' : ''}`}>
      
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        conflictsCount={conflictsCount}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Header */}
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

        {/* Content View */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-background">
          {children}
        </main>
      </div>

      {/* Global Command HUD Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        busFleet={busFleet}
        crewMembers={crewMembers}
        routes={routes}
        dutyAssignments={dutyAssignments}
        activeConflicts={activeConflicts}
      />

    </div>
  );
}
