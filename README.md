# Projeto RPG Studio 🎲

Plataforma moderna, intuitiva e completa para gerenciamento de mesas e sistemas de RPG de mesa (TTRPG), com fichas automatizadas, busca e personalização profunda de regras e assistente inteligente (Odysseus IA).

---

## 🚀 Como Fazer Deploy na Vercel

O projeto foi configurado com suporte nativo e otimizado para a **Vercel** com Next.js 15 App Router.

### Opção 1: Deploy Direto via GitHub (Recomendado)

1. Faça push do código para o seu repositório no **GitHub** / **GitLab** / **Bitbucket**.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New..."** > **"Project"**.
3. Importe o repositório do projeto.
4. Na tela de configuração:
   - **Framework Preset**: Detectará automaticamente `Next.js`.
   - **Root Directory**: `./`
5. Em **Environment Variables** (Variáveis de Ambiente), adicione:
   - `GEMINI_API_KEY`: Sua chave de API do Google Gemini (obtenha em [Google AI Studio](https://aistudio.google.com/)).
6. Clique em **Deploy**.

---

### Opção 2: Deploy via Vercel CLI

Se preferir usar o terminal:

1. Instale ou execute a Vercel CLI:
   ```bash
   npx vercel
   ```
2. Siga as instruções do terminal para vincular sua conta e projeto.
3. Para configurar a variável de ambiente no projeto:
   ```bash
   npx vercel env add GEMINI_API_KEY
   ```
4. Para realizar o deploy de produção:
   ```bash
   npx vercel --prod
   ```

---

## 💻 Como Rodar Localmente

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` na raiz com sua chave do Gemini:
   ```env
   GEMINI_API_KEY="sua_chave_aqui"
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador: `http://localhost:3000`

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router & Server Actions / Route Handlers)
- **UI & Estilização**: React 19, [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Inteligência Artificial**: SDK Oficial [`@google/genai`](https://www.npmjs.com/package/@google/genai) no backend (Gemini 3.8 Flash)
- **Áudio & Dados**: Web Audio API sintetizada nativamente para rolagens poliedrais (d4 a d100)
