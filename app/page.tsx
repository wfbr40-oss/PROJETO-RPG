"use client";

import React, { useState, useEffect } from "react";
import {
  Campaign,
  Character,
  RpgSystemRules,
  ChatMessage,
  DiceRollResult,
  SystemIdentity,
  SystemSection,
  VersionHistoryItem,
  CharacterResource,
  CharacterStatus,
  SessionLog,
  NpcEntry,
} from "@/types/rpg";
import { DEFAULT_SYSTEMS, INITIAL_CAMPAIGNS } from "@/lib/initialData";
import { parseAndRollDice, RpgSoundFX } from "@/lib/rulesEngine";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { SheetsTab } from "@/components/tabs/SheetsTab";
import { RulesTab } from "@/components/tabs/RulesTab";
import { LibraryTab } from "@/components/tabs/LibraryTab";
import { ExtractorTab } from "@/components/tabs/ExtractorTab";
import { LogsTab } from "@/components/tabs/LogsTab";
import { OdysseusChat } from "@/components/OdysseusChat";
import { DiceRollerModal } from "@/components/DiceRollerModal";
import { CharacterModal } from "@/components/modals/CharacterModal";
import { CampaignModal } from "@/components/modals/CampaignModal";
import { AbilityCatalogModal } from "@/components/modals/AbilityCatalogModal";
import { RawJsonModal } from "@/components/modals/RawJsonModal";
import { DiffModal } from "@/components/modals/DiffModal";
import { IdentityModal } from "@/components/modals/IdentityModal";
import { SectionModal } from "@/components/modals/SectionModal";
import { ResourceModal } from "@/components/modals/ResourceModal";
import { StatusModal } from "@/components/modals/StatusModal";

