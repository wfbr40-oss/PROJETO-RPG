"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Campaign, RpgSystemRules, Character } from "@/types/rpg";
import { Send, X, Sparkles, BookOpen, User, Dices, RefreshCw } from "lucide-react";

interface OdysseusChatProps {
  isOpen: boolean;
  onClose: () => void;
  activeCampaign: Campaign | null;
  activeSystem: RpgSystemRules | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onQuickPrompt: (prompt: string) => void;
}

export function OdysseusChat({
  isOpen,
  onClose,
  activeCampaign,
  activeSystem,
  messages,
  onSendMessage,
  isLoading,
  onQuickPrompt,
}: OdysseusChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await onSendMessage(text);
  };

  const quickPrompts = [
    { label: "Surto de Ação", text: "Guerreiro pode usar Surto de Ação no primeiro turno de combate?" },
    { label: "Dano de Queda", text: "Como funciona a regra de dano de queda neste sistema?" },
    { label: "Ataque Furtivo", text: "Quais os requisitos exatos para aplicar Ataque Furtivo?" },
    { label: "Teste de Morte", text: "O que acontece quando os PVs de um herói chegam a 0?" },
  ];

  return (
    <aside
      className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0c0c11]/98 backdrop-blur-md border-l border-slate-800 shadow-2xl z-40 flex flex-col transition-transform duration-200"
      aria-label="Painel de Chat com Odysseus IA"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111116]/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <div>
            <h3 className="text-xs font-bold text-white font-serif tracking-wide">
              {activeCampaign?.odysseusName || "Odysseus IA"}
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Oráculo de {activeSystem?.name || "Regras de Mesa"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Strip */}
      <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-850 shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5 text-[10px] font-mono">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => onQuickPrompt(qp.text)}
              className="bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-800 rounded-md px-2 py-1 shrink-0 transition-colors cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="font-semibold text-slate-400">
                {msg.sender === "player" ? "Mestre / Jogador" : msg.sender === "assistant" ? (activeCampaign?.odysseusName || "Odysseus IA") : "Sistema"}
              </span>
              <span>{msg.timestamp}</span>
            </div>

            {/* RAG Rule tags if consulted */}
            {msg.retrievedRules && msg.retrievedRules.length > 0 && (
              <div className="bg-indigo-950/20 border-l-2 border-indigo-500/80 px-2 py-1 rounded-r-md text-[10px] font-mono text-indigo-300 space-y-0.5 mb-1">
                <span className="font-bold flex items-center gap-1 text-[9px] uppercase tracking-wider text-indigo-400">
                  <BookOpen className="w-2.5 h-2.5" />
                  Regras Consultadas ({msg.retrievedRules.length}):
                </span>
                {msg.retrievedRules.map((r, i) => (
                  <div key={i} className="truncate text-slate-300" title={r.content}>
                    · {r.topic}
                  </div>
                ))}
              </div>
            )}

            {/* Dice Roll Card if embedded */}
            {msg.diceRoll && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono my-1">
                <div className="flex items-center gap-2">
                  <Dices className="w-4 h-4 text-cyan-400" />
                  <span>
                    {msg.diceRoll.characterName ? `${msg.diceRoll.characterName}: ` : ""}
                    <strong>{msg.diceRoll.formula}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Total:</span>
                  <span
                    className={`font-black text-sm tabular-nums ${
                      msg.diceRoll.isCritical
                        ? "text-yellow-400"
                        : msg.diceRoll.isFumble
                        ? "text-rose-400"
                        : "text-white"
                    }`}
                  >
                    {msg.diceRoll.total}
                  </span>
                </div>
              </div>
            )}

            {/* Message Body */}
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap break-words ${
                msg.sender === "player"
                  ? "bg-indigo-600/10 border-indigo-500/30 text-slate-100 ml-4"
                  : msg.sender === "assistant"
                  ? "bg-[#141419] border-slate-800 text-slate-300 mr-2"
                  : "bg-slate-950 border-slate-850 text-slate-400 italic"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3 bg-[#141419] border border-slate-800 rounded-xl text-slate-400 text-xs italic flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Consultando livro de regras e formulando resposta...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-[#0c0c11] shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Pergunte sobre regras, magias ou combate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
          <span>Respostas Rápidas & Objetivas</span>
          <span>Gemini AI Integrado</span>
        </div>
      </div>
    </aside>
  );
}
