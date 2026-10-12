"use client";

import React from "react";
import Image from "next/image";
import { Campaign, RpgSystemRules, Character, DiceRollResult } from "@/types/rpg";
import {
  Sparkles,
  BookOpen,
  Users,
  Dices,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Swords,
  ScrollText,
} from "lucide-react";

interface OverviewTabProps {
  activeCampaign: Campaign | null;
  activeSystem: RpgSystemRules | null;
  onSelectTab: (tab: any) => void;
  onSelectCharacter: (id: string) => void;
  onOpenCreateChar: () => void;
  onOpenCreateCampaign?: () => void;
  onOpenDiceRoller: () => void;
  onOpenChat: () => void;
  recentRolls: DiceRollResult[];
}

export function OverviewTab({
  activeCampaign,
  activeSystem,
  onSelectTab,
  onSelectCharacter,
  onOpenCreateChar,
  onOpenCreateCampaign,
  onOpenDiceRoller,
  onOpenChat,
  recentRolls,
}: OverviewTabProps) {
  if (!activeCampaign) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[#111116] rounded-2xl border border-slate-800 space-y-4 max-w-xl mx-auto my-8 shadow-xl">
        <Shield className="w-12 h-12 text-indigo-400 mx-auto" />
        <h3 className="text-lg font-bold text-white font-serif">Nenhuma Mesa Criada</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Os dados padrões foram limpos para você iniciar sua jornada do zero! Crie sua primeira campanha personalizada
          ou cadastre seu sistema de regras para gerenciar fichas e rolar dados.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenCreateCampaign && (
            <button
              onClick={onOpenCreateCampaign}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
            >
              + Criar Primeira Mesa
            </button>
          )}
          <button
            onClick={() => onSelectTab("systems")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Cadastrar Sistema de Regras
          </button>
          <button
            onClick={() => onSelectTab("extractor")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Extrair Manual com IA
          </button>
        </div>
      </div>
    );
  }

  const characters = activeCampaign.characters || [];
  const sessionLogs = activeCampaign.sessionLogs || [];
  const npcs = activeCampaign.npcList || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Header with Generated Visual Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#111116] shadow-xl">
        <div className="relative h-48 sm:h-56 w-full">
          <Image
            src="/images/hero_rpg_table_1791814186009.jpg"
            alt="Mesa de RPG com dados e grimório"
            fill
            className="object-cover opacity-35"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-[#111116]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111116]/90 via-[#111116]/40 to-transparent" />
        </div>

        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1.5">
            <span>SISTEMA ATIVO: {activeSystem?.name || "Personalizado"}</span>
            <span aria-hidden="true">·</span>
            <span>v{activeSystem?.version || "1.0"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
            {activeCampaign.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 line-clamp-2 leading-relaxed">
            {activeCampaign.description ||
              "Campanha de RPG de mesa gerenciada com fichas automatizadas e auxílio em tempo real do Odysseus IA."}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{characters.length} Personagens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{sessionLogs.length} Sessões Registradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeCampaign.odysseusName || "Odysseus IA"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Personagens da Mesa */}
        <div className="bg-[#111116] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-serif">
                  Fichas dos Jogadores
                </h3>
              </div>
              <button
                onClick={onOpenCreateChar}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Nova Ficha</span>
              </button>
            </div>

            {characters.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Nenhum herói criado nesta mesa.
              </div>
            ) : (
              <div className="space-y-2.5">
                {characters.slice(0, 3).map((char) => {
                  const hpPct = Math.round((char.currentHp / char.maxHp) * 100);
                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        onSelectCharacter(char.id);
                        onSelectTab("sheets");
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                          {char.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {char.className} · Nível {char.level}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-mono font-bold tabular-nums text-slate-300">
                          {char.currentHp}/{char.maxHp} HP
                        </div>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              hpPct > 50
                                ? "bg-emerald-500"
                                : hpPct > 25
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, hpPct))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onSelectTab("sheets")}
            className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>Ver todas as fichas automatizadas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Identidade do Sistema & Regras */}
        <div className="bg-[#111116] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-serif">
                  Regras do Sistema
                </h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400">
                {activeSystem?.version || "1.0"}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                  Mecânica Core de Testes:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeSystem?.identity?.coreMechanic || "Resolução por dados poliedrais e atributos."}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                  Tom da Campanha:
                </span>
                <p className="text-slate-400 text-[11px]">
                  {activeSystem?.identity?.tone || "Aventura Épica"}
                </p>
              </div>

              <div className="pt-1.5 border-t border-slate-900 flex flex-wrap gap-1 font-mono text-[9px] text-slate-400">
                <span>Atributos: {activeSystem?.attributes.length || 0}</span>
                <span aria-hidden="true">·</span>
                <span>Classes: {activeSystem?.classes.length || 0}</span>
                <span aria-hidden="true">·</span>
                <span>Habilidades: {activeSystem?.abilities.length || 0}</span>
                <span aria-hidden="true">·</span>
                <span>Magias: {activeSystem?.spells.length || 0}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab("rules")}
            className="w-full mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>Consultar e personalizar regras</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Assistente Odysseus & Rolagens Recentes */}
        <div className="bg-[#111116] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-serif">
                  Mesa & Ações Rápidas
                </h3>
              </div>
              <button
                onClick={onOpenDiceRoller}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Dices className="w-3 h-3" />
                <span>Rolar</span>
              </button>
            </div>

            {recentRolls.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-xs">
                Nenhum dado rolado recentemente.
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentRolls.slice(0, 3).map((roll) => (
                  <div
                    key={roll.id}
                    className="p-2 bg-slate-950/80 rounded-lg border border-slate-850 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-400 truncate max-w-[120px]">
                      {roll.formula} {roll.reason ? `(${roll.reason})` : ""}
                    </span>
                    <span
                      className={`font-black tabular-nums ${
                        roll.isCritical
                          ? "text-yellow-400"
                          : roll.isFumble
                          ? "text-rose-400"
                          : "text-white"
                      }`}
                    >
                      {roll.total}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 p-2.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex items-center justify-between">
              <div className="text-[11px] text-slate-300">
                <span className="font-semibold text-indigo-300 block">Dúvida sobre uma regra?</span>
                <span className="text-slate-400 text-[10px]">Odysseus conhece todas as regras do sistema.</span>
              </div>
              <button
                onClick={onOpenChat}
                className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Perguntar
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <button
              onClick={onOpenDiceRoller}
              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-center font-medium transition-colors cursor-pointer"
            >
              Rolar Dados
            </button>
            <button
              onClick={() => onSelectTab("logs")}
              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-center font-medium transition-colors cursor-pointer"
            >
              Ver Diário
            </button>
          </div>
        </div>
      </div>

      {/* NPCs Strip if any */}
      {npcs.length > 0 && (
        <div className="p-5 bg-[#111116] rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-serif">
                Atores & NPCs da Campanha
              </h3>
            </div>
            <button
              onClick={() => onSelectTab("logs")}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Ver no Diário
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {npcs.slice(0, 4).map((npc) => (
              <div
                key={npc.id}
                className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{npc.name}</span>
                  <span className="text-[10px] font-mono text-indigo-400">{npc.role}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {npc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
