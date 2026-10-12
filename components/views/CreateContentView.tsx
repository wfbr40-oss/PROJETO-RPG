'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import {
  GameSystem,
  SystemVersion,
  RuleCategory,
  Campaign,
  RuleVisibility,
} from '@/types/database';
import {
  PlusCircle,
  BookOpen,
  Layers,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface CreateContentViewProps {
  initialSystemId?: string;
  initialVersionId?: string;
  onSuccessCreated?: (systemId: string) => void;
}

export function CreateContentView({
  initialSystemId,
  initialVersionId,
  onSuccessCreated,
}: CreateContentViewProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'system' | 'version' | 'category' | 'rule'>('system');

  // Systems owned by user
  const [userSystems, setUserSystems] = useState<GameSystem[]>([]);
  // Versions of selected system
  const [systemVersions, setSystemVersions] = useState<SystemVersion[]>([]);
  // Categories of selected version
  const [versionCategories, setVersionCategories] = useState<RuleCategory[]>([]);
  // Campaigns user participates in
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Selection states for cascading selectors
  const [selectedSystemId, setSelectedSystemId] = useState<string>(initialSystemId || '');
  const [selectedVersionId, setSelectedVersionId] = useState<string>(initialVersionId || '');

  // Form 1: New System
  const [sysName, setSysName] = useState('');
  const [sysSlug, setSysSlug] = useState('');
  const [sysDesc, setSysDesc] = useState('');
  const [sysLicense, setSysLicense] = useState('Uso Pessoal (Privado)');

  // Form 2: New Version
  const [verLabel, setVerLabel] = useState('');
  const [verReleasedAt, setVerReleasedAt] = useState('');
  const [verNotes, setVerNotes] = useState('');

  // Form 3: New Category
  const [catName, setCatName] = useState('');
  const [catPosition, setCatPosition] = useState(1);

  // Form 4: New Rule
  const [ruleCategoryId, setRuleCategoryId] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleStableKey, setRuleStableKey] = useState('');
  const [ruleBody, setRuleBody] = useState('');
  const [ruleSourceBook, setRuleSourceBook] = useState('');
  const [ruleSourcePage, setRuleSourcePage] = useState('');
  const [ruleVisibility, setRuleVisibility] = useState<RuleVisibility>('personal');
  const [ruleCampaignId, setRuleCampaignId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Fetch user systems and campaigns
  const fetchData = async () => {
    if (!user) return;
    try {
      const [sysRes, campRes] = await Promise.all([
        supabase
          .from('game_systems')
          .select('*')
          .eq('owner_id', user.id)
          .order('name'),
        supabase
          .from('campaigns')
          .select('*')
          .order('name'),
      ]);

      if (sysRes.data) {
        setUserSystems(sysRes.data as GameSystem[]);
        if (!selectedSystemId && sysRes.data.length > 0) {
          setSelectedSystemId(sysRes.data[0].id);
        }
      }

      if (campRes.data) {
        setCampaigns(campRes.data as Campaign[]);
      }
    } catch (err: any) {
      console.error('Error fetching user data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 2. Fetch versions when selectedSystemId changes
  useEffect(() => {
    if (!selectedSystemId) {
      setSystemVersions([]);
      setSelectedVersionId('');
      return;
    }

    async function loadVersions() {
      const { data } = await supabase
        .from('system_versions')
        .select('*')
        .eq('system_id', selectedSystemId)
        .order('released_at', { ascending: false });

      const list = (data as SystemVersion[]) || [];
      setSystemVersions(list);
      if (list.length > 0 && !selectedVersionId) {
        setSelectedVersionId(list[0].id);
      }
    }

    loadVersions();
  }, [selectedSystemId]);

  // 3. Fetch categories when selectedVersionId changes
  useEffect(() => {
    if (!selectedVersionId) {
      setVersionCategories([]);
      setRuleCategoryId('');
      return;
    }

    async function loadCategories() {
      const { data } = await supabase
        .from('rule_categories')
        .select('*')
        .eq('version_id', selectedVersionId)
        .order('position');

      const list = (data as RuleCategory[]) || [];
      setVersionCategories(list);
      if (list.length > 0) {
        setRuleCategoryId(list[0].id);
        setCatPosition(list.length + 1);
      }
    }

    loadCategories();
  }, [selectedVersionId]);

  // Auto-generate stable_key from rule title
  const handleTitleChange = (val: string) => {
    setRuleTitle(val);
    if (!ruleStableKey || ruleStableKey.trim() === '') {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setRuleStableKey(generated);
    }
  };

  // Auto-generate slug from system name
  const handleSystemNameChange = (val: string) => {
    setSysName(val);
    if (!sysSlug || sysSlug.trim() === '') {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSysSlug(generated);
    }
  };

  // Submit Handler: 1. Create System
  const handleSubmitSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: err } = await supabase
        .from('game_systems')
        .insert({
          name: sysName.trim(),
          slug: sysSlug.trim().toLowerCase(),
          description: sysDesc.trim() || null,
          license: sysLicense.trim() || null,
          is_public: false, // Critical requirement: always private!
          owner_id: user.id,
        })
        .select()
        .single();

      if (err) throw err;

      setSuccess(`Sistema "${sysName}" criado com sucesso (como privado)!`);
      setSysName('');
      setSysSlug('');
      setSysDesc('');
      await fetchData();
      setSelectedSystemId(data.id);
      setActiveSubTab('version');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar sistema.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: 2. Create Version
  const handleSubmitVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSystemId) {
      setError('Selecione um sistema.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: err } = await supabase
        .from('system_versions')
        .insert({
          system_id: selectedSystemId,
          label: verLabel.trim(),
          released_at: verReleasedAt ? new Date(verReleasedAt).toISOString() : null,
          notes: verNotes.trim() || null,
        })
        .select()
        .single();

      if (err) throw err;

      setSuccess(`Versão "${verLabel}" adicionada ao sistema!`);
      setVerLabel('');
      setVerReleasedAt('');
      setVerNotes('');
      // Refresh versions
      const { data: vList } = await supabase
        .from('system_versions')
        .select('*')
        .eq('system_id', selectedSystemId)
        .order('released_at', { ascending: false });

      setSystemVersions((vList as SystemVersion[]) || []);
      setSelectedVersionId(data.id);
      setActiveSubTab('category');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar versão.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: 3. Create Category
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVersionId) {
      setError('Selecione uma versão para adicionar a categoria.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: err } = await supabase
        .from('rule_categories')
        .insert({
          version_id: selectedVersionId,
          name: catName.trim(),
          position: Number(catPosition) || 1,
        })
        .select()
        .single();

      if (err) throw err;

      setSuccess(`Categoria "${catName}" cadastrada com sucesso!`);
      setCatName('');
      setCatPosition((prev) => prev + 1);

      // Refresh categories
      const { data: cList } = await supabase
        .from('rule_categories')
        .select('*')
        .eq('version_id', selectedVersionId)
        .order('position');

      const updated = (cList as RuleCategory[]) || [];
      setVersionCategories(updated);
      setRuleCategoryId(data.id);
      setActiveSubTab('rule');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar categoria.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler: 4. Create Rule
  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedVersionId || !ruleCategoryId) {
      setError('Selecione uma versão e uma categoria para a regra.');
      return;
    }
    if (!ruleTitle.trim() || !ruleBody.trim() || !ruleStableKey.trim()) {
      setError('Preencha o título, chave estável e texto da regra.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: err } = await supabase.from('rules').insert({
        version_id: selectedVersionId,
        category_id: ruleCategoryId,
        stable_key: ruleStableKey.trim().toLowerCase(),
        title: ruleTitle.trim(),
        body: ruleBody.trim(),
        source_book: ruleSourceBook.trim() || null,
        source_page: ruleSourcePage.trim() || null,
        visibility: ruleVisibility,
        owner_id: user.id,
        campaign_id: ruleVisibility === 'campaign' && ruleCampaignId ? ruleCampaignId : null,
      });

      if (err) throw err;

      setSuccess(`Regra "${ruleTitle}" cadastrada com sucesso!`);
      setRuleTitle('');
      setRuleStableKey('');
      setRuleBody('');
      // keep source_book and source_page for fast consecutive rule entry
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar regra.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center max-w-lg mx-auto">
        <Shield className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Autenticação Necessária</h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Para criar seus próprios sistemas privados, versões, categorias e regras protegidas por direitos autorais, faça login ou cadastre sua conta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-serif">
              Central de Criação de Conteúdo de RPG
            </h2>
            <p className="text-xs text-slate-400">
              Crie sistemas privados, edições personalizadas, categorias com nomenclaturas exclusivas e regras com referência bibliográfica.
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              setActiveSubTab('system');
              setError(null);
              setSuccess(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'system'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Novo Sistema</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('version');
              setError(null);
              setSuccess(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'version'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Nova Versão / Edição</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('category');
              setError(null);
              setSuccess(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'category'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Categorias da Versão</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('rule');
              setError(null);
              setSuccess(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'rule'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>4. Cadastrar Regra</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SUB-FORM 1: NEW SYSTEM */}
      {activeSubTab === 'system' && (
        <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-serif">1. Cadastrar Novo Sistema de RPG</h3>
              <p className="text-xs text-slate-400">
                Todo sistema criado pelo aplicativo é automaticamente configurado como <strong className="text-amber-400">Privado</strong> (apenas você e suas mesas têm acesso).
              </p>
            </div>
            <Lock className="w-5 h-5 text-amber-400" />
          </div>

          <form onSubmit={handleSubmitSystem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Sistema *
              </label>
              <input
                type="text"
                required
                value={sysName}
                onChange={(e) => handleSystemNameChange(e.target.value)}
                placeholder="Ex: Tormenta 20, Pathfinder 2e ou Meu Sistema Homebrew"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Identificador (Slug) *
                </label>
                <input
                  type="text"
                  required
                  value={sysSlug}
                  onChange={(e) => setSysSlug(e.target.value.toLowerCase())}
                  placeholder="Ex: t20, pathfinder-2e"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Licença / Direitos
                </label>
                <input
                  type="text"
                  value={sysLicense}
                  onChange={(e) => setSysLicense(e.target.value)}
                  placeholder="Ex: Uso Pessoal, OGL 1.0a, CC-BY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição e Proposta do Sistema
              </label>
              <textarea
                rows={3}
                value={sysDesc}
                onChange={(e) => setSysDesc(e.target.value)}
                placeholder="Breve resumo das regras, ambientação e premissa..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Salvando...' : 'Salvar Sistema e Avançar para Versões'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-FORM 2: NEW VERSION */}
      {activeSubTab === 'version' && (
        <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-serif">2. Cadastrar Versão / Edição</h3>
            <p className="text-xs text-slate-400">
              Cada sistema possui edições ou versões de regras (ex: D&D 5e e 2024, ou T20 Jogo do Ano).
            </p>
          </div>

          <form onSubmit={handleSubmitVersion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sistema *
              </label>
              <select
                value={selectedSystemId}
                onChange={(e) => setSelectedSystemId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {userSystems.length === 0 && <option value="">Nenhum sistema criado por você</option>}
                {userSystems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rótulo da Versão (Label) *
                </label>
                <input
                  type="text"
                  required
                  value={verLabel}
                  onChange={(e) => setVerLabel(e.target.value)}
                  placeholder="Ex: 5e (2014), Edição 2024, Jogo do Ano"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data de Lançamento / Publicação
                </label>
                <input
                  type="date"
                  value={verReleasedAt}
                  onChange={(e) => setVerReleasedAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notas da Versão
              </label>
              <textarea
                rows={2}
                value={verNotes}
                onChange={(e) => setVerNotes(e.target.value)}
                placeholder="Principais mudanças ou escopo desta edição..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedSystemId}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Salvando...' : 'Salvar Versão e Avançar para Categorias'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-FORM 3: NEW CATEGORY */}
      {activeSubTab === 'category' && (
        <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-serif">3. Categorias Próprias da Versão</h3>
            <p className="text-xs text-slate-400">
              Cada versão de cada sistema tem suas próprias categorias com nomenclatura livre e personalizada (ex: &quot;Combate&quot;, &quot;Sanidade&quot;, &quot;Manobras&quot;, &quot;Feitiçaria&quot;).
            </p>
          </div>

          <form onSubmit={handleSubmitCategory} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sistema
                </label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => setSelectedSystemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {userSystems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Versão / Edição
                </label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {systemVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Existing Categories Preview */}
            {versionCategories.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  Categorias já cadastradas nesta versão ({versionCategories.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {versionCategories.map((c) => (
                    <span
                      key={c.id}
                      className="text-xs bg-slate-900 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-800"
                    >
                      {c.position}. {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Categoria Personalizada *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ex: Regras de Combate, Magias Arcanas, Perícias..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Posição / Ordem
                </label>
                <input
                  type="number"
                  min={1}
                  value={catPosition}
                  onChange={(e) => setCatPosition(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedVersionId}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Salvando...' : 'Adicionar Categoria e Avançar para Regras'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-FORM 4: NEW RULE */}
      {activeSubTab === 'rule' && (
        <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-serif">4. Cadastrar Regra</h3>
            <p className="text-xs text-slate-400">
              A <strong className="text-cyan-400 font-mono">stable_key</strong> identifica a mesma regra entre versões para o comparador de diferenças. Referencie o livro e a página de origem.
            </p>
          </div>

          <form onSubmit={handleSubmitRule} className="space-y-4">
            {/* Version & Category selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Versão do Sistema *
                </label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {systemVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoria da Regra *
                </label>
                <select
                  value={ruleCategoryId}
                  onChange={(e) => setRuleCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {versionCategories.length === 0 && (
                    <option value="">Nenhuma categoria cadastrada nesta versão</option>
                  )}
                  {versionCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Stable Key */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Regra *
                </label>
                <input
                  type="text"
                  required
                  value={ruleTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Ataque de Oportunidade ou Golpe Baixo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono text-cyan-300">
                  stable_key (identificador entre versões) *
                </label>
                <input
                  type="text"
                  required
                  value={ruleStableKey}
                  onChange={(e) => setRuleStableKey(e.target.value.toLowerCase())}
                  placeholder="Ex: ataque-de-oportunidade"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Book Reference & Page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Livro de Origem
                </label>
                <input
                  type="text"
                  value={ruleSourceBook}
                  onChange={(e) => setRuleSourceBook(e.target.value)}
                  placeholder="Ex: Livro Básico, Guia do Jogador, Manual dos Monstros"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Página de Referência
                </label>
                <input
                  type="text"
                  value={ruleSourcePage}
                  onChange={(e) => setRuleSourcePage(e.target.value)}
                  placeholder="Ex: 195 ou 42-45"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Visibility & Campaign */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Visibilidade da Regra *
                </label>
                <select
                  value={ruleVisibility}
                  onChange={(e) => setRuleVisibility(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="personal">Pessoal (visível apenas para você)</option>
                  <option value="campaign">Campanha (compartilhada dentro da mesa)</option>
                </select>
              </div>

              {ruleVisibility === 'campaign' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Campanha de Destino *
                  </label>
                  <select
                    value={ruleCampaignId}
                    onChange={(e) => setRuleCampaignId(e.target.value)}
                    required={ruleVisibility === 'campaign'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Selecione a campanha...</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Rule Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Texto / Descrição da Regra *
              </label>
              <textarea
                rows={5}
                required
                value={ruleBody}
                onChange={(e) => setRuleBody(e.target.value)}
                placeholder="Insira o texto completo da regra com efeitos, modificadores e resolução mecânica..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !ruleCategoryId}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Salvando...' : 'Cadastrar Regra'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
