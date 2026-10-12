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

function repairJson(jsonStr: string): string {
  let cleaned = (jsonStr || "").trim();
  cleaned = cleaned.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }
  if (startIdx > 0) {
    cleaned = cleaned.substring(startIdx);
  }

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {}

  cleaned = cleaned.replace(/"((?:\\.|[^"\\])*)"/g, (match) => {
    return match
      .replace(/\r?\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  });
  cleaned = cleaned.replace(/\/\/[^\r\n]*/g, "");
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {}

  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        if (stack.length > 0 && stack[stack.length - 1] === "{") stack.pop();
      } else if (char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === "[") stack.pop();
      }
    }
  }

  if (inString) cleaned += '"';
  cleaned = cleaned.replace(/:\s*$/, ': ""');
  cleaned = cleaned.replace(/,\s*$/, "");
  while (stack.length > 0) {
    const openChar = stack.pop();
    if (openChar === "{") cleaned += "}";
    else if (openChar === "[") cleaned += "]";
  }
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {}
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const { systemName, description, rawText } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Chave API do Gemini não configurada no servidor." },
        { status: 500 }
      );
    }

    const prompt = `
Você é um arquivista e analista mestre de RPG de mesa.
Analise a descrição, anotações e trechos brutos fornecidos abaixo e estruture um sistema completo de RPG em formato JSON rigoroso.

NOME SUGERIDO DO SISTEMA: ${systemName || "Sistema de RPG Personalizado"}
DESCRIÇÃO BASE: ${description || "Criado pelo mestre"}
TEXTO DE REGRAS:
${rawText || "Crie um sistema coeso de aventura e fantasia com atributos, classes, habilidades e combate."}

DIRETRIZES:
1. Extraia a mecânica core de resolução (ex: 1d20+mod vs CD, 2d6 PbtA, d100 roll-under, pool de d6).
2. Extraia todos os atributos essenciais (nome, sigla curta como FOR, DES, INT, etc., e descrição).
3. Extraia classes ou arquétipos (nome, descrição, fórmula de PV ou caixas de vida, equipamentos).
4. Extraia habilidades e talentos (identifique a qual classe pertence, custo em recursos se houver, pré-requisitos e efeito mecânico).
5. Extraia magias ou poderes extraordinários.
6. Extraia condições e status de combate (efeitos mecânicos e penalidades).
7. Extraia tópicos gerais de combate (iniciativa, ações no turno, teste contra a morte).
8. Responda em Português do Brasil com dados completos.
    `.trim();

    const rulesSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        version: { type: Type.STRING },
        identity: {
          type: Type.OBJECT,
          properties: {
            coreMechanic: { type: Type.STRING },
            tone: { type: Type.STRING },
            criticalRule: { type: Type.STRING },
            fumbleRule: { type: Type.STRING },
          },
          required: ["coreMechanic", "tone"],
        },
        healthConfig: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING, enum: ["numeric", "boxes"] },
            defaultMaxHp: { type: Type.NUMBER },
            label: { type: Type.STRING },
          },
          required: ["style", "defaultMaxHp", "label"],
        },
        attributes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              shortName: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["name", "shortName", "description"],
          },
        },
        classes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              hpFormula: { type: Type.STRING },
              startingEquipment: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "description", "hpFormula"],
          },
        },
        resourceTracks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              shortName: { type: Type.STRING },
              color: { type: Type.STRING },
              defaultMax: { type: Type.NUMBER },
              description: { type: Type.STRING },
            },
            required: ["name", "shortName", "color", "defaultMax"],
          },
        },
        abilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              className: { type: Type.STRING },
              cost: { type: Type.STRING },
              actionType: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              mechanicalEffect: { type: Type.STRING },
            },
            required: ["name", "description"],
          },
        },
        spells: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              circleOrLevel: { type: Type.STRING },
              cost: { type: Type.STRING },
              range: { type: Type.STRING },
              duration: { type: Type.STRING },
              school: { type: Type.STRING },
              description: { type: Type.STRING },
              mechanicalEffect: { type: Type.STRING },
            },
            required: ["name", "description"],
          },
        },
        statuses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              effect: { type: Type.STRING },
              defaultSeverity: { type: Type.NUMBER },
            },
            required: ["name", "description"],
          },
        },
        combatRules: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING },
              rule: { type: Type.STRING },
            },
            required: ["topic", "rule"],
          },
        },
      },
      required: ["name", "description", "identity", "attributes", "classes"],
    };

    const models = ["gemini-3.8-flash", "gemini-3.1-pro-preview", "gemini-flash-latest"];
    let responseText = "";

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: rulesSchema,
            temperature: 0.2,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini SDK parse-rules] Model ${model} failed:`, err.message || err);
      }
    }

    if (!responseText) {
      throw new Error("Não foi possível gerar as regras estruturadas com os modelos disponíveis.");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const repaired = repairJson(responseText);
      parsed = JSON.parse(repaired);
    }

    // Ensure IDs on all nested arrays
    parsed.id = `sys_${Date.now()}`;
    parsed.version = parsed.version || "1.0";
    parsed.sections = parsed.sections || [];
    parsed.resourceTracks = parsed.resourceTracks || [];
    parsed.abilities = (parsed.abilities || []).map((a: any, i: number) => ({
      ...a,
      id: a.id || `ab_${Date.now()}_${i}`,
    }));
    parsed.spells = (parsed.spells || []).map((s: any, i: number) => ({
      ...s,
      id: s.id || `sp_${Date.now()}_${i}`,
    }));
    parsed.attributes = (parsed.attributes || []).map((at: any, i: number) => ({
      ...at,
      id: at.id || `attr_${Date.now()}_${i}`,
    }));
    parsed.classes = (parsed.classes || []).map((c: any, i: number) => ({
      ...c,
      id: c.id || `cls_${Date.now()}_${i}`,
    }));
    parsed.statuses = (parsed.statuses || []).map((st: any, i: number) => ({
      ...st,
      id: st.id || `st_${Date.now()}_${i}`,
    }));
    parsed.combatRules = (parsed.combatRules || []).map((cb: any, i: number) => ({
      ...cb,
      id: cb.id || `cb_${Date.now()}_${i}`,
    }));

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Erro em /api/parse-rules:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao analisar e estruturar regras do sistema." },
      { status: 500 }
    );
  }
}
