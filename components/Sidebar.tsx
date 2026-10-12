"use client";

import React, { useState } from "react";
import { Campaign, RpgSystemRules } from "@/types/rpg";
import {
  Shield,
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  Sparkles,
  ScrollText,
  Dices,
  MessageSquare,
  ChevronDown,
  Plus,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";

interface SidebarProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  activeSystem: RpgSystemRules | null;
  onSelectCampaign: (id: string) => void;
  onOpenCreateCampaign: () => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenDiceRoller: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  campaigns,
  activeCampaign,
  activeSystem,
  onSelectCampaign,
  onOpenCreateCampaign,
  activeTab,
  onSelectTab,
  onOpenDiceRoller,
  isChatOpen,
  onToggleChat,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);

  const navItems = [
    {
      id: "overview",
      label: "Visão Geral",
      description: "Painel da mesa e resumo",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "sheets",
      label: "Fichas dos Jogadores",
      description: "Atributos, vida e recursos",
      icon: Users,
      badge: activeCampaign ? `${activeCampaign.characters.length}` : null,
    },
    {
      id: "rules",
      label: "Livro de Regras",
      description: activeSystem ? `Manual de ${activeSystem.name}` : "Regras ativas",
      icon: BookOpen,
      badge: activeSystem ? `v${activeSystem.version || "1.0"}` : null,
    },
    {
      id: "systems",
      label: "Sistemas & Criação",
      description: "Biblioteca e editor autoral",
      icon: Layers,
      badge: null,
    },
    {
      id: "extractor",
      label: "Extrator com IA",
      description: "Estruturar regras de manuais",
      icon: Sparkles,
      badge: "Gemini",
    },
    {
      id: "logs",
      label: "Diário de Sessões",
      description: "Crônicas e NPCs da mesa",
      icon: ScrollText,
      badge: activeCampaign ? `${activeCampaign.sessionLogs.length}` : null,
    },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[#0c0c11] border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-16" : "lg:w-64"}`}
        aria-label="Menu Lateral de Navegação"
      >
        {/* Brand / Logo Header */}
        <div className="h-14 border-b border-slate-800/80 flex items-center justify-between px-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight min-w-0 truncate">
                <span className="text-sm font-bold tracking-tight text-white truncate font-serif">
                  Projeto RPG
                </span>
                <span className="text-[10px] font-mono text-slate-500 truncate">
                  Studio & Mesa
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign Switcher Card (when expanded) */}
        {!isCollapsed ? (
          <div className="p-3 border-b border-slate-850/80 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Mesa Ativa
              </span>
              <button
                onClick={onOpenCreateCampaign}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
                title="Criar nova campanha"
              >
                <Plus className="w-3 h-3" />
                <span>Nova Mesa</span>
              </button>
            </div>

            <button
              onClick={() => setShowCampaignDropdown(!showCampaignDropdown)}
              className="w-full bg-[#111116] hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {activeCampaign ? activeCampaign.name : "Nenhuma mesa criada"}
                </div>
                <div className="text-[10px] font-mono text-indigo-400 truncate mt-0.5">
                  {activeSystem ? activeSystem.name : "Sem sistema vinculado"}
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  showCampaignDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Campaign Dropdown */}
            {showCampaignDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCampaignDropdown(false)}
                />
                <div className="absolute left-3 right-3 top-full mt-1 bg-[#14141a] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 max-h-56 overflow-y-auto">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase text-slate-500">
                    Selecionar Campanha ({campaigns.length})
                  </div>
                  {campaigns.length === 0 ? (
                    <div className="p-2 text-[11px] text-slate-500 italic">
                      Nenhuma campanha cadastrada.
                    </div>
                  ) : (
                    campaigns.map((camp) => (
                      <button
                        key={camp.id}
                        onClick={() => {
                          onSelectCampaign(camp.id);
                          setShowCampaignDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          activeCampaign?.id === camp.id
                            ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{camp.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1 shrink-0">
                          {camp.characters.length} fichas
                        </span>
                      </button>
                    ))
                  )}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowCampaignDropdown(false);
                        onOpenCreateCampaign();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-emerald-400 hover:bg-emerald-950/20 font-medium transition-colors flex items-center gap-1.5 cursor-pointer rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar Nova Mesa</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Collapsed Icon-Only Indicator */
          <div className="p-2 border-b border-slate-850 flex justify-center">
            <button
              onClick={() => {
                onToggleCollapse();
                setShowCampaignDropdown(true);
              }}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
              title={activeCampaign ? activeCampaign.name : "Selecionar Campanha"}
            >
              <Users className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Menu de Navegação
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl transition-all cursor-pointer group text-left ${
                  isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                } ${
                  isSelected
                    ? "bg-indigo-600/15 border border-indigo-500/40 text-white shadow-sm shadow-indigo-600/10 font-medium"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isSelected ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                    <div className="truncate">
                      <div className="text-xs truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-500 truncate leading-tight font-sans">
                        {item.description}
                      </div>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Tools & Shortcuts */}
        <div className="p-2.5 border-t border-slate-850/80 space-y-1.5 shrink-0 bg-[#0a0a0e]">
          {/* Dice Roller Button */}
          <button
            onClick={onOpenDiceRoller}
            className={`w-full flex items-center gap-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-xl transition-colors cursor-pointer shadow-sm ${
              isCollapsed ? "justify-center p-2.5" : "px-3 py-2 text-xs"
            }`}
            title="Abrir rolador de dados poliedrais"
          >
            <Dices className="w-4 h-4 text-cyan-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 text-left flex items-center justify-between">
                <span className="font-semibold">Rolar Dados</span>
                <span className="text-[10px] font-mono text-slate-500">d4 - d100</span>
              </div>
            )}
          </button>

          {/* Odysseus AI Chat Toggle Button */}
          <button
            onClick={onToggleChat}
            className={`w-full flex items-center gap-2.5 rounded-xl transition-all cursor-pointer shadow-sm ${
              isCollapsed ? "justify-center p-2.5" : "px-3 py-2 text-xs"
            } ${
              isChatOpen
                ? "bg-indigo-600 text-white shadow-indigo-600/20 font-bold"
                : "bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-300 border border-indigo-900/60"
            }`}
            title="Abrir chat com o assistente mestre Odysseus IA"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 text-left flex items-center justify-between">
                <span className="font-semibold">{activeCampaign?.odysseusName || "Odysseus IA"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