export default function HomePage() {
  // 1. Systems State - Cleared of default seed data
  const [systems, setSystems] = useState<RpgSystemRules[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("rpg_studio_systems");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((s) => s.id === "t20" || s.id === "dnd5e" || s.id === "coc7e")) {
          localStorage.removeItem("rpg_studio_systems");
          return [];
        }
        return parsed;
      }
    } catch {}
    return [];
  });

  // 2. Campaigns State - Cleared of default seed data
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("rpg_studio_campaigns");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((c) => c.id === "campanha_arton")) {
          localStorage.removeItem("rpg_studio_campaigns");
          return [];
        }
        return parsed;
      }
    } catch {}
    return [];
  });

  // Active Campaign
  const [activeCampaignId, setActiveCampaignId] = useState<string>("");

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || null;

  // Active System
  const activeSystem =
    systems.find((s) => s.id === activeCampaign?.activeSystemId) ||
    systems[0] ||
    null;

  // Active Character
  const [activeCharacterId, setActiveCharacterId] = useState<string>("");

  const activeCharacter =
    activeCampaign?.characters.find((c) => c.id === activeCharacterId) ||
    activeCampaign?.characters[0] ||
    null;

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "sheets" | "rules" | "systems" | "extractor" | "logs"
  >("overview");

  // Sidebar (Menu Lateral) States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

  const currentMessages = chatMessages[activeCampaign?.id || ""] || [];
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Dice Roller State
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [recentRolls, setRecentRolls] = useState<DiceRollResult[]>([]);

  // Modals States
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isAbilityCatalogOpen, setIsAbilityCatalogOpen] = useState(false);
  const [isRawJsonOpen, setIsRawJsonOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<SystemSection | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("rpg_studio_systems", JSON.stringify(systems));
    } catch {}
  }, [systems]);

  useEffect(() => {
    try {
      localStorage.setItem("rpg_studio_campaigns", JSON.stringify(campaigns));
    } catch {}
  }, [campaigns]);

  // Handle dice roll
  const handleAddRoll = (roll: DiceRollResult) => {
    setRecentRolls((prev) => [roll, ...prev.slice(0, 19)]);
  };

  const handleRollDiceManual = (formula: string, charName?: string, reason?: string) => {
    const roll = parseAndRollDice(formula, charName, reason, activeSystem);
    handleAddRoll(roll);

    // Also notify in chat
    if (activeCampaign) {
      const chatRollMsg: ChatMessage = {
        id: `roll_msg_${Date.now()}`,
        sender: "player",
        text: `🎲 ${charName || "Jogador"} rolou ${formula}${reason ? ` (${reason})` : ""}: Total ${roll.total}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        diceRoll: roll,
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeCampaign.id]: [...(prev[activeCampaign.id] || []), chatRollMsg],
      }));
    }
  };

  // Send message to Odysseus AI (/api/chat)
  const handleSendMessage = async (text: string) => {
    if (!activeCampaign || !text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "player",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const campaignId = activeCampaign.id;
    const currentHist = chatMessages[campaignId] || [];
    const updatedHistory = [...currentHist, userMsg];

    setChatMessages((prev) => ({
      ...prev,
      [campaignId]: updatedHistory,
    }));

    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: currentHist,
          odysseusName: activeCampaign.odysseusName,
          systemRules: activeSystem,
          sessionLogs: activeCampaign.sessionLogs,
          npcList: activeCampaign.npcList,
          characters: activeCampaign.characters,
          versionHistory: activeCampaign.versionHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Erro de conexão." }));
        throw new Error(errData.error || `Erro de resposta (${res.status})`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: data.reply || "Sem resposta.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        retrievedRules: data.retrievedRules || [],
      };

      setChatMessages((prev) => ({
        ...prev,
        [campaignId]: [...updatedHistory, assistantMsg],
      }));
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: `⚠️ Erro ao consultar o oráculo: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [campaignId]: [...updatedHistory, errMsg],
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick Action in Character Sheet (Use Ability in Game)
  const handleUseAbilityInChat = async (abilityName: string, cost?: string, desc?: string) => {
    if (!activeCharacter) return;
    RpgSoundFX.playClick();
    const actionText = `⚔️ ${activeCharacter.name} (${activeCharacter.className}) ativou "${abilityName}"${cost ? ` [Custo: ${cost}]` : ""}! ${desc ? `Efeito: ${desc}` : ""}`;
    setIsChatOpen(true);
    await handleSendMessage(actionText);
  };

  // Character updates
  const handleUpdateCharacter = (updated: Character) => {
    if (!activeCampaign) return;
    setCampaigns((prev) =>
      prev.map((camp) => {
        if (camp.id === activeCampaign.id) {
          return {
            ...camp,
            characters: camp.characters.map((ch) => (ch.id === updated.id ? updated : ch)),
          };
        }
        return camp;
      })
    );
  };

  const handleSaveNewOrEditedCharacter = (char: Character) => {
    if (!activeCampaign) return;
    const exists = activeCampaign.characters.some((c) => c.id === char.id);
    let nextChars: Character[];
    if (exists) {
      nextChars = activeCampaign.characters.map((c) => (c.id === char.id ? char : c));
    } else {
      nextChars = [...activeCampaign.characters, char];
    }

    setCampaigns((prev) =>
      prev.map((camp) => (camp.id === activeCampaign.id ? { ...camp, characters: nextChars } : camp))
    );
    setActiveCharacterId(char.id);
  };

  const handleDeleteCharacter = (charId: string) => {
    if (!activeCampaign) return;
    const nextChars = activeCampaign.characters.filter((c) => c.id !== charId);
    setCampaigns((prev) =>
      prev.map((camp) => (camp.id === activeCampaign.id ? { ...camp, characters: nextChars } : camp))
    );
    if (activeCharacterId === charId) {
      setActiveCharacterId(nextChars[0]?.id || "");
    }
  };

  // Campaign creation
  const handleCreateCampaign = (camp: Campaign) => {
    setCampaigns((prev) => [...prev, camp]);
    setActiveCampaignId(camp.id);
    setActiveTab("overview");
  };

  // System updates
  const handleUpdateSystem = (updated: RpgSystemRules) => {
    setSystems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSaveNewExtractedSystem = (newSys: RpgSystemRules) => {
    setSystems((prev) => [...prev, newSys]);
    // Also bind to active campaign
    if (activeCampaign) {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === activeCampaign.id ? { ...c, activeSystemId: newSys.id } : c))
      );
    }
  };

  const handleBindSystemToCampaign = (systemId: string) => {
    if (!activeCampaign) return;
    setCampaigns((prev) =>
      prev.map((c) => (c.id === activeCampaign.id ? { ...c, activeSystemId: systemId } : c))
    );
  };

  const handleDeleteSystem = (systemId: string) => {
    if (systems.length <= 1) {
      alert("É necessário manter ao menos um sistema cadastrado na biblioteca.");
      return;
    }
    const target = systems.find((s) => s.id === systemId);
    if (!confirm(`Deseja remover o sistema "${target?.name || systemId}"?`)) return;

    const remaining = systems.filter((s) => s.id !== systemId);
    setSystems(remaining);

    if (activeCampaign?.activeSystemId === systemId && remaining[0]) {
      handleBindSystemToCampaign(remaining[0].id);
    }
  };

  const handleDuplicateSystem = (systemId: string) => {
    const target = systems.find((s) => s.id === systemId);
    if (!target) return;
    const duplicated: RpgSystemRules = {
      ...target,
      id: `sys_copy_${Date.now()}`,
      name: `${target.name} (Cópia)`,
      version: `${target.version || "1.0"} (Cópia)`,
    };
    setSystems((prev) => [...prev, duplicated]);
  };

  // Session Logs & NPCs
  const handleAddSessionLog = (log: SessionLog) => {
    if (!activeCampaign) return;
    setCampaigns((prev) =>
      prev.map((camp) =>
        camp.id === activeCampaign.id
          ? { ...camp, sessionLogs: [log, ...camp.sessionLogs] }
          : camp
      )
    );
  };

  const handleDeleteSessionLog = (logId: string) => {
    if (!activeCampaign) return;
    setCampaigns((prev) =>
      prev.map((camp) =>
        camp.id === activeCampaign.id
          ? { ...camp, sessionLogs: camp.sessionLogs.filter((l) => l.id !== logId) }
          : camp
      )
    );
  };

  const handleAddNpc = (npc: NpcEntry) => {
    if (!activeCampaign) return;
    setCampaigns((prev) =>
      prev.map((camp) =>
        camp.id === activeCampaign.id ? { ...camp, npcList: [...camp.npcList, npc] } : camp
      )
    );
  };

  const handleDeleteNpc = (npcId: string) => {
    if (!activeCampaign) return;
    setCampaigns((prev) =>
      prev.map((camp) =>
        camp.id === activeCampaign.id
          ? { ...camp, npcList: camp.npcList.filter((n) => n.id !== npcId) }
          : camp
      )
    );
  };

  // Diff Patch Handler
  const handleApplyDiff = (updatedSystem: RpgSystemRules, patchNote: VersionHistoryItem) => {
    handleUpdateSystem(updatedSystem);
    if (activeCampaign) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === activeCampaign.id
            ? { ...c, versionHistory: [patchNote, ...c.versionHistory] }
            : c
        )
      );

      // Notify in chat
      const updateNotice: ChatMessage = {
        id: `diff_${Date.now()}`,
        sender: "assistant",
        text: `📜 **REGRAS ATUALIZADAS PARA v${updatedSystem.version}**\n\n${patchNote.summaryOfChanges}\n\n**Impacto:** ${patchNote.mechanicsImpact}\n\n**Migração:** ${patchNote.migrationRules}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [activeCampaign.id]: [...(prev[activeCampaign.id] || []), updateNotice],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 flex flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Menu Lateral (Sidebar Navigation) */}
      <Sidebar
        campaigns={campaigns}
        activeCampaign={activeCampaign}
        activeSystem={activeSystem}
        onSelectCampaign={(id) => {
          setActiveCampaignId(id);
          const camp = campaigns.find((c) => c.id === id);
          if (camp?.characters[0]) {
            setActiveCharacterId(camp.characters[0].id);
          }
        }}
        onOpenCreateCampaign={() => setIsCampaignModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDiceRoller={() => setIsDiceModalOpen(true)}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Workspace Top Header with Breadcrumbs & Action Shortcuts */}
        <Navbar
          activeCampaign={activeCampaign}
          activeSystem={activeSystem}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenDiceRoller={() => setIsDiceModalOpen(true)}
          isChatOpen={isChatOpen}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          activeTab={activeTab}
          onOpenCreateCampaign={() => setIsCampaignModalOpen(true)}
        />

        {/* Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeTab === "overview" && (
            <OverviewTab
              activeCampaign={activeCampaign}
              activeSystem={activeSystem}
              onSelectTab={setActiveTab}
              onSelectCharacter={setActiveCharacterId}
              onOpenCreateChar={() => {
                setCharacterToEdit(null);
                setIsCharModalOpen(true);
              }}
              onOpenCreateCampaign={() => setIsCampaignModalOpen(true)}
              onOpenDiceRoller={() => setIsDiceModalOpen(true)}
              onOpenChat={() => setIsChatOpen(true)}
              recentRolls={recentRolls}
            />
          )}

        {activeTab === "sheets" && (
          <SheetsTab
            activeCharacter={activeCharacter}
            characters={activeCampaign?.characters || []}
            activeSystem={activeSystem}
            onSelectCharacter={setActiveCharacterId}
            onOpenCreateChar={() => {
              setCharacterToEdit(null);
              setIsCharModalOpen(true);
            }}
            onOpenEditChar={() => {
              setCharacterToEdit(activeCharacter);
              setIsCharModalOpen(true);
            }}
            onDeleteCharacter={handleDeleteCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onRollDice={handleRollDiceManual}
            onUseAbilityInChat={handleUseAbilityInChat}
            onOpenAbilityCatalog={() => setIsAbilityCatalogOpen(true)}
            onOpenAddResource={() => setIsResourceModalOpen(true)}
            onOpenAddStatus={() => setIsStatusModalOpen(true)}
          />
        )}

        {activeTab === "rules" && (
          <RulesTab
            activeSystem={activeSystem}
            onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
            onOpenSectionModal={(sec) => {
              setSectionToEdit(sec || null);
              setIsSectionModalOpen(true);
            }}
            onOpenRawJson={() => setIsRawJsonOpen(true)}
            onOpenDiffModal={() => setIsDiffModalOpen(true)}
            onUpdateSystem={handleUpdateSystem}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "systems" && (
          <LibraryTab
            systems={systems}
            activeCampaign={activeCampaign}
            onSelectSystemForCampaign={handleBindSystemToCampaign}
            onOpenCreateSystem={() => {
              const newSys: RpgSystemRules = {
                id: `sys_${Date.now()}`,
                name: "Novo Sistema Autoral",
                description: "Defina suas próprias fórmulas, perícias e combate.",
                version: "1.0",
                identity: {
                  coreMechanic: "1d20 + Atributo vs CD",
                  tone: "Aventura Customizada",
                },
                healthConfig: {
                  style: "numeric",
                  defaultMaxHp: 15,
                  label: "Pontos de Vida (PV)",
                },
                attributes: [
                  { id: "for", name: "Força", shortName: "FOR", description: "Poder físico." },
                  { id: "des", name: "Destreza", shortName: "DES", description: "Agilidade." },
                  { id: "int", name: "Inteligência", shortName: "INT", description: "Mente." },
                ],
                classes: [
                  { id: "guerreiro", name: "Combatente", description: "Lutador de linha de frente.", hpFormula: "15 + CON" },
                ],
                resourceTracks: [
                  { id: "mana", name: "Pontos de Mana", shortName: "PM", color: "cyan", defaultMax: 10 },
                ],
                abilities: [],
                spells: [],
                statuses: [],
                combatRules: [],
                sections: [],
              };
              setSystems((prev) => [...prev, newSys]);
              handleBindSystemToCampaign(newSys.id);
              setActiveTab("rules");
            }}
            onOpenExtractor={() => setActiveTab("extractor")}
            onDeleteSystem={handleDeleteSystem}
            onDuplicateSystem={handleDuplicateSystem}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "extractor" && (
          <ExtractorTab
            onSaveSystem={handleSaveNewExtractedSystem}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "logs" && (
          <LogsTab
            activeCampaign={activeCampaign}
            onAddSessionLog={handleAddSessionLog}
            onDeleteSessionLog={handleDeleteSessionLog}
            onAddNpc={handleAddNpc}
            onDeleteNpc={handleDeleteNpc}
          />
        )}
      </main>
      </div>

      {/* 3. Odysseus AI Assistant Drawer */}
      <OdysseusChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeCampaign={activeCampaign}
        activeSystem={activeSystem}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
        onQuickPrompt={(q) => handleSendMessage(q)}
      />

      {/* 4. Dice Roller Floating Modal */}
      <DiceRollerModal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        activeSystem={activeSystem}
        recentRolls={recentRolls}
        onAddRoll={handleAddRoll}
        onSendRollToChat={(r) => {
          if (activeCampaign) {
            const chatMsg: ChatMessage = {
              id: `roll_msg_${Date.now()}`,
              sender: "player",
              text: `🎲 ${activeCharacter?.name || "Jogador"} rolou ${r.formula}: Total ${r.total}${r.isCritical ? " (CRÍTICO!)" : r.isFumble ? " (FALHA CRÍTICA!)" : ""}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              diceRoll: r,
            };
            setChatMessages((prev) => ({
              ...prev,
              [activeCampaign.id]: [...(prev[activeCampaign.id] || []), chatMsg],
            }));
            setIsChatOpen(true);
          }
        }}
      />

      {/* 5. Modals Management */}
      {isCharModalOpen && (
        <CharacterModal
          key={characterToEdit ? characterToEdit.id : "new_char"}
          isOpen={isCharModalOpen}
          onClose={() => setIsCharModalOpen(false)}
          characterToEdit={characterToEdit}
          activeSystem={activeSystem}
          campaignId={activeCampaign?.id || ""}
          onSave={handleSaveNewOrEditedCharacter}
        />
      )}

      {isCampaignModalOpen && (
        <CampaignModal
          key="campaign_modal"
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          systems={systems}
          onCreate={handleCreateCampaign}
        />
      )}

      {isAbilityCatalogOpen && (
        <AbilityCatalogModal
          key={`${activeCharacter?.id || "char"}_abilities`}
          isOpen={isAbilityCatalogOpen}
          onClose={() => setIsAbilityCatalogOpen(false)}
          activeCharacter={activeCharacter}
          activeSystem={activeSystem}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}

      {isRawJsonOpen && (
        <RawJsonModal
          key={`${activeSystem?.id || "sys"}_json`}
          isOpen={isRawJsonOpen}
          onClose={() => setIsRawJsonOpen(false)}
          system={activeSystem}
          onSave={handleUpdateSystem}
        />
      )}

      {isDiffModalOpen && (
        <DiffModal
          key={`${activeSystem?.id || "sys"}_diff`}
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          activeSystem={activeSystem}
          onApplyDiff={handleApplyDiff}
        />
      )}

      {isIdentityModalOpen && (
        <IdentityModal
          key={`${activeSystem?.id || "sys"}_identity`}
          isOpen={isIdentityModalOpen}
          onClose={() => setIsIdentityModalOpen(false)}
          system={activeSystem}
          onSave={(updatedIdentity) => {
            if (activeSystem) {
              handleUpdateSystem({
                ...activeSystem,
                identity: updatedIdentity,
              });
            }
          }}
        />
      )}

      {isSectionModalOpen && (
        <SectionModal
          key={sectionToEdit ? sectionToEdit.id : "new_section"}
          isOpen={isSectionModalOpen}
          onClose={() => setIsSectionModalOpen(false)}
          sectionToEdit={sectionToEdit}
          onSave={(newSection) => {
            if (activeSystem) {
              const exists = activeSystem.sections.some((s) => s.id === newSection.id);
              let nextSections: SystemSection[];
              if (exists) {
                nextSections = activeSystem.sections.map((s) => (s.id === newSection.id ? newSection : s));
              } else {
                nextSections = [...activeSystem.sections, newSection];
              }
              handleUpdateSystem({
                ...activeSystem,
                sections: nextSections,
              });
            }
          }}
        />
      )}

      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onAddResource={(res: CharacterResource) => {
          if (activeCharacter) {
            handleUpdateCharacter({
              ...activeCharacter,
              resources: [...activeCharacter.resources, res],
            });
          }
        }}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        activeSystem={activeSystem}
        onAddStatus={(status: CharacterStatus) => {
          if (activeCharacter) {
            const existing = activeCharacter.activeStatuses.find(
              (s) => s.name.toLowerCase() === status.name.toLowerCase()
            );
            if (existing) {
              handleUpdateCharacter({
                ...activeCharacter,
                activeStatuses: activeCharacter.activeStatuses.map((s) =>
                  s.id === existing.id ? { ...s, severity: s.severity + 1 } : s
                ),
              });
            } else {
              handleUpdateCharacter({
                ...activeCharacter,
                activeStatuses: [...activeCharacter.activeStatuses, status],
              });
            }
          }
        }}
      />
    </div>
  );
}
