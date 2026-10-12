"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Character,
  RpgSystemRules,
  DiceRollResult,
  CharacterResource,
  CharacterStatus,
  InventoryItem,
} from "@/types/rpg";
import {
  calculateAttributeModifier,
  formatModifier,
  getCharacterHpConfig,
  parseAndRollDice,
  RpgSoundFX,
  getAbilityPrerequisites,
} from "@/lib/rulesEngine";
import {
  Plus,
  Edit2,
  Trash2,
  Zap,
  Sparkles,
  Shield,
  Heart,
  Dices,
  BookOpen,
  Check,
  Flame,
  Minus,
  Swords,
  Package,
  Scroll,
} from "lucide-react";

interface SheetsTabProps {
  activeCharacter: Character | null;
  characters: Character[];
  activeSystem: RpgSystemRules | null;
  onSelectCharacter: (id: string) => void;
  onOpenCreateChar: () => void;
  onOpenEditChar: () => void;
  onDeleteCharacter: (id: string) => void;
  onUpdateCharacter: (updated: Character) => void;
  onRollDice: (formula: string, charName?: string, reason?: string) => void;
  onUseAbilityInChat: (abilityName: string, cost?: string, desc?: string) => void;
  onOpenAbilityCatalog: () => void;
  onOpenAddResource: () => void;
  onOpenAddStatus: () => void;
}

