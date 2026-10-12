"use client";

import React, { useState } from "react";
import { Campaign, RpgSystemRules } from "@/types/rpg";
import { X, Shield, Plus } from "lucide-react";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: RpgSystemRules[];
  onCreate: (campaign: Campaign) => void;
}

export function CampaignModal({
  isOpen,
  onClose,
  systems,
  onCreate,
}: CampaignModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeSystemId, setActiveSystemId] = useState(systems[0]?.id || "t20");
  const [odysseusName, setOdysseusName] = useState("Odysseus Mestre IA");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      activeSystemId,
      odysseusName: odysseusName.trim() || "Odysseus Mestre IA",
      characters: [],
      sessionLogs: [],
      npcList: [],
      versionHistory: [
        {
          id: `ver_${Date.now()}`,
          version: "v1.0",
          date: new Date().toISOString().split("T")[0],
          summaryOfChanges: "Campanha iniciada.",
          mechanicsImpact: "Regras do sistema vinculadas.",
          migrationRules: "Fichas iniciais prontas.",
        },
      ],
    };

    onCreate(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-serif">
              Criar Nova Mesa / Campanha
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
              Nome da Campanha *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: A Sombra de Strahd, Crônicas de Arton, Caso 04..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Sistema de Regras Base *
            </label>
            <select
              value={activeSystemId}
              onChange={(e) => setActiveSystemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {systems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name} ({sys.version})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Nome do Copiloto / Mestre IA
            </label>
            <input
              type="text"
              placeholder="Ex: Odysseus Mestre IA, Oráculo Arcano..."
              value={odysseusName}
              onChange={(e) => setOdysseusName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">
              Ambientação & Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Descreva a premissa da aventura, o cenário ou o objetivo inicial..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              Criar Mesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
