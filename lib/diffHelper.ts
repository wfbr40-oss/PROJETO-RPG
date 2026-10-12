import * as Diff from 'diff';
import { Rule, VersionComparisonResult } from '@/types/database';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function computeTextDiff(oldText: string | null = '', newText: string | null = ''): DiffPart[] {
  const textA = oldText || '';
  const textB = newText || '';
  
  if (!textA && !textB) return [];
  if (!textA) return [{ value: textB, added: true }];
  if (!textB) return [{ value: textA, removed: true }];

  return Diff.diffWordsWithSpace(textA, textB);
}

/**
 * Fallback comparison if RPC compare_versions encounters any issue or database schema variance.
 * Compares rules by stable_key between version A and version B.
 */
export function compareRulesLocally(
  rulesA: Rule[],
  rulesB: Rule[]
): VersionComparisonResult[] {
  const mapA = new Map<string, Rule>();
  const mapB = new Map<string, Rule>();

  rulesA.forEach((r) => mapA.set(r.stable_key, r));
  rulesB.forEach((r) => mapB.set(r.stable_key, r));

  const allKeys = Array.from(new Set([...Array.from(mapA.keys()), ...Array.from(mapB.keys())]));
  const results: VersionComparisonResult[] = [];

  for (const key of allKeys) {
    const itemA = mapA.get(key);
    const itemB = mapB.get(key);

    if (itemA && !itemB) {
      results.push({
        stable_key: key,
        change: 'removida',
        title_a: itemA.title,
        title_b: null,
        body_a: itemA.body,
        body_b: null,
      });
    } else if (!itemA && itemB) {
      results.push({
        stable_key: key,
        change: 'adicionada',
        title_a: null,
        title_b: itemB.title,
        body_a: null,
        body_b: itemB.body,
      });
    } else if (itemA && itemB) {
      const isBodyEqual = itemA.body.trim() === itemB.body.trim();
      const isTitleEqual = itemA.title.trim() === itemB.title.trim();

      if (isBodyEqual && isTitleEqual) {
        results.push({
          stable_key: key,
          change: 'igual',
          title_a: itemA.title,
          title_b: itemB.title,
          body_a: itemA.body,
          body_b: itemB.body,
        });
      } else {
        results.push({
          stable_key: key,
          change: 'alterada',
          title_a: itemA.title,
          title_b: itemB.title,
          body_a: itemA.body,
          body_b: itemB.body,
        });
      }
    }
  }

  // Sort: alterada first, then adicionada, then removida, then igual
  const order: Record<string, number> = {
    alterada: 1,
    adicionada: 2,
    removida: 3,
    igual: 4,
  };

  return results.sort((a, b) => (order[a.change] || 9) - (order[b.change] || 9));
}
