"use client";

import React, { useState } from "react";
import { RpgSystemRules, SystemIdentity } from "@/types/rpg";
import { X, Sparkles } from "lucide-react";

interface IdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: RpgSystemRules | null;
  onSave: (updatedIdentity: SystemIdentity) => void;
}

export function IdentityModal({
  isOpen,
  onClose,
  system,
  onSave,
}: IdentityModalProps) {
  const [coreMechanic, setCoreMechanic] = useState(system?.identity?.coreMechanic || "");
  const [tone, setTone] = useState(system?.identity?.tone || "");
  const [criticalRule, setCriticalRule] = useState(system?.identity?.criticalRule || "");
  const [fumbleRule, setFumbleRule] = useState(system?.identity?.fumbleRule || "");

  if (!isOpen || !system) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      coreMechanic: coreMechanic.trim(),
      tone: tone.trim(),
      criticalRule: criticalRule.trim(),
      fumbleRule: fumbleRule.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-serif">
              Mecânica Core & Identidade ({system.name})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Como os Testes São Resolvidos (Mecânica Core) *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ex: 1d20 + Atributo + Bônus vs CD; 2d6 PbtA com sucesso parcial em 7-9; 1d100 Roll-Under..."
              value={coreMechanic}
              onChange={(e) => setCoreMechanic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Gênero, Tom & Atmosfera do Cenário *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Fantasia Épica, Horror Cósmico, Ficção Cyberpunk Sombria..."
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">
                Regra de Acerto Crítico
              </label>
              <input
                type="text"
                placeholder="Ex: 20 no d20 (Dano dobrado)"
                value={criticalRule}
                onChange={(e) => setCriticalRule(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">
                Regra de Falha Crítica
              </label>
              <input
                type="text"
                placeholder="Ex: 1 no d20 ou 96-100 no d100"
                value={fumbleRule}
                onChange={(e) => setFumbleRule(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Salvar Mecânica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
