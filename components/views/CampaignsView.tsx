'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import {
  Campaign,
  CampaignMember,
  GameSystem,
  CampaignSystem,
  Rule,
  Profile,
} from '@/types/database';
import {
  Users,
  Plus,
  Shield,
  UserPlus,
  BookOpen,
  Link,
  Trash2,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Crown,
  User,
  Share2,
} from 'lucide-react';

export function CampaignsView({ onSelectSystem }: { onSelectSystem?: (system: GameSystem) => void }) {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [creating, setCreating] = useState(false);

  // Campaign Details State
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [linkedSystems, setLinkedSystems] = useState<GameSystem[]>([]);
  const [availableSystems, setAvailableSystems] = useState<GameSystem[]>([]);
  const [campaignRules, setCampaignRules] = useState<Rule[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Invite Member State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'jogador' | 'mestre'>('jogador');
  const [inviting, setInviting] = useState(false);

  // Link System State
  const [selectedSystemToLink, setSelectedSystemToLink] = useState('');
  const [linking, setLinking] = useState(false);

  // 1. Fetch campaigns user belongs to
  const fetchCampaigns = async () => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Find campaign IDs from campaign_members
      const { data: memberRows, error: mErr } = await supabase
        .from('campaign_members')
        .select('campaign_id, role')
        .eq('user_id', user.id);

      if (mErr) throw mErr;

      const membersList = (memberRows as Array<{ campaign_id: string; role?: any }> | null) || [];
      const campaignIds = membersList.map((m) => m.campaign_id);

      // Also check owned campaigns
      const { data: ownedRows, error: oErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('owner_id', user.id);

      if (oErr) throw oErr;

      const allIds = Array.from(new Set([...campaignIds, ...(ownedRows?.map((c) => c.id) || [])]));

      if (allIds.length === 0) {
        setCampaigns([]);
        setSelectedCampaignId('');
        setLoading(false);
        return;
      }

      const { data: campaignRows, error: cErr } = await supabase
        .from('campaigns')
        .select('*')
        .in('id', allIds)
        .order('name');

      if (cErr) throw cErr;

      const list = (campaignRows as Campaign[]) || [];
      setCampaigns(list);

      if (!selectedCampaignId && list.length > 0) {
        setSelectedCampaignId(list[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar campanhas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  // 2. Fetch selected campaign details (members, linked systems, campaign rules)
  const fetchCampaignDetails = async (campId: string) => {
    if (!campId) return;
    setLoadingDetails(true);
    try {
      // Fetch members
      const { data: memData } = await supabase
        .from('campaign_members')
        .select('campaign_id, user_id, role')
        .eq('campaign_id', campId);

      setMembers((memData as CampaignMember[]) || []);

      // Fetch linked systems
      const { data: linkedRows } = await supabase
        .from('campaign_systems')
        .select('system_id')
        .eq('campaign_id', campId);

      const linkedList = (linkedRows as Array<{ system_id: string }> | null) || [];
      const sysIds = linkedList.map((r) => r.system_id);

      // Fetch systems details
      if (sysIds.length > 0) {
        const { data: sysData } = await supabase
          .from('game_systems')
          .select('*')
          .in('id', sysIds);
        setLinkedSystems((sysData as GameSystem[]) || []);
      } else {
        setLinkedSystems([]);
      }

      // Fetch all systems user can see to allow linking
      const { data: allSys } = await supabase
        .from('game_systems')
        .select('*')
        .order('name');
      setAvailableSystems((allSys as GameSystem[]) || []);

      // Fetch campaign shared rules
      const { data: rulesData } = await supabase
        .from('rules')
        .select('*')
        .eq('campaign_id', campId)
        .order('title');

      setCampaignRules((rulesData as Rule[]) || []);
    } catch (err: any) {
      console.error('Error fetching campaign details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignDetails(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  // 3. Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newCampaignName.trim()) {
      setError('Informe um nome para a campanha.');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // Insert campaign
      const { data: newCamp, error: campErr } = await supabase
        .from('campaigns')
        .insert({
          name: newCampaignName.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (campErr) throw campErr;

      // Automatically add owner as 'mestre'
      const { error: memErr } = await supabase.from('campaign_members').insert({
        campaign_id: newCamp.id,
        user_id: user.id,
        role: 'mestre',
      });

      if (memErr) {
        // Continue even if database trigger already inserted the member
        console.warn('Membership notice:', memErr.message);
      }

      setSuccess(`Campanha "${newCampaignName}" criada com sucesso!`);
      setNewCampaignName('');
      setShowCreateModal(false);
      await fetchCampaigns();
      setSelectedCampaignId(newCamp.id);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar campanha.');
    } finally {
      setCreating(false);
    }
  };

  // 4. Invite Member by email / user ID
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return;
    if (!inviteEmail.trim()) {
      setError('Informe o e-mail ou identificador do usuário.');
      return;
    }

    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      // Look up profile by email (if profiles has email or display_name) or search by ID
      let targetUserId = inviteEmail.trim();

      // Check if input looks like UUID or email
      if (inviteEmail.includes('@')) {
        // Search profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name');

        const found = profiles?.find(
          (p: any) =>
            p.email?.toLowerCase() === inviteEmail.toLowerCase() ||
            p.display_name?.toLowerCase() === inviteEmail.toLowerCase()
        );

        if (found) {
          targetUserId = found.id;
        }
      }

      const { error: insErr } = await supabase.from('campaign_members').insert({
        campaign_id: selectedCampaignId,
        user_id: targetUserId,
        role: inviteRole,
      });

      if (insErr) throw insErr;

      setSuccess(`Membro adicionado com a função de ${inviteRole}!`);
      setInviteEmail('');
      await fetchCampaignDetails(selectedCampaignId);
    } catch (err: any) {
      setError(
        err.message?.includes('violates foreign key')
          ? 'Usuário não encontrado. O usuário precisa estar cadastrado previamente na plataforma.'
          : err.message || 'Erro ao convidar membro.'
      );
    } finally {
      setInviting(false);
    }
  };

  // 5. Link System to Campaign
  const handleLinkSystem = async () => {
    if (!selectedCampaignId || !selectedSystemToLink) return;

    setLinking(true);
    setError(null);
    try {
      const { error: linkErr } = await supabase.from('campaign_systems').insert({
        campaign_id: selectedCampaignId,
        system_id: selectedSystemToLink,
      });

      if (linkErr) throw linkErr;

      setSuccess('Sistema vinculado com sucesso à campanha!');
      setSelectedSystemToLink('');
      await fetchCampaignDetails(selectedCampaignId);
    } catch (err: any) {
      setError(err.message || 'Erro ao vincular sistema.');
    } finally {
      setLinking(false);
    }
  };

  // 6. Unlink System from Campaign
  const handleUnlinkSystem = async (systemId: string) => {
    if (!selectedCampaignId) return;
    try {
      const { error: unErr } = await supabase
        .from('campaign_systems')
        .delete()
        .eq('campaign_id', selectedCampaignId)
        .eq('system_id', systemId);

      if (unErr) throw unErr;

      setSuccess('Sistema desvinculado da campanha.');
      await fetchCampaignDetails(selectedCampaignId);
    } catch (err: any) {
      setError(err.message || 'Erro ao desvincular sistema.');
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const isMaster =
    user &&
    (selectedCampaign?.owner_id === user.id ||
      members.some((m) => m.user_id === user.id && m.role === 'mestre'));

  if (!user) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center max-w-lg mx-auto">
        <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Acesso a Campanhas</h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Para criar mesas, convidar jogadores e compartilhar regras restritas de livros comerciais com sua mesa, é necessário entrar na sua conta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Gestão de Campanhas & Mesas de RPG</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mestres e jogadores: vincule sistemas à mesa e acerte regras compartilhadas de forma segura.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Campanha</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Carregando campanhas...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && campaigns.length === 0 && (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">
            Você ainda não participa de nenhuma campanha
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Crie sua primeira campanha para gerenciar os membros da sua mesa e vincular os sistemas de regras utilizados.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Minha Primeira Campanha</span>
          </button>
        </div>
      )}

      {/* Campaign Details View */}
      {!loading && campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Campaigns List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Suas Mesas ({campaigns.length})
              </span>
            </div>

            <div className="space-y-2">
              {campaigns.map((camp) => {
                const isSelected = camp.id === selectedCampaignId;
                const isOwner = camp.owner_id === user.id;

                return (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                        : 'bg-[#0f1118] border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{camp.name}</span>
                        {isOwner && (
                          <span title="Você é o Mestre/Dono">
                            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {isOwner ? 'Mestre (Proprietário)' : 'Membro da mesa'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Campaign Workspace */}
          {selectedCampaign && (
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Header */}
              <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                    <span>{selectedCampaign.name}</span>
                    {isMaster && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Você é Mestre
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  ID da Campanha: <code className="font-mono text-slate-500">{selectedCampaign.id}</code>
                </p>
              </div>

              {/* Members Section */}
              <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Membros da Campanha ({members.length})</span>
                  </h4>
                </div>

                {/* Invite Form (only for masters) */}
                {isMaster && (
                  <form
                    onSubmit={handleInviteMember}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="E-mail ou UUID do jogador cadastrado..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />

                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="jogador">Jogador</option>
                      <option value="mestre">Mestre</option>
                    </select>

                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{inviting ? 'Adicionando...' : 'Adicionar'}</span>
                    </button>
                  </form>
                )}

                {/* Members list */}
                <div className="space-y-2">
                  {members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-850 flex items-center justify-center text-slate-300 font-bold text-xs">
                          {m.user_id.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-slate-300 truncate block">
                            {m.user_id === user.id ? 'Você' : m.user_id}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          m.role === 'mestre'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Systems Section */}
              <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Sistemas Vinculados à Mesa ({linkedSystems.length})</span>
                  </h4>
                </div>

                {/* Link System Selector */}
                {isMaster && (
                  <div className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <select
                      value={selectedSystemToLink}
                      onChange={(e) => setSelectedSystemToLink(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">Selecione um sistema para vincular...</option>
                      {availableSystems
                        .filter((sys) => !linkedSystems.some((l) => l.id === sys.id))
                        .map((sys) => (
                          <option key={sys.id} value={sys.id}>
                            {sys.name} ({sys.slug})
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={handleLinkSystem}
                      disabled={linking || !selectedSystemToLink}
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>{linking ? 'Vinculando...' : 'Vincular Sistema'}</span>
                    </button>
                  </div>
                )}

                {/* Linked Systems list */}
                {linkedSystems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Nenhum sistema vinculado a esta campanha ainda.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {linkedSystems.map((sys) => (
                      <div
                        key={sys.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">
                            {sys.name}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {sys.license || 'Licença livre'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onSelectSystem && (
                            <button
                              onClick={() => onSelectSystem(sys)}
                              className="p-1.5 text-xs text-slate-400 hover:text-white"
                              title="Ver regras deste sistema"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isMaster && (
                            <button
                              onClick={() => handleUnlinkSystem(sys.id)}
                              className="p-1.5 text-xs text-slate-400 hover:text-rose-400"
                              title="Desvincular da campanha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared Campaign Rules */}
              <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <span>Regras Exclusivas Desta Campanha ({campaignRules.length})</span>
                </h4>

                {campaignRules.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Nenhuma regra cadastrada com visibilidade restrita a esta campanha. Cadastre novas regras selecionando visibilidade &quot;Campanha&quot;.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {campaignRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{rule.title}</span>
                          {rule.source_book && (
                            <span className="text-[10px] font-mono text-indigo-300">
                              {rule.source_book} {rule.source_page ? `p. ${rule.source_page}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">{rule.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-1 font-serif">Criar Nova Campanha</h3>
            <p className="text-xs text-slate-400 mb-5">
              Você será automaticamente definido como Mestre da mesa com permissões totais de gerenciamento.
            </p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Campanha / Mesa
                </label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Ex: A Maldição de Strahd ou Crônicas de Arton"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Criar Campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
