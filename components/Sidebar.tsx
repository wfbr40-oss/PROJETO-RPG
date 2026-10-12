'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Shield,
  BookOpen,
  GitCompare,
  Users,
  PlusCircle,
  LogIn,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeft,
  X,
  ExternalLink,
} from 'lucide-react';

export type AppTab = 'systems' | 'compare' | 'campaigns' | 'create';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAuth: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  onOpenAuth,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user, profile, signOut } = useAuth();

  const navItems = [
    {
      id: 'systems' as AppTab,
      label: 'Sistemas & Regras',
      description: 'Explorar sistemas e manuais',
      icon: BookOpen,
    },
    {
      id: 'compare' as AppTab,
      label: 'Comparar Versões',
      description: 'Diferenças de regras e edições',
      icon: GitCompare,
    },
    {
      id: 'campaigns' as AppTab,
      label: 'Minhas Campanhas',
      description: 'Mesas, membros e sistemas',
      icon: Users,
    },
    {
      id: 'create' as AppTab,
      label: 'Cadastrar Conteúdo',
      description: 'Sistemas, categorias e regras',
      icon: PlusCircle,
    },
  ];

  const handleTabClick = (tabId: AppTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col bg-[#0b0c10] border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
        aria-label="Menu Lateral de Navegação"
      >
        {/* Logo / Brand Header */}
        <div className="h-16 border-b border-slate-800/80 flex items-center justify-between px-3.5 shrink-0 bg-[#090a0e]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-tight min-w-0 truncate">
                <span className="text-sm font-bold tracking-tight text-white truncate font-serif">
                  PROJETO RPG
                </span>
                <span className="text-[10px] font-mono text-indigo-400 truncate">
                  Gestão & Versões de Regras
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Módulos do Sistema
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl transition-all cursor-pointer group text-left ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } ${
                  isSelected
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm shadow-indigo-600/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate leading-tight font-sans">
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-slate-850 bg-[#08090d] shrink-0">
          {user ? (
            <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 font-bold text-xs">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {profile?.display_name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">
                    {user.email}
                  </div>
                </div>
              )}

              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-medium cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Entrar ou cadastrar"
            >
              <LogIn className="w-4 h-4 shrink-0 text-indigo-400" />
              {!isCollapsed && <span>Entrar / Cadastrar</span>}
            </button>
          )}

          {/* Legal / Copyright Note */}
          {!isCollapsed && (
            <div className="mt-2.5 pt-2 border-t border-slate-850/60 text-[9px] text-slate-500 leading-tight">
              Livros comerciais: uso estritamente pessoal e em campanha. Apenas sistemas livres são públicos.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
