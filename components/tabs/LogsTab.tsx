"use client";

import React, { useState } from "react";
import { Campaign, SessionLog, NpcEntry } from "@/types/rpg";
import { Plus, Clock, Users, ScrollText, Trash2, Calendar, Sparkles } from "lucide-react";

interface LogsTabProps {
  activeCampaign: Campaign | null;
  onAddSessionLog: (log: SessionLog) => void;
  onDeleteSessionLog: (logId: string) => void;
  onAddNpc: (npc: NpcEntry) => void;
  onDeleteNpc: (npcId: string) => void;
}

export function LogsTab({
  activeCampaign,
  onAddSessionLog,
  onDeleteSessionLog,
  onAddNpc,
  onDeleteNpc,
}: LogsTabProps) {
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddNpc, setShowAddNpc] = useState(false);

  // New Log Form
  const [logTitle, setLogTitle] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logSummary, setLogSummary] = useState("");
  const [logNpcs, setLogNpcs] = useState("");
  const [logEvents, setLogEvents] = useState("");

  // New NPC Form
  const [npcName, setNpcName] = useState("");
  const [npcRole, setNpcRole] = useState("");
  const [npcDescription, setNpcDescription] = useState("");

  if (!activeCampaign) return null;

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim() || !logSummary.trim()) return;

    const newLog: SessionLog = {
      id: `log_${Date.now()}`,
      title: logTitle.trim(),
      date: logDate,
      summary: logSummary.trim(),
      npcsMet: logNpcs
        ? logNpcs.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      keyEvents: logEvents
        ? logEvents.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    onAddSessionLog(newLog);
    setShowAddLog(false);
    setLogTitle("");
    setLogSummary("");
    setLogNpcs("");
    setLogEvents("");
  };

  const handleCreateNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcName.trim()) return;

    const newNpc: NpcEntry = {
      id: `npc_${Date.now()}`,
      name: npcName.trim(),
      role: npcRole.trim() || "Aliado / Conhecido",
      description: npcDescription.trim(),
    };

    onAddNpc(newNpc);
    setShowAddNpc(false);
    setNpcName("");
    setNpcRole("");
    setNpcDescription("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
              Diário de Sessões & Crônicas
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Histórico das aventuras jogadas. O Odysseus IA consulta este diário para lembrar de NPCs e reviravoltas passadas!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddNpc(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Novo NPC</span>
          </button>

          <button
            onClick={() => setShowAddLog(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Sessão</span>
          </button>
        </div>
      </div>

      {/* Modal Add Session Log */}
      {showAddLog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-sm font-bold text-white font-serif">
                Registrar Nova Sessão
              </h3>
              <button
                onClick={() => setShowAddLog(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">Título da Sessão *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sessão 4: A Queda da Ponte"
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-300 block mb-1">Data da Sessão</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">Resumo Narrativo *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Resuma as decisões cruciais dos jogadores, combates enfrentados e descobertas da sessão..."
                  value={logSummary}
                  onChange={(e) => setLogSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">
                  NPCs Encontrados (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grumph, Guardião de Bronze, Ancião Einar"
                  value={logNpcs}
                  onChange={(e) => setLogNpcs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">
                  Eventos Marcantes & Itens Obtidos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Espada de Fogo encontrada, Resgate do ferreiro"
                  value={logEvents}
                  onChange={(e) => setLogEvents(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddLog(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add NPC */}
      {showAddNpc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-sm font-bold text-white font-serif">
                Cadastrar Personagem Não-Jogador (NPC)
              </h3>
              <button
                onClick={() => setShowAddNpc(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateNpc} className="space-y-3.5 text-xs">
              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">Nome do NPC *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lorde Cassian, Sacerdote Maléfico..."
                  value={npcName}
                  onChange={(e) => setNpcName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">Papel / Ocupação</label>
                <input
                  type="text"
                  placeholder="Ex: Mercador de Poções, Aliado, Vilão Oculto..."
                  value={npcRole}
                  onChange={(e) => setNpcRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-300 block mb-1">Descrição & Segredos</label>
                <textarea
                  rows={3}
                  placeholder="Aparência, lealdades, motivações ou segredos ocultos..."
                  value={npcDescription}
                  onChange={(e) => setNpcDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddNpc(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Cadastrar NPC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Lists Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Session Logs List (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Registros de Aventuras ({activeCampaign.sessionLogs.length})
            </h3>
          </div>

          {activeCampaign.sessionLogs.length === 0 ? (
            <div className="p-8 text-center bg-[#111116] border border-slate-800 rounded-2xl text-slate-500 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-40" />
              <p>Nenhuma sessão registrada nesta campanha ainda.</p>
              <button
                onClick={() => setShowAddLog(true)}
                className="text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Clique aqui para registrar a primeira sessão
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCampaign.sessionLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#111116] border border-slate-800 rounded-2xl p-5 space-y-3.5 hover:border-slate-750 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">{log.title}</h4>
                      <span className="text-[10px] font-mono text-indigo-400">{log.date}</span>
                    </div>

                    <button
                      onClick={() => onDeleteSessionLog(log.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {log.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-850/80 text-xs">
                    {log.npcsMet && log.npcsMet.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                          NPCs Encontrados:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {log.npcsMet.map((npc, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md font-mono"
                            >
                              {npc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.keyEvents && log.keyEvents.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                          Eventos Importantes:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {log.keyEvents.map((evt, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 px-2 py-0.5 rounded-md font-mono"
                            >
                              {evt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NPCs Side Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              NPCs da Campanha ({activeCampaign.npcList.length})
            </h3>
            <button
              onClick={() => setShowAddNpc(true)}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Novo</span>
            </button>
          </div>

          {activeCampaign.npcList.length === 0 ? (
            <div className="p-6 text-center bg-[#111116] border border-slate-800 rounded-2xl text-slate-500 text-xs">
              Nenhum NPC cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {activeCampaign.npcList.map((npc) => (
                <div
                  key={npc.id}
                  className="p-3.5 bg-[#111116] border border-slate-800 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{npc.name}</span>
                    <button
                      onClick={() => onDeleteNpc(npc.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded inline-block">
                    {npc.role}
                  </span>
                  {npc.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">{npc.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
