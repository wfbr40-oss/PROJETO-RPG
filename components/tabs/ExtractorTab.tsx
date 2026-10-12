"use client";

import React, { useState } from "react";
import { RpgSystemRules } from "@/types/rpg";
import {
  Sparkles,
  FileText,
  RefreshCw,
  CheckCircle,
  Layers,
  Zap,
  ArrowRight,
  Shield,
  Trash2,
} from "lucide-react";

interface ExtractorTabProps {
  onSaveSystem: (newSystem: RpgSystemRules) => void;
  onSelectTab: (tab: any) => void;
}

export function ExtractorTab({ onSaveSystem, onSelectTab }: ExtractorTabProps) {
  const [systemName, setSystemName] = useState("");
  const [description, setDescription] = useState("");
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedSystem, setExtractedSystem] = useState<RpgSystemRules | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() && !systemName.trim()) return;

    setIsLoading(true);
    setError(null);
    setExtractedSystem(null);

    try {
      const response = await fetch("/api/parse-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemName: systemName.trim(),
          description: description.trim(),
          rawText: rawText.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Erro na extração de regras." }));
        throw new Error(data.error || `Erro de conexão (${response.status})`);
      }

      const result: RpgSystemRules = await response.json();
      setExtractedSystem(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao processar o manual com a IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndActivate = () => {
    if (!extractedSystem) return;
    onSaveSystem(extractedSystem);
    onSelectTab("rules");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
            Extrator de Regras Inteligente com IA
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Cole trechos de livros de regras, anotações de sistemas caseiros ou regras autorais. O modelo
          Gemini estrutura automaticamente os Atributos, Classes, Fórmulas de PV, Magias, Habilidades e
          Regras de Combate em um sistema interativo pronto para jogar.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-[#111116] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <form onSubmit={handleExtract} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Nome do Sistema (Opcional se estiver no texto)
              </label>
              <input
                type="text"
                placeholder="Ex: Cyberpunk 2020, Vampiro A Máscara, Meu RPG Autoral..."
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                Gênero / Tom Breve
              </label>
              <input
                type="text"
                placeholder="Ex: Fantasia Sombria, Ficção Científica Tática, Terror Investigativo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
              Texto Bruto das Regras / Anotações do Manual *
            </label>
            <textarea
              rows={8}
              required
              placeholder="Cole aqui os capítulos do livro, tabela de atributos, classes, talentos ou regras de combate...
Exemplo:
'O sistema usa rolagem de 2d6 + Atributo para resolver testes.
Atributos são Força, Agilidade, Astúcia e Espírito.
Classes: Guerreiro tem 20 PV, Mago usa Mana e tem 10 PV.
Habilidade Fúria: Causa +2 de dano corpo a corpo por 1 turno.'"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading || (!rawText.trim() && !systemName.trim())}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando e Estruturando Regras com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Analisar e Criar Sistema com Gemini</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Extracted System Review Card */}
      {extractedSystem && (
        <div className="bg-[#111116] border border-indigo-500/50 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                <span>SISTEMA ESTRUTURADO COM SUCESSO</span>
                <span aria-hidden="true">·</span>
                <span>v{extractedSystem.version}</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-white mt-1">
                {extractedSystem.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1">{extractedSystem.description}</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setExtractedSystem(null)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveAndActivate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Salvar & Usar na Mesa</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase text-slate-500 block">Atributos</span>
              <span className="text-base font-bold text-cyan-400">
                {extractedSystem.attributes.length}
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase text-slate-500 block">Classes</span>
              <span className="text-base font-bold text-emerald-400">
                {extractedSystem.classes.length}
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase text-slate-500 block">Habilidades</span>
              <span className="text-base font-bold text-amber-400">
                {extractedSystem.abilities.length}
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850">
              <span className="text-[10px] uppercase text-slate-500 block">Magias/Poderes</span>
              <span className="text-base font-bold text-purple-400">
                {extractedSystem.spells.length}
              </span>
            </div>
          </div>

          {/* Core Mechanic Preview */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
              Mecânica Core de Testes Detectada:
            </span>
            <p className="text-slate-200">{extractedSystem.identity.coreMechanic}</p>
          </div>
        </div>
      )}
    </div>
  );
}
