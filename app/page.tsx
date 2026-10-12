'use client';

import React, { useState } from 'react';
import { Sidebar, AppTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { SystemsView } from '@/components/views/SystemsView';
import { SystemDetailView } from '@/components/views/SystemDetailView';
import { CompareVersionsView } from '@/components/views/CompareVersionsView';
import { CampaignsView } from '@/components/views/CampaignsView';
import { CreateContentView } from '@/components/views/CreateContentView';
import { GameSystem } from '@/types/database';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<AppTab>('systems');

  // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Drilldown state for System Detail
  const [selectedSystem, setSelectedSystem] = useState<GameSystem | null>(null);

  // Preselected states for Compare and Create views
  const [compareSystemId, setCompareSystemId] = useState<string>('');
  const [compareVersionId, setCompareVersionId] = useState<string>('');
  const [createInitialSystemId, setCreateInitialSystemId] = useState<string>('');
  const [createInitialVersionId, setCreateInitialVersionId] = useState<string>('');

  // Handlers for switching views
  const handleSelectSystem = (system: GameSystem) => {
    setSelectedSystem(system);
  };

  const handleBackToSystems = () => {
    setSelectedSystem(null);
  };

  const handleCompareSystem = (systemId: string, versionId?: string) => {
    setCompareSystemId(systemId);
    if (versionId) {
      setCompareVersionId(versionId);
    }
    setActiveTab('compare');
  };

  const handleGoToCreateRule = (systemId: string, versionId: string) => {
    setCreateInitialSystemId(systemId);
    setCreateInitialVersionId(versionId);
    setActiveTab('create');
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    // If switching to systems from another tab, reset drilldown
    if (tab === 'systems' && selectedSystem) {
      setSelectedSystem(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] flex">
      {/* 1. Sidebar (Menu Lateral) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'systems' && (
            <>
              {selectedSystem ? (
                <SystemDetailView
                  system={selectedSystem}
                  onBack={handleBackToSystems}
                  onCompare={(sysId, verId) => handleCompareSystem(sysId, verId)}
                  onGoToCreateRule={(sysId, verId) => handleGoToCreateRule(sysId, verId)}
                />
              ) : (
                <SystemsView
                  onSelectSystem={handleSelectSystem}
                  onCompareSystem={(sysId) => handleCompareSystem(sysId)}
                  onGoToCreate={() => setActiveTab('create')}
                />
              )}
            </>
          )}

          {activeTab === 'compare' && (
            <CompareVersionsView
              initialSystemId={compareSystemId}
              initialVersionAId={compareVersionId}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsView
              onSelectSystem={(sys) => {
                setSelectedSystem(sys);
                setActiveTab('systems');
              }}
            />
          )}

          {activeTab === 'create' && (
            <CreateContentView
              initialSystemId={createInitialSystemId}
              initialVersionId={createInitialVersionId}
              onSuccessCreated={(sysId) => {
                setActiveTab('systems');
              }}
            />
          )}
        </main>
      </div>

      {/* 3. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
