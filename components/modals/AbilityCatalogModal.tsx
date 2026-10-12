"use client";

import React, { useState } from "react";
import { Character, RpgSystemRules, CustomAbility } from "@/types/rpg";
import { getAbilityPrerequisites } from "@/lib/rulesEngine";
import { X, BookOpen, Search, Plus, Check, Zap, Sparkles } from "lucide-react";

interface AbilityCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCharacter: Character | null;
  activeSystem: RpgSystemRules | null;
  onUpdateCharacter: (updated: Character) => void;
}

export function AbilityCatalogModal({
  isOpen,
  onClose,
  activeCharacter,
  activeSystem,
  onUpdateCharacter,
}: AbilityCatalogModalProps) {
  const [tab, setTab] = useState<"catalog" | "create">("catalog");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");

  // Create Custom Form
  const [customName, setCustomName] = useState("");
  const [customClass, setCustomClass] = useState(activeCharacter?.className || "Geral");
  const [customCost, setCustomCost] = useState("Passiva");
  const [customCategory, setCustomCategory] = useState("Geral");
  const [customDesc, setCustomDesc] = useState("");

  if (!isOpen || !activeCharacter || !activeSystem) return null;

  const handleToggleSystemAbility = (abilityName: string) => {
    const isSelected = activeCharacter.selectedAbilities.includes(abilityName);
    const next = isSelected
      ? activeCharacter.selectedAbilities.filter((a) => a !== abilityName)
      : [...activeCharacter.selectedAbilities, abilityName];

    onUpdateCharacter({
      ...activeCharacter,
      selectedAbilities: next,
    });
  };

  const handleCreateCustomAbility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newAb: CustomAbility = {
      id: `cab_${Date.now()}`,
      name: customName.trim(),
      className: customClass.trim() || activeCharacter.className,
      cost: customCost.trim() || "Passiva",
      category: customCategory.trim() || "Geral",
      description: customDesc.trim(),
    };

    onUpdateCharacter({
      ...activeCharacter,
      customAbilities: [...activeCharacter.customAbilities, newAb],
    });

    setCustomName("");
    setCustomDesc("");
    setTab("catalog");
  };

  const classesList = activeSystem.classes || [];

  const filteredAbilities = activeSystem.abilities.filter((ab) => {
    if (classFilter !== "ALL") {
      if (classFilter === activeCharacter.className) {
        if (ab.className && ab.className !== activeCharacter.className && ab.className !== "Geral") {
          return false;
        }
      } else if (ab.className !== classFilter) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const reqs = getAbilityPrerequisites(ab);
      const reqMatch = reqs.some((r) => r.toLowerCase().includes(q));
      return (
        ab.name.toLowerCase().includes(q) ||
        ab.description.toLowerCase().includes(q) ||
        (ab.className && ab.className.toLowerCase().includes(q)) ||
        reqMatch
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl flex flex-col max-h-[90vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-serif">
                Catálogo de Habilidades & Talentos ({activeSystem.name})
              </h3>
              <p className="text-[11px] text-slate-400">
                Adicionando para <strong className="text-white">{activeCharacter.name}</strong> ({activeCharacter.className})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls: Catalog vs Create Custom */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-2 rounded-xl border border-slate-850 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTab("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === "catalog"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Catálogo do Sistema ({activeSystem.abilities.length})
            </button>
            <button
              onClick={() => setTab("create")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tab === "create"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              + Criar Habilidade Personalizada
            </button>
          </div>

          {tab === "catalog" && (
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou regra..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Class Filter Strip (in Catalog mode) */}
        {tab === "catalog" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-xs font-mono">
            <span className="text-[10px] uppercase text-slate-500 shrink-0 mr-1">Filtro:</span>
            <button
              onClick={() => setClassFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                classFilter === "ALL"
                  ? "bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setClassFilter(activeCharacter.className)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                classFilter === activeCharacter.className
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Classe: {activeCharacter.className}
            </button>
            {classesList
              .filter((c) => c.name !== activeCharacter.className)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClassFilter(c.name)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    classFilter === c.name
                      ? "bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {c.name}
                </button>
              ))}
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[280px]">
          {tab === "create" ? (
            /* Create Custom Ability Form */
            <form onSubmit={handleCreateCustomAbility} className="bg-slate-950 p-5 rounded-2xl border border-amber-900/40 space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-amber-300 font-serif">
                  Nova Habilidade Personalizada para {activeCharacter.name}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">Nome da Habilidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Golpe de Precisão, Escudo de Sangue..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">Custo em Recursos / Ação</label>
                  <input
                    type="text"
                    placeholder="Ex: 2 PM, 1 Ação Padrão, Passiva..."
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">Descrição & Efeito Mecânico *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o efeito exato, rolagens adicionais de dano ou bônus que esta habilidade concede..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setTab("catalog")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Voltar ao Catálogo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Salvar e Adicionar à Ficha
                </button>
              </div>
            </form>
          ) : (
            /* System Catalog Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAbilities.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                  Nenhuma habilidade encontrada para o filtro atual.
                </div>
              ) : (
                filteredAbilities.map((ab) => {
                  const isEquipped = activeCharacter.selectedAbilities.includes(ab.name);
                  const reqs = getAbilityPrerequisites(ab);

                  return (
                    <div
                      key={ab.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        isEquipped
                          ? "bg-indigo-950/30 border-indigo-500/60 shadow-md shadow-indigo-600/10"
                          : "bg-slate-950/80 border-slate-850 hover:border-slate-750"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-white block">{ab.name}</span>
                            {ab.className && (
                              <span className="text-[10px] font-mono text-indigo-400">
                                {ab.className}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-800 px-2 py-0.5 rounded shrink-0">
                            {ab.cost || "Passiva"}
                          </span>
                        </div>

                        {reqs.length > 0 && (
                          <div className="flex flex-wrap gap-1 font-mono text-[9px] text-amber-400">
                            {reqs.map((r, i) => (
                              <span key={i} className="bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-900/40">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {ab.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex justify-end">
                        <button
                          onClick={() => handleToggleSystemAbility(ab.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isEquipped
                              ? "bg-emerald-950 hover:bg-rose-950 text-emerald-300 hover:text-rose-300 border border-emerald-500/50 hover:border-rose-500"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                          }`}
                        >
                          {isEquipped ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Equipada (Remover)</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adicionar à Ficha</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 shrink-0 text-xs">
          <span className="text-slate-500 font-mono">
            {activeCharacter.selectedAbilities.length} habilidades equipadas
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
