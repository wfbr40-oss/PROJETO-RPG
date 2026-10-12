import { GoogleGenAI, Type } from "@google/genai";
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

export async function POST(req: NextRequest) {
  try {
    const { oldRules, newRulesText } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Chave API do Gemini não configurada no servidor." },
        { status: 500 }
      );
    }

    const prompt = `
Você é um arquivista e analista de sistemas de RPG de mesa.
O mestre está propondo uma atualização das regras do sistema atual "${oldRules?.name || "Sistema"}".
Compare o sistema atual (em JSON abaixo) com as novas exigências do mestre e gere um registro detalhado de Patch Notes e regras claras de migração para as fichas dos personagens.

SISTEMA ATUAL:
${JSON.stringify(oldRules, null, 2)}

NOVAS EXIGÊNCIAS / REQUISITOS DO PATCH:
${newRulesText}

INSTRUÇÕES:
- version: incremente a versão (ex: se era v1.0, vá para v1.1 ou v2.0 se forem mudanças profundas).
- summaryOfChanges: Resumo claro, objetivo e amigável em tópicos do que foi alterado, adicionado ou removido.
- mechanicsImpact: O impacto geral no jogo e na dinâmica da mesa.
- migrationRules: Instruções exatas para os jogadores adaptarem suas fichas (ex: "Guerreiros devem adicionar +5 de vida", "Ajuste o teste de magia com o novo custo em PM").
    `.trim();

    const diffSchema = {
      type: Type.OBJECT,
      properties: {
        version: { type: Type.STRING },
        summaryOfChanges: { type: Type.STRING },
        mechanicsImpact: { type: Type.STRING },
        migrationRules: { type: Type.STRING },
      },
      required: ["version", "summaryOfChanges", "mechanicsImpact", "migrationRules"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: diffSchema,
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Erro na rota /api/diff-rules:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao calcular diferenças de regras." },
      { status: 500 }
    );
  }
}
