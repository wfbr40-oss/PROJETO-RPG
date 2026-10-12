'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import { GameSystem, SystemVersion } from '@/types/database';
import {
  Search,
  BookOpen,
  GitCompare,
  Plus,
  Shield,
  Lock,
  Globe,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface SystemsViewProps {
  onSelectSystem: (system: GameSystem) => void;
  onCompareSystem: (systemId: string) => void;
  onGoToCreate: () => void;
}

export function SystemsView({ onSelectSystem, onCompareSystem, onGoToCreate }: SystemsViewProps) {
  const { user } = useAuth();
  const [systems, setSystems] = useState<GameSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'mine'>('all');

  const fetchSystems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('game_systems')
        .select('*')
        .order('name');

      if (queryError) {
        throw new Error(queryError.message);
      }

      setSystems((data as GameSystem[]) || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar sistemas do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [user]);

  const filteredSystems = systems.filter((sys) => {
    const matchesSearch =
      sys.name.toLowerCase().includes(search.toLowerCase()) ||
      sys.slug.toLowerCase().includes(search.toLowerCase()) ||
      (sys.description && sys.description.toLowerCase().includes(search.toLowerCase())) ||
      (sys.license && sys.license.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'public') {
      return sys.is_public;
    }
    if (filterType === 'mine') {
      return user && sys.owner_id === user.id;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Biblioteca de Sistemas de RPG</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore sistemas com licença aberta ou acesse os sistemas privados da sua conta e de suas campanhas.
            </p>
          </div>

          {user && (
            <button
              onClick={onGoToCreate}
              className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Sistema</span>
            </button>
          )}
        </div>

        {/* Search bar & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, slug, regras ou licença (ex: D&D, OGL, CC)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({systems.length})
            </button>
            <button
              onClick={() => setFilterType('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterType === 'public'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Públicos
            </button>
            {user && (
              <button
                onClick={() => setFilterType('mine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filterType === 'mine'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Meus Sistemas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSystems}
            className="flex items-center gap-1 text-xs text-rose-300 hover:text-white underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse p-5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-1/2 h-5 bg-slate-800 rounded-md" />
                <div className="w-3/4 h-3 bg-slate-850 rounded" />
                <div className="w-full h-10 bg-slate-850/60 rounded" />
              </div>
              <div className="w-1/3 h-4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSystems.length === 0 && (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Nenhum sistema encontrado
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            {search
              ? `Nenhum resultado corresponde à busca "${search}". Tente outro termo ou limpe os filtros.`
              : 'Ainda não há sistemas disponíveis ou sincronizados. Crie seu primeiro sistema privado ou conecte sua mesa!'}
          </p>
          {user ? (
            <button
              onClick={onGoToCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Sistema Privado</span>
            </button>
          ) : (
            <p className="text-xs text-indigo-400 font-mono">
              Faça login para cadastrar sistemas próprios e associá-los a campanhas.
            </p>
          )}
        </div>
      )}

      {/* Grid of Systems */}
      {!loading && !error && filteredSystems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSystems.map((system) => {
            const isOwner = user && system.owner_id === user.id;

            return (
              <div
                key={system.id}
                className="group relative bg-[#0f1118] hover:bg-[#131622] border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm"
              >
                <div>
                  {/* Card Header badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80">
                      {system.slug}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {system.is_public ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Globe className="w-3 h-3" />
                          <span>Público</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Lock className="w-3 h-3" />
                          <span>Privado {isOwner ? '(Meu)' : ''}</span>
                        </span>
                      )}

                      {system.license && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40">
                          {system.license}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and description */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {system.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {system.description || 'Sem descrição cadastrada para este sistema.'}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectSystem(system)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800 hover:border-indigo-500"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Regras</span>
                  </button>

                  <button
                    onClick={() => onCompareSystem(system.id)}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer border border-slate-800"
                    title="Comparar versões deste sistema"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Comparar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