export function SheetsTab({
  activeCharacter,
  characters,
  activeSystem,
  onSelectCharacter,
  onOpenCreateChar,
  onOpenEditChar,
  onDeleteCharacter,
  onUpdateCharacter,
  onRollDice,
  onUseAbilityInChat,
  onOpenAbilityCatalog,
  onOpenAddResource,
  onOpenAddStatus,
}: SheetsTabProps) {
  const [newInventoryName, setNewInventoryName] = useState("");

  if (!activeCharacter) {
    return (
      <div className="p-12 text-center bg-[#111116] rounded-2xl border border-slate-800 space-y-4 max-w-xl mx-auto my-8">
        <Shield className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white font-serif">Nenhuma Ficha Criada</h3>
        <p className="text-xs text-slate-400">
          Crie sua primeira ficha de personagem totalmente sincronizada com as regras de{" "}
          <strong className="text-indigo-300">{activeSystem?.name || "seu sistema"}</strong>.
        </p>
        <button
          onClick={onOpenCreateChar}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          Criar Nova Ficha de Personagem
        </button>
      </div>
    );
  }

  const hpConfig = getCharacterHpConfig(activeCharacter, activeSystem);
  const isBoxes = hpConfig.style === "boxes";

  // HP Adjuster
  const handleAdjustHp = (delta: number) => {
    const next = Math.max(0, Math.min(activeCharacter.maxHp, activeCharacter.currentHp + delta));
    onUpdateCharacter({
      ...activeCharacter,
      currentHp: next,
    });
  };

  // Toggle single box in boxes mode
  const handleToggleBox = (index: number) => {
    RpgSoundFX.playClick();
    let next: number;
    if (index < activeCharacter.currentHp) {
      next = index;
    } else {
      next = index + 1;
    }
    onUpdateCharacter({
      ...activeCharacter,
      currentHp: Math.max(0, Math.min(activeCharacter.maxHp, next)),
    });
  };

  // Adjust resource
  const handleAdjustResource = (resId: string, delta: number) => {
    RpgSoundFX.playClick();
    const updatedResources = activeCharacter.resources.map((r) => {
      if (r.id === resId) {
        const next = Math.max(0, Math.min(r.max, r.current + delta));
        return { ...r, current: next };
      }
      return r;
    });
    onUpdateCharacter({
      ...activeCharacter,
      resources: updatedResources,
    });
  };

  const handleRemoveResource = (resId: string) => {
    onUpdateCharacter({
      ...activeCharacter,
      resources: activeCharacter.resources.filter((r) => r.id !== resId),
    });
  };

  // Adjust Status Severity
  const handleAdjustStatusSeverity = (statusId: string, delta: number) => {
    const updated = activeCharacter.activeStatuses
      .map((st) => {
        if (st.id === statusId) {
          const next = st.severity + delta;
          return next > 0 ? { ...st, severity: next } : null;
        }
        return st;
      })
      .filter(Boolean) as CharacterStatus[];
    onUpdateCharacter({
      ...activeCharacter,
      activeStatuses: updated,
    });
  };

  const handleRemoveStatus = (statusId: string) => {
    onUpdateCharacter({
      ...activeCharacter,
      activeStatuses: activeCharacter.activeStatuses.filter((s) => s.id !== statusId),
    });
  };

  // Level Up / Down with automated HP increment
  const handleLevelDelta = (delta: number) => {
    const nextLvl = Math.max(1, activeCharacter.level + delta);
    const hpStep = 6; // Standard step
    const nextMaxHp = delta > 0 ? activeCharacter.maxHp + hpStep : Math.max(10, activeCharacter.maxHp - hpStep);
    onUpdateCharacter({
      ...activeCharacter,
      level: nextLvl,
      maxHp: nextMaxHp,
      currentHp: delta > 0 ? activeCharacter.currentHp + hpStep : Math.min(activeCharacter.currentHp, nextMaxHp),
    });
  };

  // Roll attribute check
  const handleRollAttribute = (attrName: string, shortName: string) => {
    RpgSoundFX.playDiceRoll();
    const score = activeCharacter.attributes[shortName] ?? activeCharacter.attributes[attrName] ?? 10;
    const mod = calculateAttributeModifier(score, activeSystem);
    const modStr = mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : "";
    const formula = activeSystem?.id === "coc7e" ? "1d100" : `1d20${modStr}`;
    onRollDice(formula, activeCharacter.name, `Teste de ${attrName} (${formatModifier(mod, activeSystem)})`);
  };

  // Inventory additions
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInventoryName.trim()) return;
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newInventoryName.trim(),
      quantity: 1,
      equipped: false,
    };
    onUpdateCharacter({
      ...activeCharacter,
      inventory: [...activeCharacter.inventory, newItem],
    });
    setNewInventoryName("");
  };

  const handleRemoveInventory = (itemId: string) => {
    onUpdateCharacter({
      ...activeCharacter,
      inventory: activeCharacter.inventory.filter((i) => i.id !== itemId),
    });
  };

  const handleToggleEquipped = (itemId: string) => {
    onUpdateCharacter({
      ...activeCharacter,
      inventory: activeCharacter.inventory.map((i) =>
        i.id === itemId ? { ...i, equipped: !i.equipped } : i
      ),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Character Selector Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase text-slate-500 mr-1">Personagem:</span>
          {characters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onSelectCharacter(ch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCharacter.id === ch.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateChar}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Ficha</span>
        </button>
      </div>

      {/* 2. Character Header Banner */}
      <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shrink-0 bg-slate-900 shadow-lg">
            <Image
              src={activeCharacter.avatarUrl || "/images/rpg_character_warrior_1791814206417.jpg"}
              alt={activeCharacter.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                {activeCharacter.name}
              </h2>
              <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-900/40">
                {activeCharacter.player || "Jogador"}
              </span>
            </div>

            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-emerald-400">{activeCharacter.className}</span>
              <span>·</span>
              <span>Nível {activeCharacter.level}</span>
              <span>·</span>
              <span className="text-slate-400">{activeSystem?.name || "Sistema"}</span>
            </div>

            {activeCharacter.background && (
              <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 italic max-w-xl">
                &ldquo;{activeCharacter.background}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Level Controls & Edit Actions */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-center">
            <div className="px-2">
              <span className="text-[9px] uppercase text-slate-500 block">Nível</span>
              <span className="text-sm font-bold text-white tabular-nums">{activeCharacter.level}</span>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleLevelDelta(1)}
                className="px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 rounded text-[9px] font-bold cursor-pointer"
                title="Subir de nível (+HP automático)"
              >
                + LVL
              </button>
              <button
                onClick={() => handleLevelDelta(-1)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] cursor-pointer"
                title="Descer de nível"
              >
                - LVL
              </button>
            </div>
          </div>

          <button
            onClick={onOpenEditChar}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Editar Ficha</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Deseja remover a ficha de ${activeCharacter.name}?`)) {
                onDeleteCharacter(activeCharacter.id);
              }
            }}
            className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Excluir ficha"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Attributes Grid (Fully adapted to active system's rules) */}
      <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest">
              Atributos do Sistema ({activeSystem?.attributes.length || 0})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Clique no botão de dado para rolar o teste com modificador
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(activeSystem?.attributes || []).map((attr) => {
            const short = attr.shortName;
            const score = activeCharacter.attributes[short] ?? activeCharacter.attributes[attr.name] ?? 10;
            const mod = calculateAttributeModifier(score, activeSystem);
            const modFormatted = formatModifier(mod, activeSystem);

            return (
              <div
                key={attr.id}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 rounded-xl p-3 text-center space-y-1.5 transition-all group"
                title={attr.description}
              >
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider truncate">
                  {attr.name}
                </div>
                <div className="text-2xl font-black font-mono text-white tabular-nums">
                  {score}
                </div>
                <div className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                  {modFormatted}
                </div>
                <button
                  onClick={() => handleRollAttribute(attr.name, short)}
                  className="w-full py-1 mt-1 bg-slate-900 group-hover:bg-indigo-600/30 group-hover:text-indigo-200 border border-slate-800 group-hover:border-indigo-500/40 rounded-lg text-[10px] font-mono font-semibold text-slate-400 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Dices className="w-3 h-3 text-cyan-400" />
                  <span>Rolar</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Health & Resource Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Health Card (Numeric or Boxes) */}
        <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {hpConfig.label}
                </h4>
              </div>
              <button
                onClick={() => {
                  const newStyle = isBoxes ? "numeric" : "boxes";
                  onUpdateCharacter({
                    ...activeCharacter,
                    hpStyle: newStyle,
                  });
                }}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Alternar para {isBoxes ? "Barra Numérica" : "Caixas de Ferimentos"}
              </button>
            </div>

            {isBoxes ? (
              /* BOXES MODE */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Integridade:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {activeCharacter.currentHp} / {activeCharacter.maxHp} Intactas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-850">
                  {Array.from({ length: activeCharacter.maxHp }).map((_, idx) => {
                    const isIntact = idx < activeCharacter.currentHp;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleBox(idx)}
                        className={`w-9 h-9 rounded-lg border flex flex-col items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                          isIntact
                            ? "bg-emerald-950/60 border-emerald-500/70 text-emerald-300 hover:bg-emerald-900"
                            : "bg-rose-950/80 border-rose-600 text-rose-300 hover:bg-rose-900"
                        }`}
                        title={isIntact ? `Caixa ${idx + 1} intacta (clique para marcar dano)` : `Caixa ${idx + 1} ferida (clique para curar)`}
                      >
                        <span className="text-[10px] opacity-60 font-sans">{idx + 1}</span>
                        <span className="text-xs">{isIntact ? "✓" : "✗"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* NUMERIC MODE */
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                  <span>Vitalidade Atual</span>
                  <span className="tabular-nums">
                    {activeCharacter.currentHp} / {activeCharacter.maxHp} PV
                  </span>
                </div>
                <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      activeCharacter.currentHp / activeCharacter.maxHp > 0.5
                        ? "bg-emerald-500"
                        : activeCharacter.currentHp / activeCharacter.maxHp > 0.25
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, (activeCharacter.currentHp / activeCharacter.maxHp) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-850">
            <div className="flex gap-1.5 font-mono text-xs">
              <button
                onClick={() => handleAdjustHp(-1)}
                className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 rounded-lg font-bold cursor-pointer"
              >
                -1
              </button>
              <button
                onClick={() => handleAdjustHp(-5)}
                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 rounded-lg font-bold cursor-pointer"
              >
                -5
              </button>
              <button
                onClick={() => handleAdjustHp(1)}
                className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 rounded-lg font-bold cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={() => handleAdjustHp(5)}
                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 rounded-lg font-bold cursor-pointer"
              >
                +5
              </button>
            </div>
            <button
              onClick={() => handleAdjustHp(activeCharacter.maxHp)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-mono font-semibold cursor-pointer"
            >
              Cura Total
            </button>
          </div>
        </div>

        {/* Secondary Resources (Mana, PE, Sanidade, etc.) */}
        <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Barras de Recursos Secundários
                </h4>
              </div>
              <button
                onClick={onOpenAddResource}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar Barra</span>
              </button>
            </div>

            {activeCharacter.resources.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">
                Nenhuma barra secundária configurada (ex: Mana, Pontos de Esforço, Sanidade).
              </p>
            ) : (
              <div className="space-y-3">
                {activeCharacter.resources.map((res) => {
                  const pct = Math.round((res.current / res.max) * 100);
                  return (
                    <div
                      key={res.id}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-200">{res.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-bold tabular-nums">
                            {res.current} / {res.max}
                          </span>
                          <button
                            onClick={() => handleRemoveResource(res.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                            title="Remover barra"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono pt-1">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAdjustResource(res.id, -1)}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold cursor-pointer"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleAdjustResource(res.id, -5)}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold cursor-pointer"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleAdjustResource(res.id, 1)}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold cursor-pointer"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustResource(res.id, 5)}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-bold cursor-pointer"
                          >
                            +5
                          </button>
                        </div>
                        <button
                          onClick={() => handleAdjustResource(res.id, res.max)}
                          className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                        >
                          Restaurar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Conditions & Statuses Panel */}
      <div className="bg-[#111116] border border-rose-900/40 rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">🩸</span>
            <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
              Status & Condições Ativas ({activeCharacter.activeStatuses.length})
            </h4>
          </div>
          <button
            onClick={onOpenAddStatus}
            className="flex items-center gap-1 text-xs font-mono text-rose-300 hover:text-rose-200 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aplicar Condição</span>
          </button>
        </div>

        {activeCharacter.activeStatuses.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 italic">
            Nenhuma condição ou penalidade ativa no herói no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCharacter.activeStatuses.map((st) => (
              <div
                key={st.id}
                className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{st.name}</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <button
                      onClick={() => handleAdjustStatusSeverity(st.id, -1)}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                      title="Diminuir nível"
                    >
                      -
                    </button>
                    <span className="text-rose-300 font-bold px-1 tabular-nums">Nível {st.severity}</span>
                    <button
                      onClick={() => handleAdjustStatusSeverity(st.id, 1)}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                      title="Aumentar nível"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveStatus(st.id)}
                      className="ml-1 text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                      title="Remover status"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {st.effect && (
                  <p className="text-[11px] font-mono text-rose-200 bg-rose-950/30 p-1 rounded border border-rose-900/30">
                    {st.effect}
                  </p>
                )}

                {st.description && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {st.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Active Abilities & Spells */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Abilities Card */}
        <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Habilidades & Talentos Ativos (
                {activeCharacter.selectedAbilities.length + activeCharacter.customAbilities.length}
                )
              </h4>
            </div>
            <button
              onClick={onOpenAbilityCatalog}
              className="flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Abrir Catálogo do Sistema</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activeCharacter.selectedAbilities.length === 0 &&
            activeCharacter.customAbilities.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                Nenhuma habilidade equipada na ficha. Clique em &ldquo;Abrir Catálogo&rdquo; para escolher.
              </p>
            ) : (
              <>
                {/* System selected abilities */}
                {activeCharacter.selectedAbilities.map((abName, idx) => {
                  const sysAb = activeSystem?.abilities.find((a) => a.name === abName);
                  return (
                    <div
                      key={`sys_ab_${idx}`}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{abName}</span>
                        <div className="flex items-center gap-2">
                          {sysAb?.cost && (
                            <span className="text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-800 px-2 py-0.5 rounded">
                              {sysAb.cost}
                            </span>
                          )}
                          <button
                            onClick={() =>
                              onUseAbilityInChat(abName, sysAb?.cost, sysAb?.description)
                            }
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                          >
                            Usar em Jogo
                          </button>
                        </div>
                      </div>
                      {sysAb?.description && (
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {sysAb.description}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Custom abilities */}
                {activeCharacter.customAbilities.map((cab) => (
                  <div
                    key={cab.id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-200">{cab.name}</span>
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded">
                          Personalizada
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cab.cost && (
                          <span className="text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-800 px-2 py-0.5 rounded">
                            {cab.cost}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            onUseAbilityInChat(cab.name, cab.cost, cab.description)
                          }
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                        >
                          Usar em Jogo
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{cab.description}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Spells Card */}
        <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Grimório de Magias ({activeCharacter.selectedSpells.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {activeSystem?.spells.length || 0} magias no sistema
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {(activeSystem?.spells || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                O sistema ativo não possui magias cadastradas.
              </p>
            ) : (
              (activeSystem?.spells || []).map((sp) => {
                const isLearned = activeCharacter.selectedSpells.includes(sp.name);
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      const next = isLearned
                        ? activeCharacter.selectedSpells.filter((s) => s !== sp.name)
                        : [...activeCharacter.selectedSpells, sp.name];
                      onUpdateCharacter({
                        ...activeCharacter,
                        selectedSpells: next,
                      });
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isLearned
                        ? "bg-purple-950/30 border-purple-500/50 text-slate-200"
                        : "bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-750"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isLearned ? "text-purple-200" : "text-slate-300"}`}>
                          {sp.name}
                        </span>
                        <span className="text-[9px] font-mono text-purple-400 bg-purple-950 px-1.5 py-0.2 rounded">
                          {sp.circleOrLevel || "1º Círculo"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{sp.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">{sp.cost || "PM"}</span>
                      <span className={`text-[10px] font-mono font-bold ${isLearned ? "text-purple-400" : "text-slate-600"}`}>
                        {isLearned ? "Memorizada" : "Aprender"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 7. Inventory & Campaign Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inventory */}
        <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Mochila & Equipamentos ({activeCharacter.inventory.length})
              </h4>
            </div>
          </div>

          <form onSubmit={handleAddInventory} className="flex gap-2">
            <input
              type="text"
              placeholder="Adicionar item à mochila..."
              value={newInventoryName}
              onChange={(e) => setNewInventoryName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Adicionar
            </button>
          </form>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {activeCharacter.inventory.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center italic">Mochila vazia.</p>
            ) : (
              activeCharacter.inventory.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => handleToggleEquipped(item.id)}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${
                        item.equipped
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                      title="Equipar / Guardar"
                    >
                      {item.equipped ? "Equipado" : "Mochila"}
                    </button>
                    <span className="text-slate-200 font-medium truncate">{item.name}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveInventory(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Campaign Notes & Secret Background */}
        <div className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <Scroll className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Anotações & Segredos do Jogador
            </h4>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Origem & Antecedentes:
            </span>
            <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-850 leading-relaxed italic">
              {activeCharacter.background || "Nenhum histórico definido."}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Diário & Pistas Descobertas:
            </span>
            <textarea
              rows={3}
              value={activeCharacter.notes}
              onChange={(e) =>
                onUpdateCharacter({
                  ...activeCharacter,
                  notes: e.target.value,
                })
              }
              placeholder="Escreva pistas, segredos ou objetivos do herói aqui..."
              className="w-full bg-slate-950/80 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
