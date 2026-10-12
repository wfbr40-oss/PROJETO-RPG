"use client";

import React, { useState } from "react";
import { SystemSection, SystemSectionRole, SystemSectionItem } from "@/types/rpg";
import { X, Layers, Plus, Trash2 } from "lucide-react";

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToEdit?: SystemSection | null;
  onSave: (section: SystemSection) => void;
}

export function SectionModal({
  isOpen,
  onClose,
  sectionToEdit,
  onSave,
}: SectionModalProps) {
  const [title, setTitle] = useState(sectionToEdit?.title || "");
  const [role, setRole] = useState<SystemSectionRole>(sectionToEdit?.role || "custom");
  const [description, setDescription] = useState(sectionToEdit?.description || "");
  const [items, setItems] = useState<SystemSectionItem[]>(sectionToEdit?.items || []);

  // New Item inputs
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemEffect, setNewItemEffect] = useState("");

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: SystemSectionItem = {
      id: `it_${Date.now()}`,
      name: newItemName.trim(),
      description: newItemDesc.trim(),
      mechanicalEffect: newItemEffect.trim() || undefined,
    };

    setItems([...items, item]);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemEffect("");
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const section: SystemSection = {
      id: sectionToEdit?.id || `sec_${Date.now()}`,
      title: title.trim(),
      role,
      description: description.trim(),
      items,
    };

    onSave(section);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#111116] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-serif">
              {sectionToEdit ? `Editar Seção: ${sectionToEdit.title}` : "Criar Nova Seção / Divisão de Regras"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Título da Seção *</label>
              <input
                type="text"
                required
                placeholder="Ex: Cyberware, Tabela de Sanidade, Veículos..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-mono font-bold text-slate-300 block mb-1">Papel Estrutural</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as SystemSectionRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="custom">Regras Personalizadas (Geral)</option>
                <option value="ability">Habilidades / Talentos</option>
                <option value="magic">Magias / Rituais</option>
                <option value="resource">Recursos Especiais</option>
                <option value="equipment">Equipamentos & Itens</option>
                <option value="status">Status & Condições</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono font-bold text-slate-300 block mb-1">Descrição / Instruções da Seção</label>
            <textarea
              rows={2}
              placeholder="Explique como essa mecânica funciona no sistema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Items inside this section */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Itens & Entradas da Seção ({items.length}):
            </span>

            {/* Quick add sub-item form */}
            <div className="space-y-2 border-b border-slate-900 pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do item/regra..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Custo ou efeito mecânico (opcional)..."
                  value={newItemEffect}
                  onChange={(e) => setNewItemEffect(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Descrição da regra..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg font-bold cursor-pointer"
                >
                  + Adicionar Item
                </button>
              </div>
            </div>

            {/* Current Items List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2 text-center">Nenhum item adicionado ainda.</p>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-slate-200">{it.name}</span>
                      {it.mechanicalEffect && (
                        <span className="text-[10px] font-mono text-indigo-400 ml-2">[{it.mechanicalEffect}]</span>
                      )}
                      <p className="text-[10px] text-slate-400 truncate">{it.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Salvar Seção
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
