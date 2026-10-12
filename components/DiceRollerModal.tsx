"use client";

import React, { useState } from "react";
import { DiceRollResult, RpgSystemRules } from "@/types/rpg";
import { parseAndRollDice, RpgSoundFX } from "@/lib/rulesEngine";
import { X, Dices, RotateCcw, Sparkles, Send } from "lucide-react";

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSystem?: RpgSystemRules | null;
  onSendRollToChat?: (roll: DiceRollResult) => void;
  recentRolls: DiceRollResult[];
  onAddRoll: (roll: DiceRollResult) => void;
}

export function DiceRollerModal({
  isOpen,
  onClose,
  activeSystem,
  onSendRollToChat,
  recentRolls,
  onAddRoll,
}: DiceRollerModalProps) {
  const [modifier, setModifier] = useState<number>(0);
  const [customFormula, setCustomFormula] = useState("");
  const [lastRoll, setLastRoll] = useState<DiceRollResult | null>(null);

  if (!isOpen) return null;

  const handleRoll = (die: number, count: number = 1) => {
    RpgSoundFX.playDiceRoll();
    const modStr = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : "";
    const formula = `${count}d${die}${modStr}`;
    const result = parseAndRollDice(formula, undefined, `Rolagem livre`, activeSystem);

    if (result.isCritical) {
      setTimeout(() => RpgSoundFX.playCritical(), 300);
    } else if (result.isFumble) {
      setTimeout(() => RpgSoundFX.playFumble(), 300);
    }

    setLastRoll(result);
    onAddRoll(result);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormula.trim()) return;
    RpgSoundFX.playDiceRoll();
    const result = parseAndRollDice(customFormula.trim(), undefined, "Fórmula personalizada", activeSystem);

    if (result.isCritical) {
      setTimeout(() => RpgSoundFX.playCritical(), 300);
    } else if (result.isFumble) {
      setTimeout(() => RpgSoundFX.playFumble(), 300);
    }

    setLastRoll(result);
    onAddRoll(result);
    setCustomFormula("");
  };

  const diceButtons = [
    { label: "d4", sides: 4, iconColor: "text-amber-400" },
    { label: "d6", sides: 6, iconColor: "text-emerald-400" },
    { label: "d8", sides: 8, iconColor: "text-teal-400" },
    { label: "d10", sides: 10, iconColor: "text-cyan-400" },
    { label: "d12", sides: 12, iconColor: "text-indigo-400" },
    { label: "d20", sides: 20, iconColor: "text-purple-400" },
    { label: "d100", sides: 100, iconColor: "text-rose-400" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif">
                Rolador de Dados Poliedrais
              </h3>
              <p className="text-[11px] text-slate-400">
                Rolagem interativa com feedback sonoro sintetizado em tempo real.
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

        {/* Big Result Display */}
        <div className="bg-[#09090b] rounded-xl border border-slate-800/80 p-5 text-center relative overflow-hidden">
          {lastRoll ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <span>Fórmula: <strong className="text-slate-200">{lastRoll.formula}</strong></span>
                <span>·</span>
                <span>Dados: [{lastRoll.rolls.join(", ")}]</span>
                {lastRoll.modifier !== 0 && (
                  <>
                    <span>·</span>
                    <span>Mod: {lastRoll.modifier >= 0 ? `+${lastRoll.modifier}` : lastRoll.modifier}</span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <span
                  className={`text-4xl sm:text-5xl font-mono font-black tabular-nums transition-transform scale-100 ${
                    lastRoll.isCritical
                      ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                      : lastRoll.isFumble
                      ? "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                      : "text-white"
                  }`}
                >
                  {lastRoll.total}
                </span>

                {lastRoll.isCritical && (
                  <span className="text-xs font-bold font-mono text-yellow-300 bg-yellow-950/60 border border-yellow-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    Crítico!
                  </span>
                )}

                {lastRoll.isFumble && (
                  <span className="text-xs font-bold font-mono text-rose-300 bg-rose-950/60 border border-rose-700/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Falha Crítica
                  </span>
                )}
              </div>

              {onSendRollToChat && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSendRollToChat(lastRoll);
                      onClose();
                    }}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Compartilhar resultado no chat com Odysseus</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-slate-500 text-xs">
              <Dices className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
              <span>Selecione um dado abaixo para rolar</span>
            </div>
          )}
        </div>

        {/* Modifier Adjuster */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
          <span className="font-medium text-slate-300 font-mono">
            Modificador Fixo (+/-):
          </span>
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setModifier((m) => m - 1)}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
            >
              -1
            </button>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
              className="w-14 text-center bg-slate-950 border border-slate-750 rounded-md py-1 text-white font-bold tabular-nums"
            />
            <button
              onClick={() => setModifier((m) => m + 1)}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-bold transition-colors cursor-pointer"
            >
              +1
            </button>
            <button
              onClick={() => setModifier(0)}
              className="text-slate-500 hover:text-slate-300 ml-1 p-1"
              title="Zerar modificador"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dice Buttons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {diceButtons.map((dice) => (
            <button
              key={dice.label}
              onClick={() => handleRoll(dice.sides, 1)}
              className="p-3 bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group shadow-sm active:scale-95"
            >
              <span className={`text-base font-black font-mono ${dice.iconColor}`}>
                {dice.label}
              </span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-mono">
                1{dice.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom formula form */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: 2d6+3, 1d20-2, 3d8..."
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Rolar
          </button>
        </form>

        {/* Recent Rolls Strip */}
        {recentRolls.length > 0 && (
          <div className="border-t border-slate-800/80 pt-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
              Últimas Rolagens:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-mono">
              {recentRolls.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850 shrink-0 text-slate-300 flex items-center gap-1.5"
                >
                  <span className="text-slate-500">{r.formula}:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      r.isCritical ? "text-yellow-400" : r.isFumble ? "text-rose-400" : "text-white"
                    }`}
                  >
                    {r.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
