'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GameSystem, SystemVersion, VersionComparisonResult, Rule } from '@/types/database';
import { computeTextDiff, compareRulesLocally } from '@/lib/diffHelper';
import {
  GitCompare,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  HelpCircle,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface CompareVersionsViewProps {
  initialSystemId?: string;
  initialVersionAId?: string;
  initialVersionBId?: string;
}

export function CompareVersionsView({
  initialSystemId,
  initialVersionAId,
  initialVersionBId,
}: CompareVersionsViewProps) {
  const [systems, setSystems] = useState<GameSystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string>(initialSystemId || '');
  const [versions, setVersions] = useState<SystemVersion[]>([]);
  const [versionAId, setVersionAId] = useState<string>(initialVersionAId || '');
  const [versionBId, setVersionBId] = useState<string>(initialVersionBId || '');

  const [loadingSystems, setLoadingSystems] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [hideEqual, setHideEqual] = useState(true);
  const [comparisonResults, setComparisonResults] = useState<VersionComparisonResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Load systems
  useEffect(() => {
    async function fetchSystems() {
      setLoadingSystems(true);
      try {
        const { data, error: sErr } = await supabase
          .from('game_systems')
          .select('*')
          .order('name');

        if (sErr) throw sErr;
        const list = (data as GameSystem[]) || [];
        setSystems(list);

        if (!selectedSystemId && list.length > 0) {
          setSelectedSystemId(list[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar lista de sistemas.');
      } finally {
        setLoadingSystems(false);
      }
    }

    fetchSystems();
  }, []);

  // 2. Load versions when system changes
  useEffect(() => {
    if (!selectedSystemId) {
      setVersions([]);
      setVersionAId('');
      setVersionBId('');
      setComparisonResults(null);
      return;
    }

    async function fetchVersions() {
      setLoadingVersions(true);
      setComparisonResults(null);
      try {
        const { data, error: vErr } = await supabase
          .from('system_versions')
          .select('*')
          .eq('system_id', selectedSystemId)
          .order('released_at', { ascending: true });

        if (vErr) throw vErr;
        const list = (data as SystemVersion[]) || [];
        setVersions(list);

        if (list.length >= 2) {
          // Default to first (base) and second (newer)
          setVersionAId(list[0].id);
          setVersionBId(list[list.length - 1].id);
        } else if (list.length === 1) {
          setVersionAId(list[0].id);
          setVersionBId('');
        } else {
          setVersionAId('');
          setVersionBId('');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar versões do sistema.');
      } finally {
        setLoadingVersions(false);
      }
    }

    fetchVersions();
  }, [selectedSystemId]);

  // 3. Compare Function
  const handleCompare = async () => {
    if (!versionAId || !versionBId) {
      setError('Selecione duas versões para comparar.');
      return;
    }
    if (versionAId === versionBId) {
      setError('Escolha duas versões diferentes para identificar as mudanças.');
      return;
    }

    setComparing(true);
    setError(null);
    setComparisonResults(null);

    try {
      // First attempt: call RPC compare_versions
      let rpcSucceeded = false;
      const { data: rpcData, error: rpcErr } = await supabase.rpc('compare_versions', {
        version_a: versionAId,
        version_b: versionBId,
      });

      if (!rpcErr && Array.isArray(rpcData)) {
        setComparisonResults(rpcData as VersionComparisonResult[]);
        rpcSucceeded = true;
      }

      // If RPC failed or didn't return data, use fallback local comparison
      if (!rpcSucceeded) {
        const [resA, resB] = await Promise.all([
          supabase.from('rules').select('*').eq('version_id', versionAId),
          supabase.from('rules').select('*').eq('version_id', versionBId),
        ]);

        if (resA.error) throw resA.error;
        if (resB.error) throw resB.error;

        const results = compareRulesLocally(
          (resA.data as Rule[]) || [],
          (resB.data as Rule[]) || []
        );
        setComparisonResults(results);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao comparar versões das regras.');
    } finally {
      setComparing(false);
    }
  };

  // Grouping results
  const grouped = {
    alterada: comparisonResults?.filter((r) => r.change === 'alterada') || [],
    adicionada: comparisonResults?.filter((r) => r.change === 'adicionada') || [],
    removida: comparisonResults?.filter((r) => r.change === 'removida') || [],
    igual: comparisonResults?.filter((r) => r.change === 'igual') || [],
  };

  const selectedSystem = systems.find((s) => s.id === selectedSystemId);
  const versionA = versions.find((v) => v.id === versionAId);
  const versionB = versions.find((v) => v.id === versionBId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-serif">
              Comparador de Versões & Edições de Regras
            </h2>
            <p className="text-xs text-slate-400">
              Analise o que foi adicionado, removido ou alterado entre duas versões do mesmo sistema através da chave estável (<code className="text-cyan-300 font-mono">stable_key</code>).
            </p>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          {/* Select System */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              1. Selecionar Sistema
            </label>
            <select
              value={selectedSystemId}
              onChange={(e) => setSelectedSystemId(e.target.value)}
              disabled={loadingSystems}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {systems.length === 0 && <option value="">Nenhum sistema disponível</option>}
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Select Version A (Base) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              2. Versão Base (Origem)
            </label>
            <select
              value={versionAId}
              onChange={(e) => setVersionAId(e.target.value)}
              disabled={loadingVersions || versions.length === 0}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Selecione a versão base...</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} {v.released_at ? `(${new Date(v.released_at).getFullYear()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Select Version B (Target) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              3. Versão Alvo (Nova Edição)
            </label>
            <select
              value={versionBId}
              onChange={(e) => setVersionBId(e.target.value)}
              disabled={loadingVersions || versions.length === 0}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Selecione a versão alvo...</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} {v.released_at ? `(${new Date(v.released_at).getFullYear()})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button & Options */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideEqual}
                onChange={(e) => setHideEqual(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span>Ocultar regras iguais (sem alterações)</span>
            </label>
          </div>

          <button
            onClick={handleCompare}
            disabled={comparing || !versionAId || !versionBId || versionAId === versionBId}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {comparing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Comparando regras...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Executar Comparação</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResults && (
        <div className="space-y-6">
          {/* Summary KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 block">
                  Alteradas
                </span>
                <span className="text-xl font-bold font-mono">{grouped.alterada.length}</span>
              </div>
              <AlertTriangle className="w-6 h-6 opacity-60" />
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 block">
                  Adicionadas
                </span>
                <span className="text-xl font-bold font-mono">{grouped.adicionada.length}</span>
              </div>
              <PlusCircle className="w-6 h-6 opacity-60" />
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 block">
                  Removidas
                </span>
                <span className="text-xl font-bold font-mono">{grouped.removida.length}</span>
              </div>
              <MinusCircle className="w-6 h-6 opacity-60" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 block">
                  Iguais
                </span>
                <span className="text-xl font-bold font-mono">{grouped.igual.length}</span>
              </div>
              <CheckCircle2 className="w-6 h-6 opacity-60" />
            </div>
          </div>

          {/* Section: Alteradas (With Text Diff Highlighting) */}
          {grouped.alterada.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Regras Alteradas ({grouped.alterada.length})</span>
                <span className="text-[10px] text-slate-500 font-normal font-mono">
                  (Destaque: vermelho = removido na versão A, verde = inserido na versão B)
                </span>
              </div>

              <div className="space-y-3">
                {grouped.alterada.map((item) => {
                  const diffParts = computeTextDiff(item.body_a, item.body_b);

                  return (
                    <div
                      key={item.stable_key}
                      className="bg-[#10121a] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {item.title_b || item.title_a}
                          </span>
                          {item.title_a !== item.title_b && (
                            <span className="text-xs text-slate-400 italic">
                              (anteriormente: &quot;{item.title_a}&quot;)
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                          stable_key: {item.stable_key}
                        </span>
                      </div>

                      {/* Visual Diff Display */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Diferença textual detalhada:</span>
                          <span className="text-[10px] text-slate-500">
                            {versionA?.label} ➔ {versionB?.label}
                          </span>
                        </div>

                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs leading-relaxed font-sans select-text">
                          {diffParts.map((part, pIdx) => {
                            if (part.added) {
                              return (
                                <span
                                  key={pIdx}
                                  className="bg-emerald-950/70 text-emerald-300 font-medium px-1 py-0.5 rounded mx-0.5 border border-emerald-800/50"
                                >
                                  {part.value}
                                </span>
                              );
                            }
                            if (part.removed) {
                              return (
                                <span
                                  key={pIdx}
                                  className="bg-rose-950/70 text-rose-300 line-through px-1 py-0.5 rounded mx-0.5 border border-rose-800/50 opacity-80"
                                >
                                  {part.value}
                                </span>
                              );
                            }
                            return <span key={pIdx}>{part.value}</span>;
                          })}
                        </div>
                      </div>

                      {/* Side by Side Raw Comparison Toggle / View */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] font-mono text-slate-400 block mb-1">
                            {versionA?.label || 'Versão Base'}:
                          </span>
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">
                            {item.body_a}
                          </p>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                            {versionB?.label || 'Versão Alvo'}:
                          </span>
                          <p className="text-slate-200 text-xs leading-relaxed line-clamp-4">
                            {item.body_b}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Adicionadas */}
          {grouped.adicionada.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <PlusCircle className="w-4 h-4" />
                <span>Regras Adicionadas na Versão Alvo ({grouped.adicionada.length})</span>
              </div>

              <div className="space-y-3">
                {grouped.adicionada.map((item) => (
                  <div
                    key={item.stable_key}
                    className="bg-[#10141a] border border-emerald-500/30 rounded-2xl p-4 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{item.title_b}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                        Nova em {versionB?.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.body_b}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Removidas */}
          {grouped.removida.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <MinusCircle className="w-4 h-4" />
                <span>Regras Removidas / Descontinuadas ({grouped.removida.length})</span>
              </div>

              <div className="space-y-3">
                {grouped.removida.map((item) => (
                  <div
                    key={item.stable_key}
                    className="bg-[#151013] border border-rose-500/30 rounded-2xl p-4 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white line-through opacity-80">
                        {item.title_a}
                      </span>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/30">
                        Existia em {versionA?.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.body_a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Iguais (only when hideEqual is false) */}
          {!hideEqual && grouped.igual.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Regras Inalteradas ({grouped.igual.length})</span>
              </div>

              <div className="space-y-2">
                {grouped.igual.map((item) => (
                  <div
                    key={item.stable_key}
                    className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-300">{item.title_a}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      key: {item.stable_key} · idêntica
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No changes found */}
          {grouped.alterada.length === 0 &&
            grouped.adicionada.length === 0 &&
            grouped.removida.length === 0 && (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  Nenhuma diferença de regras encontrada entre as duas versões!
                </h4>
                <p className="text-xs text-slate-400">
                  Todas as regras cadastradas com as mesmas chaves (<code className="text-cyan-300">stable_key</code>) possuem textos e títulos idênticos nestas versões.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
