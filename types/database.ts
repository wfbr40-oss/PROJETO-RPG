export type RoleType = 'mestre' | 'jogador';
export type RuleVisibility = 'personal' | 'campaign' | 'public';
export type RuleChangeType = 'adicionada' | 'removida' | 'alterada' | 'igual';

export interface Profile {
  id: string;
  display_name: string | null;
  email?: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  owner_id: string;
  created_at?: string;
  role?: RoleType;
  owner?: Profile | null;
  members_count?: number;
}

export interface CampaignMember {
  campaign_id: string;
  user_id: string;
  role: RoleType;
  profile?: Profile | null;
}

export interface GameSystem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  license: string | null;
  is_public: boolean;
  owner_id: string;
  created_at?: string;
  versions_count?: number;
}

export interface CampaignSystem {
  campaign_id: string;
  system_id: string;
  system?: GameSystem | null;
}

export interface SystemVersion {
  id: string;
  system_id: string;
  label: string;
  released_at: string | null;
  notes: string | null;
  created_at?: string;
}

export interface RuleCategory {
  id: string;
  version_id: string;
  name: string;
  position: number;
}

export interface Rule {
  id: string;
  version_id: string;
  category_id: string;
  stable_key: string;
  title: string;
  body: string;
  source_book: string | null;
  source_page: number | string | null;
  visibility: RuleVisibility;
  owner_id: string;
  campaign_id: string | null;
  created_at?: string;
  category?: RuleCategory | null;
}

export interface VersionComparisonResult {
  stable_key: string;
  change: RuleChangeType;
  title_a: string | null;
  title_b: string | null;
  body_a: string | null;
  body_b: string | null;
  category_a?: string | null;
  category_b?: string | null;
  source_a?: string | null;
  source_b?: string | null;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      campaigns: {
        Row: Campaign;
        Insert: { id?: string; name: string; owner_id: string };
        Update: Partial<Campaign>;
        Relationships: [];
      };
      campaign_members: {
        Row: CampaignMember;
        Insert: CampaignMember;
        Update: Partial<CampaignMember>;
        Relationships: [];
      };
      game_systems: {
        Row: GameSystem;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          license?: string | null;
          is_public?: boolean;
          owner_id: string;
        };
        Update: Partial<GameSystem>;
        Relationships: [];
      };
      campaign_systems: {
        Row: CampaignSystem;
        Insert: CampaignSystem;
        Update: Partial<CampaignSystem>;
        Relationships: [];
      };
      system_versions: {
        Row: SystemVersion;
        Insert: {
          id?: string;
          system_id: string;
          label: string;
          released_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<SystemVersion>;
        Relationships: [];
      };
      rule_categories: {
        Row: RuleCategory;
        Insert: {
          id?: string;
          version_id: string;
          name: string;
          position?: number;
        };
        Update: Partial<RuleCategory>;
        Relationships: [];
      };
      rules: {
        Row: Rule;
        Insert: {
          id?: string;
          version_id: string;
          category_id: string;
          stable_key: string;
          title: string;
          body: string;
          source_book?: string | null;
          source_page?: number | string | null;
          visibility: RuleVisibility;
          owner_id: string;
          campaign_id?: string | null;
        };
        Update: Partial<Rule>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      compare_versions: {
        Args: { version_a: string; version_b: string };
        Returns: VersionComparisonResult[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
