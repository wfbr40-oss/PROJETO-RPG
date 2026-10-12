import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function generateWithFallback(params: { contents: any; config?: any }) {
  const models = ["gemini-3.8-flash", "gemini-3.1-pro-preview", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini SDK] Falha com ${model}, tentando próximo modelo:`, err.message || err);
    }
  }
  throw lastError || new Error("Falha ao gerar resposta com todos os modelos disponíveis.");
}

function containsTerm(text: string, terms: string[]): boolean {
  const normalized = (text || "").toLowerCase();
  return terms.some((t) => t && normalized.includes(t.toLowerCase()));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history,
      odysseusName,
      systemRules,
      sessionLogs,
      npcList,
      characters,
      versionHistory,
    } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Chave API do Gemini não configurada no servidor (process.env.GEMINI_API_KEY)." },
        { status: 500 }
      );
    }

    const retrievedRules: { topic: string; content: string }[] = [];
    const contextSections: string[] = [];

    // 1. Contextualize System Rules
    if (systemRules) {
      const sysOverview = [
        `SISTEMA ATIVO: ${systemRules.name} (${systemRules.version || "1.0"})`,
        `Descrição: ${systemRules.description || ""}`,
        `Mecânica Core: ${systemRules.identity?.coreMechanic || "Não especificada"}`,
        `Tom do Cenário: ${systemRules.identity?.tone || "Aventura"}`,
        `Regra de Crítico: ${systemRules.identity?.criticalRule || "Padrão"}`,
        `Regra de Falha Crítica: ${systemRules.identity?.fumbleRule || "Padrão"}`,
      ].join("\n");
      contextSections.push(`=== LIVRO DE REGRAS DO SISTEMA ===\n${sysOverview}`);

      // Semantic / Keyword RAG slices
      if (systemRules.abilities && Array.isArray(systemRules.abilities)) {
        for (const ab of systemRules.abilities) {
          if (containsTerm(message, [ab.name, ab.className || ""])) {
            retrievedRules.push({
              topic: `Habilidade: ${ab.name} (${ab.className || "Geral"})`,
              content: `${ab.description} | Custo: ${ab.cost || "Passiva"} | Efeito: ${ab.mechanicalEffect || "Normal"}`,
            });
          }
        }
      }

      if (systemRules.spells && Array.isArray(systemRules.spells)) {
        for (const sp of systemRules.spells) {
          if (containsTerm(message, [sp.name, sp.school || ""])) {
            retrievedRules.push({
              topic: `Magia: ${sp.name} (${sp.circleOrLevel || "1º"})`,
              content: `${sp.description} | Custo: ${sp.cost || "Padrão"} | Alcance: ${sp.range || "Curto"} | Efeito: ${sp.mechanicalEffect || "Normal"}`,
            });
          }
        }
      }

      if (systemRules.combatRules && Array.isArray(systemRules.combatRules)) {
        for (const cb of systemRules.combatRules) {
          if (containsTerm(message, [cb.topic, cb.rule])) {
            retrievedRules.push({
              topic: `Combate: ${cb.topic}`,
              content: cb.rule,
            });
          }
        }
      }

      if (systemRules.statuses && Array.isArray(systemRules.statuses)) {
        for (const st of systemRules.statuses) {
          if (containsTerm(message, [st.name])) {
            retrievedRules.push({
              topic: `Condição: ${st.name}`,
              content: `${st.description} [Efeito: ${st.effect || "Penalidade"}]`,
            });
          }
        }
      }

      if (systemRules.classes && Array.isArray(systemRules.classes)) {
        for (const cl of systemRules.classes) {
          if (containsTerm(message, [cl.name])) {
            retrievedRules.push({
              topic: `Classe: ${cl.name}`,
              content: `${cl.description} | PV: ${cl.hpFormula} | Equipamento: ${(cl.startingEquipment || []).join(", ")}`,
            });
          }
        }
      }
    }

    // 2. Contextualize Active Characters
    if (characters && characters.length > 0) {
      const charBlock = characters
        .map((c: any) => {
          const attrs = Object.entries(c.attributes || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          const resources = (c.resources || [])
            .map((r: any) => `${r.name}: ${r.current}/${r.max}`)
            .join(", ");
          const statuses = (c.activeStatuses || [])
            .map((s: any) => `${s.name} (Nível ${s.severity})`)
            .join(", ");
          return `- [${c.name}] (Jogador: ${c.player || "Convidado"}) | Classe: ${c.className} (Nível ${c.level})\n  PV: ${c.currentHp}/${c.maxHp} | Recursos: ${resources || "Nenhum"}\n  Atributos: ${attrs}\n  Condições: ${statuses || "Nenhuma"}\n  Habilidades: ${(c.selectedAbilities || []).join(", ") || "Nenhuma"}\n  Magias: ${(c.selectedSpells || []).join(", ") || "Nenhuma"}\n  Histórico: ${c.background || "Nenhum"}`;
        })
        .join("\n\n");
      contextSections.push(`=== FICHAS DOS JOGADORES NA MESA ===\n${charBlock}`);
    }

    // 3. Contextualize Session Logs & History
    if (sessionLogs && sessionLogs.length > 0) {
      const logBlock = sessionLogs
        .slice(0, 5)
        .map(
          (l: any) =>
            `- Sessão "${l.title}" (${l.date}):\n  Resumo: ${l.summary}\n  NPCs: ${(l.npcsMet || []).join(", ")}\n  Eventos: ${(l.keyEvents || []).join(", ")}`
        )
        .join("\n\n");
      contextSections.push(`=== DIÁRIO DE AVENTURAS ANTERIORES ===\n${logBlock}`);
    }

    // 4. Contextualize NPCs
    if (npcList && npcList.length > 0) {
      const npcBlock = npcList.map((n: any) => `- ${n.name} (${n.role}): ${n.description}`).join("\n");
      contextSections.push(`=== NPCs DA CAMPANHA ===\n${npcBlock}`);
    }

    const fullCampaignContext = contextSections.join("\n\n------------------------\n\n");
    const retrievedSlicesText = retrievedRules
      .map((r) => `[REGRA CONSULTADA: ${r.topic}]\n${r.content}`)
      .join("\n\n");

    const systemInstruction = `
Você é Odysseus AI, o co-mestre, oráculo de regras e árbitro oficial desta mesa de RPG.
O mestre batizou você de "${odysseusName || "Odysseus Mestre IA"}".

DIRETRIZES DE RESPOSTA OBRIGATÓRIAS:
1. SEJA EXTREMAMENTE OBJETIVO, RÁPIDO E PRECISO: Vá direto à resposta da regra, ao resultado da rolagem ou à resolução da ação. Nunca use preâmbulos desnecessários ("Olá nobre aventureiro!", "Com certeza posso te ajudar com isso!", "Boa sorte na jornada").
2. USE AS REGRAS EXATAS DO SISTEMA ATIVO: Baseie-se 100% no livro de regras, classes, atributos e fórmulas do sistema carregado.
3. CONHEÇA AS FICHAS EM TEMPO REAL: Você sabe exatamente quantos PVs, Mana e quais habilidades cada personagem possui. Se o jogador disser "Quero usar Ataque Especial", verifique se ele tem PM suficiente e diga a consequência exata.
4. NUNCA MENCIONE QUE VOCÊ RECEBEU DADOS EM JSON, RAG OU PROMPT: Fale organicamente como um mestre experiente que tem o livro na cabeça e lembra de tudo da campanha.
5. Formate com Markdown limpo (negrito, listas pontuadas, tabelas curtas) para leitura imediata na mesa de jogo.
6. Escreva em Português do Brasil.
    `.trim();

    const formattedHistory = (history || []).map((h: any) => ({
      role: h.sender === "player" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [
          { text: `=== BASE DE DADOS DA MESA ===\n${fullCampaignContext}` },
          ...(retrievedSlicesText
            ? [{ text: `=== REGRAS ESPECÍFICAS DETECTADAS ===\n${retrievedSlicesText}` }]
            : []),
          { text: `MENSAGEM DA MESA: ${message}` },
        ],
      },
    ];

    const response = await generateWithFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    return NextResponse.json({
      reply: response.text || "Sem resposta gerada pelo oráculo.",
      retrievedRules,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/chat:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao processar chat com IA." },
      { status: 500 }
    );
  }
}
