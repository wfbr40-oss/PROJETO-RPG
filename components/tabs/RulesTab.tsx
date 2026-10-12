"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RpgSystemRules, SystemSection } from "@/types/rpg";
import { getAbilityPrerequisites } from "@/lib/rulesEngine";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Code,
  RefreshCw,
  Sparkles,
  Layers,
  Swords,
  Flame,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface RulesTabProps {
  activeSystem: RpgSystemRules | null;
  onOpenIdentityModal: () => void;
  onOpenSectionModal: (section?: SystemSection) => void;
  onOpenRawJson: () => void;
  onOpenDiffModal: () => void;
  onUpdateSystem: (updated: RpgSystemRules) => void;
}

export function RulesTab({
  activeSystem,
  onOpenIdentityModal,
  onOpenSectionModal,
  onOpenRawJson,
  onOpenDiffModal,
  onUpdateSystem,
}: RulesTabProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "attributes" | "classes" | "abilities" | "spells" | "combat" | "statuses" | "custom">("all");

  if (!activeSystem) {
    return (
      <div className="p-12 text-center text-slate-500 bg-[#111116] rounded-2xl border border-slate-800">
        Nenhum sistema selecionado.
      </div>
    );
  }

  const query = search.trim().toLowerCase();

  const filteredAttributes = activeSystem.attributes.filter(
    (a) => !query || a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
  );

  const filteredClasses = activeSystem.classes.filter(
    (c) => !query || c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
  );

  const filteredAbilities = activeSystem.abilities.filter(
    (ab) =>
      !query ||
      ab.name.toLowerCase().includes(query) ||
      ab.description.toLowerCase().includes(query) ||
      (ab.className && ab.className.toLowerCase().includes(query)) ||
      (ab.tags && ab.tags.some((t) => t.toLowerCase().includes(query)))
  );

  const filteredSpells = activeSystem.spells.filter(
    (s) =>
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      (s.school && s.school.toLowerCase().includes(query))
  );

  const filteredStatuses = activeSystem.statuses.filter(
    (st) =>
      !query ||
      st.name.toLowerCase().includes(query) ||
      st.description.toLowerCase().includes(query) ||
      (st.effect && st.effect.toLowerCase().includes(query))
  );

  const filteredCombat = activeSystem.combatRules.filter(
    (cb) => !query || cb.topic.toLowerCase().includes(query) || cb.rule.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#111116] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span>MANUAL & CODEX DE REGRAS</span>
            <span aria-hidden="true">·</span>
            <span>v{activeSystem.version || "1.0"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
            {activeSystem.name}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeSystem.description || "Manual oficial de regras do sistema ativo nesta campanha."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenIdentityModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Editar resolução de testes e tom do sistema"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mecânica Core</span>
          </button>

          <button
            onClick={() => onOpenSectionModal()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            title="Criar nova seção ou divisão personalizada"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Seção</span>
          </button>

          <button
            onClick={onOpenDiffModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-750 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Atualizar regras com inteligência artificial"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar (Patch)</span>
          </button>

          <button
            onClick={onOpenRawJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-750 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Ver ou exportar JSON completo"
          >
            <Code className="w-3.5 h-3.5" />
            <span>RAW JSON</span>
          </button>
        </div>
      </div>

      {/* Core Identity Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-[#111116] border border-indigo-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold font-mono text-indigo-300 uppercase tracking-widest">
              Identidade Mecânica & Resolução Core
            </h3>
          </div>
          <button
            onClick={onOpenIdentityModal}
            className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            Editar Mecânica
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">Como se joga (Testes):</span>
            <p className="text-slate-200 font-sans text-xs leading-relaxed">
              {activeSystem.identity.coreMechanic}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">Tom & Atmosfera:</span>
            <p className="text-slate-200 font-sans text-xs leading-relaxed">
              {activeSystem.identity.tone}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">Acerto Crítico:</span>
            <p className="text-yellow-300 font-sans text-xs leading-relaxed">
              {activeSystem.identity.criticalRule || "Sucesso com bônus ou dano dobrado."}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">Falha Crítica (Fumble):</span>
            <p className="text-rose-300 font-sans text-xs leading-relaxed">
              {activeSystem.identity.fumbleRule || "Consequência dramática e revés em combate."}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111116] border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar regra, habilidade, magia, perícia ou condição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-850 shrink-0 text-xs font-mono">
          {[
            { id: "all", label: "Tudo" },
            { id: "attributes", label: "Atributos" },
            { id: "classes", label: "Classes" },
            { id: "abilities", label: "Habilidades" },
            { id: "spells", label: "Magias" },
            { id: "combat", label: "Combate" },
            { id: "statuses", label: "Condições" },
            { id: "custom", label: "Divisões" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Content Sections */}
      <div className="space-y-6">
        {/* 1. Attributes */}
        {(activeCategory === "all" || activeCategory === "attributes") && filteredAttributes.length > 0 && (
          <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Swords className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Atributos & Estatísticas ({filteredAttributes.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAttributes.map((attr) => (
                <div key={attr.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{attr.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                      {attr.shortName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{attr.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Classes */}
        {(activeCategory === "all" || activeCategory === "classes") && filteredClasses.length > 0 && (
          <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Classes, Arquétipos & Trilhas ({filteredClasses.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClasses.map((cls) => (
                <div key={cls.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300 font-serif">{cls.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      PV: {cls.hpFormula}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cls.description}</p>
                  {cls.startingEquipment && cls.startingEquipment.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                      <span className="text-slate-500 font-bold uppercase">Equipamento Inicial:</span>{" "}
                      {cls.startingEquipment.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Abilities */}
        {(activeCategory === "all" || activeCategory === "abilities") && filteredAbilities.length > 0 && (
          <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Habilidades & Talentos de Personagem ({filteredAbilities.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredAbilities.map((ab) => {
                const reqs = getAbilityPrerequisites(ab);
                return (
                  <div key={ab.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-100">{ab.name}</span>
                        {ab.className && (
                          <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                            Classe: {ab.className}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded shrink-0">
                        {ab.cost || "Passiva"}
                      </span>
                    </div>

                    {reqs.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[9px] font-mono text-amber-300">
                        {reqs.map((r, i) => (
                          <span key={i} className="bg-amber-950/60 border border-amber-900/40 px-1.5 py-0.2 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-300 leading-relaxed">{ab.description}</p>
                    {ab.mechanicalEffect && (
                      <p className="text-[10px] font-mono text-indigo-300 bg-indigo-950/30 p-1.5 rounded border border-indigo-900/30">
                        Efeito: {ab.mechanicalEffect}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Spells */}
        {(activeCategory === "all" || activeCategory === "spells") && filteredSpells.length > 0 && (
          <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Grimório de Magias & Rituais ({filteredSpells.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSpells.map((sp) => (
                <div key={sp.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-purple-200">{sp.name}</span>
                      <span className="text-[10px] font-mono text-purple-400 block mt-0.5">
                        {sp.circleOrLevel || "1º Círculo"} {sp.school ? `· ${sp.school}` : ""}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded shrink-0">
                      {sp.cost || "PM"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{sp.description}</p>
                  {sp.mechanicalEffect && (
                    <p className="text-[10px] font-mono text-purple-300 bg-purple-950/30 p-1.5 rounded border border-purple-900/30">
                      Efeito: {sp.mechanicalEffect}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Combat Rules */}
        {(activeCategory === "all" || activeCategory === "combat") && filteredCombat.length > 0 && (
          <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Swords className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Regras de Combate & Iniciativa ({filteredCombat.length})
              </h3>
            </div>
            <div className="space-y-2.5">
              {filteredCombat.map((cb) => (
                <div key={cb.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-xs font-bold text-slate-100">{cb.topic}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{cb.rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Statuses */}
        {(activeCategory === "all" || activeCategory === "statuses") && filteredStatuses.length > 0 && (
          <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <span className="text-sm">🩸</span>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Condições & Estados ({filteredStatuses.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStatuses.map((st) => (
                <div key={st.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-200">{st.name}</span>
                    {st.effect && (
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                        {st.effect}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{st.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Custom Sections */}
        {(activeCategory === "all" || activeCategory === "custom") && (activeSystem.sections || []).length > 0 && (
          <div className="space-y-4">
            {(activeSystem.sections || []).map((sec) => (
              <div key={sec.id} className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {sec.title} ({sec.items.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => onOpenSectionModal(sec)}
                    className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar Seção</span>
                  </button>
                </div>

                {sec.description && (
                  <p className="text-xs text-slate-400">{sec.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sec.items.map((it) => (
                    <div key={it.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1">
                      <span className="text-xs font-bold text-slate-200 block">{it.name}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{it.description}</p>
                      {it.tags && it.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 font-mono text-[9px] text-indigo-300">
                          {it.tags.map((t, idx) => (
                            <span key={idx} className="bg-indigo-950/60 px-1.5 py-0.2 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
