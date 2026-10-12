"use client";

import React, { useState, useEffect } from "react";
import { Character, RpgSystemRules, CharacterResource } from "@/types/rpg";
import { X, User, Heart, Shield } from "lucide-react";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterToEdit?: Character | null;
  activeSystem: RpgSystemRules | null;
  campaignId: string;
  onSave: (char: Character) => void;
}

export function CharacterModal({
  isOpen,
  onClose,
  characterToEdit,
  activeSystem,
  campaignId,
  onSave,
}: CharacterModalProps) {
  const [name, setName] = useState(characterToEdit?.name || "");
  const [player, setPlayer] = useState(characterToEdit?.player || "");
  const [className, setClassName] = useState(
    characterToEdit?.className || activeSystem?.classes[0]?.name || "Aventureiro"
  );
  const [level, setLevel] = useState(characterToEdit?.level || 1);
  const [hpStyle, setHpStyle] = useState<"numeric" | "boxes">(
    characterToEdit?.hpStyle || activeSystem?.healthConfig?.style || "numeric"
  );
  const [hpLabel, setHpLabel] = useState(
    characterToEdit?.hpLabel ||
      activeSystem?.healthConfig?.label ||
      (activeSystem?.healthConfig?.style === "boxes" ? "Caixas de Ferimentos" : "Pontos de Vida (PV)")
  );
  const [maxHp, setMaxHp] = useState(
    characterToEdit?.maxHp || activeSystem?.healthConfig?.defaultMaxHp || 15
  );
  const [currentHp, setCurrentHp] = useState(
    characterToEdit?.currentHp ?? activeSystem?.healthConfig?.defaultMaxHp ?? 15
  );
  const [background, setBackground] = useState(characterToEdit?.background || "");
  const [notes, setNotes] = useState(characterToEdit?.notes || "");
  const [attributes, setAttributes] = useState<Record<string, number>>(() => {
    if (characterToEdit?.attributes) return { ...characterToEdit.attributes };
    const initialAttrs: Record<string, number> = {};
    (activeSystem?.attributes || []).forEach((a) => {
      initialAttrs[a.shortName] = activeSystem?.id === "coc7e" ? 50 : 10;
    });
    return initialAttrs;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build initial resources from system if creating new
    let resources: CharacterResource[] = characterToEdit?.resources || [];
    if (!characterToEdit && activeSystem?.resourceTracks) {
      resources = activeSystem.resourceTracks.map((rt) => ({
        id: `res_${Date.now()}_${rt.id}`,
        name: rt.name,
        current: rt.defaultMax,
        max: rt.defaultMax,
        color: rt.color,
      }));
    }

    const char: Character = {
      id: characterToEdit?.id || `char_${Date.now()}`,
      campaignId,
      name: name.trim(),
      player: player.trim() || "Jogador Convidado",
      className: className.trim() || "Guerreiro",
      level: Math.max(1, level),
      currentHp: Math.min(maxHp, currentHp),
      maxHp: Math.max(1, maxHp),
      hpStyle,
      hpLabel: hpLabel.trim() || (hpStyle === "boxes" ? "Caixas de Ferimentos" : "Pontos de Vida (PV)"),
      attributes,
      resources,
      activeStatuses: characterToEdit?.activeStatuses || [],
      selectedAbilities: characterToEdit?.selectedAbilities || [],
      customAbilities: characterToEdit?.customAbilities || [],
      selectedSpells: characterToEdit?.selectedSpells || [],
      inventory: characterToEdit?.inventory || [
        { id: "inv_1", name: "Arma Inicial", quantity: 1, equipped: true },
        { id: "inv_2", name: "Rações de Viagem (3 dias)", quantity: 3, equipped: false },
      ],
      background: background.trim(),
      notes: notes.trim(),
    };

    onSave(char);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-serif">
              {characterToEdit ? `Editar Ficha: ${characterToEdit.name}` : "Criar Nova Ficha de Personagem"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Nome do Personagem *</label>
              <input
                type="text"
                required
                placeholder="Ex: Aethelgard, Lyanna, Thorne..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Nome do Jogador</label>
              <input
                type="text"
                placeholder="Ex: Você ou convidado"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="font-mono font-bold text-slate-300 block mb-1">Classe do Sistema *</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {(activeSystem?.classes || []).map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name} (PV: {cls.hpFormula})
                  </option>
                ))}
                <option value="Personalizado">Outra / Personalizada</option>
              </select>
            </div>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Nível Inicial</label>
              <input
                type="number"
                min={1}
                max={30}
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 tabular-nums"
              />
            </div>
          </div>

          {/* Health Mechanics */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Mecânica de Vida / Ferimentos:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-slate-400 block mb-1">Estilo de Exibição</label>
                <select
                  value={hpStyle}
                  onChange={(e) => setHpStyle(e.target.value as "numeric" | "boxes")}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="numeric">Barra Numérica Tradicional</option>
                  <option value="boxes">Caixas Clicáveis de Ferimentos</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-slate-400 block mb-1">
                  {hpStyle === "boxes" ? "Total de Caixas" : "PV Máximo"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxHp}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setMaxHp(val);
                    if (!characterToEdit) setCurrentHp(val);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 tabular-nums"
                />
              </div>

              <div>
                <label className="font-mono text-slate-400 block mb-1">Rótulo / Título</label>
                <input
                  type="text"
                  placeholder="Ex: Pontos de Vida, Caixas de Estresse..."
                  value={hpLabel}
                  onChange={(e) => setHpLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Attributes Definition based on System */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Valores dos Atributos ({activeSystem?.attributes.length || 0}):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(activeSystem?.attributes || []).map((attr) => {
                const short = attr.shortName;
                const currentScore = attributes[short] ?? attributes[attr.name] ?? (activeSystem?.id === "coc7e" ? 50 : 10);

                return (
                  <div key={attr.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850 text-center space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block truncate">
                      {attr.name} ({short})
                    </span>
                    <input
                      type="number"
                      value={currentScore}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setAttributes((prev) => ({
                          ...prev,
                          [short]: val,
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 text-center text-white font-mono font-bold focus:outline-none focus:border-indigo-500 tabular-nums text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Histórico / Background</label>
              <textarea
                rows={3}
                placeholder="Origem, laços e motivações do personagem..."
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Notas & Segredos</label>
              <textarea
                rows={3}
                placeholder="Anotações para o mestre ou segredos do herói..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {characterToEdit ? "Salvar Alterações" : "Criar Ficha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
