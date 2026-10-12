"use client";

import React from "react";
import { Campaign, RpgSystemRules } from "@/types/rpg";
import { Menu, Dices, MessageSquare, Plus } from "lucide-react";

interface NavbarProps {
  activeCampaign: Campaign | null;
  activeSystem: RpgSystemRules | null;
  onOpenMobileSidebar: () => void;
  onOpenDiceRoller: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  activeTab: string;
  onOpenCreateCampaign: () => void;
}

export function Navbar({
  activeCampaign,
  activeSystem,
  onOpenMobileSidebar,
  onOpenDiceRoller,
  isChatOpen,
  onToggleChat,
  activeTab,
  onOpenCreateCampaign,
}: NavbarProps) {
  const tabNames: Record<string, string> = {
    overview: "Visão Geral",
    sheets: "Fichas dos Jogadores",
    rules: "Livro de Regras",
    systems: "Sistemas & Criação",
    extractor: "Extrator com IA",
    logs: "Diário de Sessões",
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0d0d12]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-6 shrink-0 z-30 sticky top-0">
      {/* Zone 1: Mobile Hamburger & Context Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Abrir menu lateral"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono min-w-0 truncate">
          <span className="text-slate-400 font-bold hidden sm:inline truncate">
            {activeCampaign ? activeCampaign.name : "Projeto RPG"}
          </span>
          {activeCampaign && <span className="text-slate-600 hidden sm:inline">/</span>}
          <span className="text-white font-semibold truncate">
            {tabNames[activeTab] || "Mesa"}
          </span>
          {activeSystem && (
            <>
              <span className="text-slate-600 hidden md:inline">/</span>
              <span className="text-indigo-400 hidden md:inline truncate">
                {activeSystem.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Zone 2: Primary Quick Action Affordances */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick New Campaign Button if no campaign exists */}
        {!activeCampaign && (
          <button
            onClick={onOpenCreateCampaign}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Primeira Mesa</span>
          </button>
        )}

        {/* Dice Roller Button */}
        <button
          onClick={onOpenDiceRoller}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-850 border border-slate-750 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          title="Rolar dados poliedrais"
        >
          <Dices className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Rolar Dados</span>
        </button>

        {/* Odysseus AI Chat Toggle Button */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            isChatOpen
              ? "bg-indigo-600 text-white shadow-indigo-500/20 font-bold"
              : "bg-slate-900/90 hover:bg-slate-850 text-indigo-300 border border-indigo-500/30"
          }`}
          title="Conversar com Odysseus IA (Oráculo de Mesa)"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Odysseus IA</span>
        </button>
      </div>
    </header>
  );
}
