# PROJETO RPG 🎲

Plataforma web moderna e responsiva para jogadores e mestres de RPG de mesa (TTRPG). O sistema gerencia regras, versões/edições, categorias personalizadas por versão, direitos autorais e campanhas compartilhadas via **Supabase** (Postgres + Auth + RLS).

---

## 📁 Estrutura de Pastas do Projeto

```
PROJETO-RPG/
├── app/
│   ├── globals.css           # Estilos globais Tailwind CSS
│   ├── layout.tsx            # Root layout com AuthProvider e metadados
│   └── page.tsx              # Ponto de entrada do SPA com navegação de abas e menu lateral
├── components/
│   ├── AuthModal.tsx         # Modal de Login e Cadastro (Supabase Auth)
│   ├── Navbar.tsx            # Barra superior responsiva com gatilho mobile e perfil
│   ├── Sidebar.tsx           # Menu lateral expansível/recolhível com drawer mobile
│   └── views/
│       ├── SystemsView.tsx         # Tela 2: Listagem e busca de sistemas (públicos, próprios e campanhas)
│       ├── SystemDetailView.tsx    # Tela 3: Detalhes, versões, categorias e regras (livro e página)
│       ├── CompareVersionsView.tsx # Tela 4: Comparador de versões com RPC e destaque visual (diff)
│       ├── CampaignsView.tsx       # Tela 5: Gestão de campanhas, membros, papéis e regras da mesa
│       └── CreateContentView.tsx   # Tela 6: Criação de sistemas privados, versões, categorias e regras
├── lib/
│   ├── authContext.tsx       # Provedor React Context para estado de autenticação e perfil
│   ├── diffHelper.ts         # Cálculo de diff textual (palavra por palavra) e comparador de fallback
│   ├── supabase.ts           # Cliente Supabase tipado (@supabase/supabase-js)
│   └── utils.ts              # Utilitários de classes CSS (clsx + twMerge)
├── types/
│   └── database.ts           # Definições TypeScript fiéis ao schema do Supabase (tabelas e RPC)
├── .env.example              # Modelo de variáveis de ambiente
├── vercel.json               # Configuração de framework para deploy na Vercel
├── package.json              # Dependências e scripts do Next.js
├── tsconfig.json             # Configuração TypeScript
└── README.md                 # Documentação e instruções de deploy
```

---

## 🗄️ Banco de Dados (Supabase)

O sistema consome o banco de dados Postgres já configurado com RLS (Row Level Security):

- `profiles(id, display_name)`
- `campaigns(id, name, owner_id)`
- `campaign_members(campaign_id, user_id, role 'mestre'|'jogador')`
- `game_systems(id, name, slug, description, license, is_public, owner_id)`
- `campaign_systems(campaign_id, system_id)`
- `system_versions(id, system_id, label, released_at, notes)`
- `rule_categories(id, version_id, name, position)`
- `rules(id, version_id, category_id, stable_key, title, body, source_book, source_page, visibility, owner_id, campaign_id)`
- **RPC `compare_versions(version_a uuid, version_b uuid)`**: Compara regras entre duas versões utilizando a `stable_key` e retorna o status (`adicionada`, `removida`, `alterada`, `igual`).

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz (já configuradas na Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://bgjidfstxqtxyficawal.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_WYv61w1nTBrFDuz3_FGibQ_b-L0Zjw4
```

> **Atenção:** Nunca utilize a Service Role Key no front-end. A segurança e privacidade do conteúdo comercial são garantidas pelas regras de RLS do Supabase.

---

## 💻 Instalação e Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo de desenvolvimento
npm run dev

# 3. Gerar build de produção para validação
npm run build
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🚀 Como Subir no GitHub e Deploy na Vercel

Para atualizar o repositório `wfbr40-oss/PROJETO-RPG` na branch `main`:

```bash
# 1. Inicializar ou sincronizar o git
git add .
git commit -m "feat: implementar PROJETO RPG completo com Supabase, menu lateral e comparador"

# 2. Vincular o repositório remoto (se ainda não vinculado)
git remote add origin https://github.com/wfbr40-oss/PROJETO-RPG.git

# 3. Enviar as alterações para a branch main
git branch -M main
git push -u origin main
```

Na **Vercel**:
1. Conecte o repositório `wfbr40-oss/PROJETO-RPG`.
2. As variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` já estão ativas.
3. O deploy será realizado automaticamente a cada novo commit na branch `main`.
