"use client";

import React, { useState } from "react";
import { CharacterStatus, RpgSystemRules } from "@/types/rpg";
import { X, ShieldAlert } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSystem: RpgSystemRules | null;
  onAddStatus: (status: CharacterStatus) => void;
}

export function StatusModal({
  isOpen,
  onClose,
  activeSystem,
  onAddStatus,
}: StatusModalProps) {
  const [name, setName] = useState("");
  const [effect, setEffect] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(1);

  if (!isOpen) return null;

  const handleSelectPredefined = (statusName: string) => {
    if (!statusName) return;
    const found = activeSystem?.statuses.find((s) => s.name === statusName);
    if (found) {
      setName(found.name);
      setEffect(found.effect || "");
      setDescription(found.description || "");
      setSeverity(found.defaultSeverity || 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStatus({
      id: `st_${Date.now()}`,
      name: name.trim(),
      effect: effect.trim() || undefined,
      description: description.trim() || undefined,
      severity: Math.max(1, severity),
    });

    setName("");
    setEffect("");
    setDescription("");
    setSeverity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-rose-900/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🩸</span>
            <h3 className="text-sm font-bold text-white font-serif">
              Aplicar Condição / Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {activeSystem && activeSystem.statuses.length > 0 && (
            <div>
              <label className="font-mono font-bold text-slate-400 block mb-1">
                Escolher do Sistema ({activeSystem.name})
              </label>
              <select
                onChange={(e) => handleSelectPredefined(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">-- Selecione uma condição predefinida --</option>
                {activeSystem.statuses.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} {st.effect ? `(${st.effect})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Nome da Condição *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sangrando, Envenenado, Cego, Abalado, Em Chamas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">
                Efeito / Penalidade Mecânica
              </label>
              <input
                type="text"
                placeholder="Ex: -2 em testes de ataque, -1d6 PV/rodada"
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">
                Nível / Severidade Inicial
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-rose-500 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Descrição Detalhada & Cura
            </label>
            <textarea
              rows={2}
              placeholder="Como remover a condição ou detalhes da ferida..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Aplicar à Ficha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
