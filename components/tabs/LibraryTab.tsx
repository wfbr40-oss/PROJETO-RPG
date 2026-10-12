"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RpgSystemRules, Campaign } from "@/types/rpg";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  Copy,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface LibraryTabProps {
  systems: RpgSystemRules[];
  activeCampaign: Campaign | null;
  onSelectSystemForCampaign: (systemId: string) => void;
  onOpenCreateSystem: () => void;
  onOpenExtractor: () => void;
  onDeleteSystem: (systemId: string) => void;
  onDuplicateSystem: (systemId: string) => void;
  onSelectTab: (tab: any) => void;
}

export function LibraryTab({
  systems,
  activeCampaign,
  onSelectSystemForCampaign,
  onOpenCreateSystem,
  onOpenExtractor,
  onDeleteSystem,
  onDuplicateSystem,
  onSelectTab,
}: LibraryTabProps) {
  const [search, setSearch] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState<string>(
    activeCampaign?.activeSystemId || systems[0]?.id || ""
  );

  const filteredSystems = systems.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const inspectSystem = systems.find((s) => s.id === selectedSystemId) || systems[0] || null;
  const isBoundToMesa = activeCampaign?.activeSystemId === inspectSystem?.id;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
              Biblioteca de Sistemas de RPG
            </h2>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-900/50">
              {systems.length} Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Alterne entre sistemas clássicos ou crie suas próprias regras e mecânicas autorais.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExtractor}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Extrair de Manual com IA</span>
          </button>

          <button
            onClick={onOpenCreateSystem}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Sistema</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Systems List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Systems Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar sistema por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111116] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredSystems.map((sys) => {
              const isSelected = inspectSystem?.id === sys.id;
              const isCurrent = activeCampaign?.activeSystemId === sys.id;

              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedSystemId(sys.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? "bg-indigo-600/10 border-indigo-500/60 shadow-lg shadow-indigo-600/10"
                      : "bg-[#111116] border-slate-850 hover:border-slate-750"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-serif">{sys.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded">
                          {sys.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {sys.description}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">
                        Ativo na Mesa
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-850/80 text-[10px] font-mono text-slate-500">
                    <div className="flex gap-2">
                      <span>{sys.attributes.length} Atributos</span>
                      <span>·</span>
                      <span>{sys.classes.length} Classes</span>
                      <span>·</span>
                      <span>{sys.abilities.length} Habilidades</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateSystem(sys.id);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Duplicar sistema"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {systems.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSystem(sys.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                          title="Excluir sistema"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed System Inspector */}
        <div className="lg:col-span-7">
          {inspectSystem ? (
            <div className="bg-[#111116] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Header with Visual Image */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex flex-col justify-end p-5">
                <Image
                  src="/images/rpg_grimoire_rules_1791814196380.jpg"
                  alt="Grimório de regras"
                  fill
                  className="object-cover opacity-25"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">
                      Sistema Inspecionado
                    </span>
                    <h3 className="text-xl font-bold font-serif text-white">{inspectSystem.name}</h3>
                  </div>

                  {isBoundToMesa ? (
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Vinculado à Campanha</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectSystemForCampaign(inspectSystem.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Vincular a esta Mesa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Core Mechanic summary */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                  Resolução de Testes & Dinâmica:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {inspectSystem.identity.coreMechanic}
                </p>
                <div className="pt-2 border-t border-slate-900 text-slate-400 text-[11px] flex justify-between">
                  <span>Tom: {inspectSystem.identity.tone}</span>
                  <span>Estilo de Vida: {inspectSystem.healthConfig.label}</span>
                </div>
              </div>

              {/* Classes Preview */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Classes do Sistema ({inspectSystem.classes.length}):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inspectSystem.classes.map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-emerald-400">{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.hpFormula}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abilities count and link to full rules */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">
                  {inspectSystem.abilities.length} habilidades · {inspectSystem.spells.length} magias · {inspectSystem.statuses.length} condições
                </span>

                <button
                  onClick={() => onSelectTab("rules")}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir Manual Completo de Regras</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 sm:p-12 text-center text-slate-400 bg-[#111116] rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
              <h4 className="text-base font-bold text-white font-serif">Biblioteca Pronta para Seus Sistemas</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Os dados padrões foram limpos para você começar do zero. Crie um sistema de RPG autoral ou
                use o Extrator com IA para digitalizar as regras de um livro ou manual.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={onOpenCreateSystem}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  + Criar Novo Sistema
                </button>
                <button
                  onClick={onOpenExtractor}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Extrair de Manual com IA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
