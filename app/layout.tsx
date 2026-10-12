import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Projeto RPG Studio',
  description:
    'Plataforma inteligente e moderna para gerenciar sistemas de RPG de mesa, fichas automatizadas e regras personalizadas com assistente IA.',
  openGraph: {
    title: 'Projeto RPG Studio',
    description:
      'Plataforma inteligente e moderna para gerenciar sistemas de RPG de mesa, fichas automatizadas e regras personalizadas com assistente IA.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projeto RPG Studio',
    description:
      'Plataforma inteligente e moderna para gerenciar sistemas de RPG de mesa, fichas automatizadas e regras personalizadas com assistente IA.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#09090b] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
