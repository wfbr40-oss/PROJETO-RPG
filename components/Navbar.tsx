'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';
import { Menu, Shield, LogIn, User, Sparkles } from 'lucide-react';
import { AppTab } from '@/components/Sidebar';

interface NavbarProps {
  activeTab: AppTab;
  onOpenMobileSidebar: () => void;
  onOpenAuth: () => void;
}

export function Navbar({ activeTab, onOpenMobileSidebar, onOpenAuth }: NavbarProps) {
  const { user, profile } = useAuth();

  const titles: Record<AppTab, { title: string; subtitle: string }> = {
    systems: {
      title: 'Sistemas & Regras',
      subtitle: 'Sistemas públicos, seus sistemas e das suas campanhas',
    },
    compare: {
      title: 'Comparador de Versões',
      subtitle: 'Entenda o que mudou entre edições de regras',
    },
    campaigns: {
      title: 'Campanhas & Mesas',
      subtitle: 'Gerencie membros, papéis e regras compartilhadas',
    },
    create: {
      title: 'Cadastrar Conteúdo',
      subtitle: 'Crie sistemas próprios, versões, categorias e regras',
    },
  };

  const current = titles[activeTab];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#0c0d12]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* View Titles */}
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{current.title}</span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right Action: Auth button or status */}
      <div className="flex items-center gap-2.5">
        {!user ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar / Cadastrar</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium truncate max-w-[120px] sm:max-w-[180px]">
              {profile?.display_name || user.email?.split('@')[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
