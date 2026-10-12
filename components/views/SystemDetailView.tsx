'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import { GameSystem, SystemVersion, RuleCategory, Rule } from '@/types/database';
import {
  ArrowLeft,
  BookOpen,
  GitCompare,
  Plus,
  Search,
  Calendar,
  FileText,
  Lock,
  Globe,
  Users,
  Bookmark,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SystemDetailViewProps {
  system: GameSystem;
  onBack: () => void;
  onCompare: (systemId: string, versionId?: string) => void;
  onGoToCreateRule: (systemId: string, versionId: string) => void;
}

export function SystemDetailView({
  system,
  onBack,
  onCompare,
  onGoToCreateRule,
}: SystemDetailViewProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<SystemVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruleSearch, setRuleSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // 1. Fetch versions for the system
  useEffect(() => {
    async function fetchVersions() {
      setLoadingVersions(true);
      setError(null);
      try {
        const { data, error: vErr } = await supabase
          .from('system_versions')
          .select('*')
          .eq('system_id', system.id)
          .order('released_at', { ascending: false });

        if (vErr) throw new Error(vErr.message);

        const list = (data as SystemVersion[]) || [];
        setVersions(list);
        if (list.length > 0) {
          setSelectedVersionId(list[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar versões do sistema.');
      } finally {
        setLoadingVersions(false);
      }
    }

    fetchVersions();
  }, [system.id]);

  // 2. Fetch categories and rules for selected version
  useEffect(() => {
    if (!selectedVersionId) {
      setCategories([]);
      setRules([]);
      return;
    }

    async function fetchContent() {
      setLoadingRules(true);
      setError(null);
      try {
        const [catsRes, rulesRes] = await Promise.all([
          supabase
            .from('rule_categories')
            .select('*')
            .eq('version_id', selectedVersionId)
            .order('position'),
          supabase
            .from('rules')
            .select('*')
            .eq('version_id', selectedVersionId)
            .order('title'),
        ]);

        if (catsRes.error) throw new Error(catsRes.error.message);
        if (rulesRes.error) throw new Error(rulesRes.error.message);

        setCategories((catsRes.data as RuleCategory[]) || []);
        setRules((rulesRes.data as Rule[]) || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar regras da versão selecionada.');
      } finally {
        setLoadingRules(false);
      }
    }

    fetchContent();
  }, [selectedVersionId]);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  // Filter rules by search
  const filteredRules = rules.filter((r) => {
    const q = ruleSearch.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      r.stable_key.toLowerCase().includes(q) ||
      (r.source_book && r.source_book.toLowerCase().includes(q))
    );
  });

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const isOwner = user && system.owner_id === user.id;

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a lista de sistemas</span>
        </button>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {system.slug}
                </span>

                {system.is_public ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Globe className="w-3 h-3" />
                    <span>Público / Licença Aberta</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Lock className="w-3 h-3" />
                    <span>Privado (Pessoal / Campanha)</span>
                  </span>
                )}

                {system.license && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
                    Licença: {system.license}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight font-serif">
                {system.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {system.description || 'Nenhuma descrição detalhada disponível.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <button
                onClick={() => onCompare(system.id, selectedVersionId)}
                disabled={versions.length < 2}
                className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold border border-cyan-900/50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={versions.length < 2 ? 'Necessário ter pelo menos 2 versões para comparar' : 'Comparar versões'}
              >
                <GitCompare className="w-4 h-4" />
                <span>Comparar Edições</span>
              </button>

              {user && selectedVersionId && (
                <button
                  onClick={() => onGoToCreateRule(system.id, selectedVersionId)}
                  className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Regra</span>
                </button>
              )}
            </div>
          </div>

          {/* Versions Selector Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Edição / Versão:
                </span>
                {versions.length === 0 && !loadingVersions && (
                  <span className="text-xs text-amber-400 italic">
                    Nenhuma versão cadastrada para este sistema.
                  </span>
                )}
              </div>

              {selectedVersion?.released_at && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lançamento: {new Date(selectedVersion.released_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            {/* Version Pills */}
            {versions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {versions.map((ver) => {
                  const isSelected = ver.id === selectedVersionId;
                  return (
                    <button
                      key={ver.id}
                      onClick={() => setSelectedVersionId(ver.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold ring-1 ring-indigo-400'
                          : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>{ver.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedVersion?.notes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300 font-mono">Notas da versão: </span>
                {selectedVersion.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules and Categories Section */}
      {selectedVersion && (
        <div className="space-y-4">
          {/* Rules Search Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Pesquisar regras por título, chave, livro ou termo de efeito..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono self-center">
              Total: <span className="text-white font-bold">{filteredRules.length}</span> regras
            </div>
          </div>

          {/* Loading rules */}
          {loadingRules && (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Carregando categorias e regras da versão...</p>
            </div>
          )}

          {/* Error rules */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Content: List categories with their rules */}
          {!loadingRules && !error && (
            <div className="space-y-4">
              {categories.length === 0 && rules.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white mb-1">
                    Esta versão ainda não possui categorias ou regras cadastradas
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                    Cadastre categorias personalizadas e adicione as regras citando o livro e página de origem.
                  </p>
                  {user && (
                    <button
                      onClick={() => onGoToCreateRule(system.id, selectedVersion.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Primeira Regra</span>
                    </button>
                  )}
                </div>
              ) : (
                categories.map((cat) => {
                  const catRules = filteredRules.filter((r) => r.category_id === cat.id);
                  const isCollapsed = collapsedCategories[cat.id];

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#0f1017] border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Category Header Bar */}
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full px-5 py-3.5 bg-slate-900/90 hover:bg-slate-850 flex items-center justify-between border-b border-slate-800/80 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-400" />
                          )}
                          <span className="text-sm font-bold text-white font-serif tracking-wide">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                            {catRules.length} {catRules.length === 1 ? 'regra' : 'regras'}
                          </span>
                        </div>
                      </button>

                      {/* Rules in Category */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-3">
                          {catRules.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2 px-1">
                              Nenhuma regra nesta categoria corresponde ao filtro de busca.
                            </p>
                          ) : (
                            catRules.map((rule) => (
                              <div
                                key={rule.id}
                                className="bg-[#141620] hover:bg-[#171a27] border border-slate-800/90 rounded-xl p-4 transition-colors space-y-2.5"
                              >
                                {/* Rule Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-bold text-white">
                                      {rule.title}
                                    </h5>
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                      key: {rule.stable_key}
                                    </span>
                                  </div>

                                  {/* Rule Metadata: Book & Page, Visibility */}
                                  <div className="flex items-center gap-2">
                                    {rule.source_book && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-900/60">
                                        <Bookmark className="w-3 h-3 text-indigo-400" />
                                        <span>
                                          {rule.source_book}
                                          {rule.source_page ? `, pág. ${rule.source_page}` : ''}
                                        </span>
                                      </span>
                                    )}

                                    {rule.visibility === 'public' && (
                                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        Pública
                                      </span>
                                    )}
                                    {rule.visibility === 'campaign' && (
                                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                        Campanha
                                      </span>
                                    )}
                                    {rule.visibility === 'personal' && (
                                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        Pessoal
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Rule Body / Description */}
                                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                                  {rule.body}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Rules without specific category (if any) */}
              {rules.some((r) => !categories.some((c) => c.id === r.category_id)) && (
                <div className="bg-[#0f1017] border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
                    Outras Regras
                  </h4>
                  <div className="space-y-3">
                    {rules
                      .filter((r) => !categories.some((c) => c.id === r.category_id))
                      .map((rule) => (
                        <div
                          key={rule.id}
                          className="bg-[#141620] border border-slate-800 rounded-xl p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{rule.title}</span>
                            {rule.source_book && (
                              <span className="text-[11px] text-indigo-300">
                                {rule.source_book}
                                {rule.source_page ? ` pág. ${rule.source_page}` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-line">{rule.body}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
