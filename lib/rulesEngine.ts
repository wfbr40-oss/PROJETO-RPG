import { RpgSystemRules, Character, DiceRollResult, AbilityDefinition } from "@/types/rpg";

export function calculateAttributeModifier(score: number, system?: RpgSystemRules | null): number {
  if (system?.id === "coc7e") {
    // Call of Cthulhu uses raw percentile (e.g. 65%), not D&D modifiers
    return score;
  }
  // Standard D&D / Tormenta20 / D20 modifier formula
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number, system?: RpgSystemRules | null): string {
  if (system?.id === "coc7e") {
    return `${mod}%`;
  }
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function parseAndRollDice(
  formula: string,
  characterName?: string,
  reason?: string,
  system?: RpgSystemRules | null
): DiceRollResult {
  const clean = formula.trim().toLowerCase().replace(/\s+/g, "");
  // Match e.g. 1d20+4, 2d6-1, d20, 1d100, 3d8+5
  const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/i);

  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const id = `roll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (!match) {
    // Fallback: roll 1d20
    const val = Math.floor(Math.random() * 20) + 1;
    return {
      id,
      characterName,
      formula: "1d20",
      diceType: "d20",
      rolls: [val],
      modifier: 0,
      total: val,
      isCritical: val === 20,
      isFumble: val === 1,
      reason,
      timestamp,
    };
  }

  const numDice = match[1] ? parseInt(match[1], 10) : 1;
  const dieSides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  const count = Math.min(Math.max(1, numDice), 30);
  const rolls: number[] = [];
  let sum = 0;

  for (let i = 0; i < count; i++) {
    const rolled = Math.floor(Math.random() * dieSides) + 1;
    rolls.push(rolled);
    sum += rolled;
  }

  const total = sum + modifier;

  let isCritical = false;
  let isFumble = false;

  if (dieSides === 20 && count === 1) {
    if (rolls[0] === 20) isCritical = true;
    if (rolls[0] === 1) isFumble = true;
  } else if (dieSides === 100 && count === 1) {
    if (rolls[0] === 1) isCritical = true;
    if (rolls[0] >= 96) isFumble = true;
  }

  let diceType: "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100" | "custom" = "custom";
  if ([4, 6, 8, 10, 12, 20, 100].includes(dieSides)) {
    diceType = `d${dieSides}` as any;
  }

  return {
    id,
    characterName,
    formula,
    diceType,
    rolls,
    modifier,
    total,
    isCritical,
    isFumble,
    reason,
    timestamp,
  };
}

export function getCharacterHpConfig(
  character?: Character | null,
  system?: RpgSystemRules | null
): {
  style: "numeric" | "boxes";
  label: string;
  maxHp: number;
  currentHp: number;
} {
  if (!character) {
    return { style: "numeric", label: "Pontos de Vida (PV)", maxHp: 10, currentHp: 10 };
  }

  const style: "numeric" | "boxes" = character.hpStyle || system?.healthConfig?.style || "numeric";
  const label: string = character.hpLabel || system?.healthConfig?.label || (style === "boxes" ? "Caixas de Vida / Ferimentos" : "Pontos de Vida (PV)");
  const maxHp = Math.max(1, character.maxHp || system?.healthConfig?.defaultMaxHp || 10);
  const currentHp = Math.max(0, character.currentHp ?? maxHp);

  return {
    style,
    label,
    maxHp,
    currentHp,
  };
}

export function getAbilityPrerequisites(ability: AbilityDefinition): string[] {
  const reqs: string[] = [];
  if (ability.prerequisites && Array.isArray(ability.prerequisites)) {
    reqs.push(...ability.prerequisites);
  }
  if (ability.tags && Array.isArray(ability.tags)) {
    for (const t of ability.tags) {
      const lower = t.toLowerCase();
      if (
        lower.includes("requisito") ||
        lower.includes("nível") ||
        lower.includes("nivel") ||
        lower.includes("exige") ||
        lower.includes("for ") ||
        lower.includes("des ") ||
        lower.includes("int ") ||
        lower.includes("sab ")
      ) {
        if (!reqs.includes(t)) reqs.push(t);
      }
    }
  }
  if (ability.description) {
    const match = ability.description.match(/(?:Requisito[s]?|Pré-requisito[s]?|Exigência[s]?):\s*([^.\n]+)/i);
    if (match && match[1]) {
      const extracted = `Requisito: ${match[1].trim()}`;
      if (!reqs.includes(extracted)) reqs.push(extracted);
    }
  }
  return reqs;
}

// Web Audio API Synthesizer (Zero External Dependencies, 100% Reliable Sound)
export class RpgSoundFX {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Realistic wooden polyhedral dice roll clatter
  static playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const clicks = [0, 0.04, 0.09, 0.15, 0.22, 0.31, 0.42];
    clicks.forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400 + Math.random() * 800, now + delay);
      filter.Q.setValueAtTime(3, now + delay);

      osc.type = idx % 2 === 0 ? "triangle" : "square";
      osc.frequency.setValueAtTime(150 + Math.random() * 250, now + delay);
      osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.05);

      const vol = 0.15 * Math.pow(0.85, idx);
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.07);
    });
  }

  // Triumphant critical hit chime
  static playCritical() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.18, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.45);
    });
  }

  // Fumble ominous low thud
  static playFumble() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Crisp UI click feedback
  static playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}
