"use client";

import React, { useState } from "react";
import { RpgSystemRules, VersionHistoryItem } from "@/types/rpg";
import { X, RefreshCw, Sparkles, CheckCircle } from "lucide-react";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSystem: RpgSystemRules | null;
  onApplyDiff: (updatedSystem: RpgSystemRules, patchNote: VersionHistoryItem) => void;
}

export function DiffModal({
  isOpen,
  onClose,
  activeSystem,
  onApplyDiff,
}: DiffModalProps) {
  const [patchRequirements, setPatchRequirements] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<{
    version: string;
    summaryOfChanges: string;
    mechanicsImpact: string;
    migrationRules: string;
  } | null>(null);

  if (!isOpen || !activeSystem) return null;

  const handleCalculateDiff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patchRequirements.trim()) return;

    setIsLoading(true);
    setError(null);
    setDiffResult(null);

    try {
      const res = await fetch("/api/diff-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldRules: activeSystem,
          newRulesText: patchRequirements.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erro no cálculo de diff." }));
        throw new Error(data.error || `Erro de conexão (${res.status})`);
      }

      const result = await res.json();
      setDiffResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao calcular patch de regras.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!diffResult) return;

    const updatedSystem: RpgSystemRules = {
      ...activeSystem,
      version: diffResult.version || "1.1",
      description: `${activeSystem.description} (Atualizado em ${new Date().toLocaleDateString()})`,
    };

    const newVersionItem: VersionHistoryItem = {
      id: `ver_${Date.now()}`,
      version: diffResult.version || "1.1",
      date: new Date().toISOString().split("T")[0],
      summaryOfChanges: diffResult.summaryOfChanges,
      mechanicsImpact: diffResult.mechanicsImpact,
      migrationRules: diffResult.migrationRules,
    };

    onApplyDiff(updatedSystem, newVersionItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-serif">
                Atualização Semântica de Regras (Diff & Patch)
              </h3>
              <p className="text-[11px] text-slate-400">
                Sistema: <strong className="text-white">{activeSystem.name}</strong> ({activeSystem.version})
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

        {!diffResult ? (
          <form onSubmit={handleCalculateDiff} className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              O mestre pode propor alterações ou novas regras para a mesa. O modelo Gemini analisa o impacto nas
              fichas já criadas e gera automaticamente as notas de migração (Patch Notes).
            </p>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">
                Mudanças Propostas pelo Mestre *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Exemplo:
- Guerreiros agora ganham +4 de PV inicial.
- Toda magia de 1º círculo agora consome 2 PM em vez de 1 PM.
- Adicione uma habilidade chamada 'Escudo Refletor' para Ladinos de Nível 3."
                value={patchRequirements}
                onChange={(e) => setPatchRequirements(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-mono"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !patchRequirements.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculando Diferenças...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Calcular Patch Notes com IA</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Diff Result Review */
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-bold">
                  NOVA VERSÃO GERADA: v{diffResult.version}
                </span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Patch Pronto
                </span>
              </div>
              <p className="text-slate-200 text-xs">{diffResult.summaryOfChanges}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Impacto nas Regras & Dinâmica:
              </span>
              <p className="text-slate-300 leading-relaxed">{diffResult.mechanicsImpact}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                Regras de Migração para os Jogadores:
              </span>
              <p className="text-slate-300 leading-relaxed font-mono">{diffResult.migrationRules}</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setDiffResult(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
              >
                Editar Parâmetros
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aplicar Patch ao Sistema & Campanha</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
