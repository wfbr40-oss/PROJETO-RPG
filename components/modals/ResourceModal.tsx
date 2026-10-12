"use client";

import React, { useState } from "react";
import { CharacterResource } from "@/types/rpg";
import { X, Flame } from "lucide-react";

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: CharacterResource) => void;
}

export function ResourceModal({
  isOpen,
  onClose,
  onAddResource,
}: ResourceModalProps) {
  const [name, setName] = useState("");
  const [max, setMax] = useState(15);
  const [color, setColor] = useState<string>("indigo");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddResource({
      id: `res_${Date.now()}`,
      name: name.trim(),
      current: Math.max(1, max),
      max: Math.max(1, max),
      color,
    });

    setName("");
    setMax(15);
    onClose();
  };

  const colors = [
    { id: "indigo", bg: "bg-indigo-600", label: "Índigo" },
    { id: "cyan", bg: "bg-cyan-500", label: "Ciano (Mana)" },
    { id: "purple", bg: "bg-purple-600", label: "Púrpura (Místico)" },
    { id: "emerald", bg: "bg-emerald-500", label: "Esmeralda (Vigor)" },
    { id: "amber", bg: "bg-amber-500", label: "Âmbar (Sorte/Fúria)" },
    { id: "rose", bg: "bg-rose-500", label: "Rosa (Sanidade)" },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-serif">
              Adicionar Barra de Recurso
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
          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Nome do Recurso *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Pontos de Mana, PE, Sanidade, Escudo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Capacidade Máxima *
            </label>
            <input
              type="number"
              min={1}
              required
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-500 tabular-nums"
            />
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Cor da Barra
            </label>
            <div className="flex items-center gap-2 pt-1">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer ${
                    color === c.id ? "ring-2 ring-white scale-110 shadow-lg" : "opacity-60 hover:opacity-100"
                  }`}
                  title={c.label}
                />
              ))}
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
