"use client";

import React, { useState } from "react";
import { RpgSystemRules } from "@/types/rpg";
import { X, Code, Copy, Check, FileJson } from "lucide-react";

interface RawJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: RpgSystemRules | null;
  onSave: (updated: RpgSystemRules) => void;
}

export function RawJsonModal({ isOpen, onClose, system, onSave }: RawJsonModalProps) {
  const [jsonText, setJsonText] = useState(() => (system ? JSON.stringify(system, null, 2) : ""));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !system) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.name || !parsed.id) {
        throw new Error("O JSON precisa conter ao menos os campos 'id' e 'name'.");
      }
      onSave(parsed);
      onClose();
    } catch (err: any) {
      setError(`Erro de sintaxe JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#0e0e13] border border-amber-900/40 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-serif">
                Editor RAW JSON do Sistema ({system.name})
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualize, edite ou exporte toda a estrutura de regras em JSON.
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

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 shrink-0">
            {error}
          </div>
        )}

        {/* Textarea */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-t-xl text-[10px] font-mono text-slate-400 shrink-0">
            <span>JSON ESTRUTURADO</span>
            <button
              onClick={handleCopy}
              className="hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar JSON</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            spellCheck={false}
            className="flex-1 w-full bg-[#070709] border-x border-b border-slate-800 rounded-b-xl p-3.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 shrink-0 text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            Alterações salvas atualizam as fichas e o oráculo instantaneamente.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Salvar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
