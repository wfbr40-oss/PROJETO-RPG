"use client";

import React from "react";
import { Campaign, RpgSystemRules } from "@/types/rpg";
import { Shield, ChevronDown, Plus, Dices, MessageSquare } from "lucide-react";

interface NavbarProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onSelectCampaign: (id: string) => void;
  onOpenCreateCampaign: () => void;
  activeSystem: RpgSystemRules | null;
  onOpenDiceRoller: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
}

export function Navbar({
  campaigns,
  activeCampaign,
  onSelectCampaign,
  onOpenCreateCampaign,
  activeSystem,
  onOpenDiceRoller,
  isChatOpen,
  onToggleChat,
  activeTab,
  onSelectTab,
}: NavbarProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0d0d12]/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-8 shrink-0 z-30 sticky top-0">
      {/* Zone 1: Brand title, one line wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab("overview")}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors whitespace-nowrap">
              Projeto RPG Studio
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {activeSystem?.name || "Mesa Ativa"}
            </span>
          </div>
        </button>

        {/* Campaign Switcher Dropdown */}
        <div className="relative ml-2 hidden sm:block">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="max-w-[140px] truncate">{activeCampaign?.name || "Selecionar Mesa"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#111116] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  Mesas & Campanhas
                </div>
                {campaigns.map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => {
                      onSelectCampaign(camp.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      activeCampaign?.id === camp.id
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                        : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{camp.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {camp.characters.length} fichas
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-800/80 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenCreateCampaign();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-950/20 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Campanha</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zone 2: Navigation Links (single line, unboxed with subtle hover) */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectTab("overview")}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "overview" ? "text-indigo-400 font-semibold border-b border-indigo-400 pb-0.5" : ""
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => onSelectTab("sheets")}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "sheets" ? "text-indigo-400 font-semibold border-b border-indigo-400 pb-0.5" : ""
          }`}
        >
          Fichas ({activeCampaign?.characters.length || 0})
        </button>
        <button
          onClick={() => onSelectTab("rules")}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "rules" ? "text-indigo-400 font-semibold border-b border-indigo-400 pb-0.5" : ""
          }`}
        >
          Livro de Regras
        </button>
        <button
          onClick={() => onSelectTab("systems")}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "systems" ? "text-indigo-400 font-semibold border-b border-indigo-400 pb-0.5" : ""
          }`}
        >
          Sistemas & Criação
        </button>
        <button
          onClick={() => onSelectTab("extractor")}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "extractor" ? "text-indigo-400 font-semibold border-b border-indigo-400 pb-0.5" : ""
          }`}
        >
          Extrator com IA
        </button>
        <button
          onClick={() => onSelectTab("logs")}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === "logs" ? "text-indigo-400 font-semibold border-b border-indigo-400 pb-0.5" : ""
          }`}
        >
          Diário de Sessões
        </button>
      </nav>

      {/* Zone 3: Quick Action Affordances */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Dice Roller Button */}
        <button
          onClick={onOpenDiceRoller}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-750 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          title="Abrir rolador de dados (d4, d6, d8, d10, d12, d20, d100)"
        >
          <Dices className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Rolar Dados</span>
        </button>

        {/* Odysseus AI Chat Toggle Button */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm ${
            isChatOpen
              ? "bg-indigo-600 text-white shadow-indigo-500/20"
              : "bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30"
          }`}
          title="Conversar com o Odysseus AI (Assistente de Regras)"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Odysseus IA</span>
        </button>
      </div>
    </header>
  );
}
