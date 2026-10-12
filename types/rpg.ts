export type SystemSectionRole =
  | "attribute"
  | "class"
  | "status"
  | "ability"
  | "magic"
  | "combat_rule"
  | "resource"
  | "equipment"
  | "custom";

export interface SystemSectionItem {
  id: string;
  name: string;
  description: string;
  mechanicalEffect?: string;
  tags?: string[];
  customFields?: Record<string, any> | string;
  [key: string]: any;
}

export interface SystemSection {
  id: string;
  title: string;
  role: SystemSectionRole;
  description?: string;
  items: SystemSectionItem[];
}

export interface SystemIdentity {
  coreMechanic: string;
  tone: string;
  criticalRule?: string;
  fumbleRule?: string;
}

export interface AttributeDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  baseValue?: number;
  modifierFormula?: string;
}

export interface ClassDefinition {
  id: string;
  name: string;
  description: string;
  hpFormula: string;
  startingEquipment?: string[];
  primaryAttributes?: string[];
}

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  className?: string;
  cost?: string;
  actionType?: string;
  category?: string;
  tags?: string[];
  prerequisites?: string[];
  mechanicalEffect?: string;
  customFields?: Record<string, any> | string;
}

export interface SpellDefinition {
  id: string;
  name: string;
  description: string;
  circleOrLevel?: string;
  cost?: string;
  castingTime?: string;
  range?: string;
  duration?: string;
  school?: string;
  mechanicalEffect?: string;
}

export interface StatusDefinition {
  id: string;
  name: string;
  description: string;
  effect?: string;
  defaultSeverity?: number;
}

export interface CombatRuleDefinition {
  id: string;
  topic: string;
  rule: string;
}

export interface ResourceDefinition {
  id: string;
  name: string;
  shortName: string;
  color: "indigo" | "cyan" | "purple" | "emerald" | "amber" | "rose" | "crimson";
  defaultMax: number;
  description?: string;
}

export interface RpgSystemRules {
  id: string;
  name: string;
  description: string;
  version: string;
  identity: SystemIdentity;
  healthConfig: {
    style: "numeric" | "boxes";
    defaultMaxHp: number;
    label: string;
  };
  attributes: AttributeDefinition[];
  classes: ClassDefinition[];
  resourceTracks: ResourceDefinition[];
  abilities: AbilityDefinition[];
  spells: SpellDefinition[];
  statuses: StatusDefinition[];
  combatRules: CombatRuleDefinition[];
  sections: SystemSection[];
}

export interface CharacterResource {
  id: string;
  name: string;
  current: number;
  max: number;
  color: string;
}

export interface CharacterStatus {
  id: string;
  name: string;
  description?: string;
  effect?: string;
  severity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  equipped?: boolean;
}

export interface CustomAbility {
  id: string;
  name: string;
  description: string;
  className?: string;
  cost?: string;
  category?: string;
  tags?: string[];
}

export interface Character {
  id: string;
  campaignId: string;
  name: string;
  player: string;
  className: string;
  level: number;
  avatarUrl?: string;
  currentHp: number;
  maxHp: number;
  hpStyle?: "numeric" | "boxes";
  hpLabel?: string;
  resources: CharacterResource[];
  activeStatuses: CharacterStatus[];
  attributes: Record<string, number>; // shortName -> score
  selectedAbilities: string[];
  customAbilities: CustomAbility[];
  selectedSpells: string[];
  inventory: InventoryItem[];
  background: string;
  notes: string;
}

export interface NpcEntry {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface SessionLog {
  id: string;
  title: string;
  date: string;
  summary: string;
  npcsMet: string[];
  keyEvents: string[];
}

export interface VersionHistoryItem {
  id: string;
  version: string;
  date: string;
  summaryOfChanges: string;
  mechanicsImpact: string;
  migrationRules: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  activeSystemId: string;
  odysseusName: string;
  characters: Character[];
  sessionLogs: SessionLog[];
  npcList: NpcEntry[];
  versionHistory: VersionHistoryItem[];
}

export interface ChatMessage {
  id: string;
  sender: "player" | "assistant" | "system";
  text: string;
  timestamp: string;
  retrievedRules?: { topic: string; content: string }[];
  diceRoll?: DiceRollResult;
}

export interface DiceRollResult {
  id: string;
  characterName?: string;
  formula: string;
  diceType: "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100" | "custom";
  rolls: number[];
  modifier: number;
  total: number;
  isCritical?: boolean;
  isFumble?: boolean;
  reason?: string;
  timestamp: string;
}
