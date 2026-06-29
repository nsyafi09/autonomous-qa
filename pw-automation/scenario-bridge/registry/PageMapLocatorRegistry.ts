/**
 * Primary locator registry (Otherwise can also be though of a "Resolver")
 * Loads all page maps from generated/page-maps/ at construction
 * and resolves targets at test time. Falls back to FallbackLocatorRegistry for unknown targets.
 *
 * Resolution order: PageMap (isUnique candidates preferred) → FallbackLocatorRegistry fallback.
 * Set DEBUG_LOCATORS=true to log each resolution decision.
 */

import { Locator, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LocatorCandidate, PageMap, TargetEntry } from '../../tools/page-mapper/PageMap';
import { buildLocator } from './LocatorFactory';
import { FallbackLocatorRegistry } from './FallbackLocatorRegistry';

const debugEnabled = !!process.env.DEBUG_LOCATORS;
function debug(...args: unknown[]): void {
  if (debugEnabled) console.log('[Registry]', ...args);
}

// Prefers candidates verified unique at scan time 
// --> Falls back to highest score if none are unique
function pickBestCandidate(candidates: LocatorCandidate[]): LocatorCandidate {
  const unique = candidates.filter(c => c.isUnique === true);
  const pool = unique.length > 0 ? unique : candidates;
  return [...pool].sort((a, b) => b.score - a.score)[0];
}

export class PageMapLocatorRegistry {
  private readonly targets: Record<string, TargetEntry> = {};
  private readonly fallback: FallbackLocatorRegistry;

  constructor(private readonly page: Page) {
    this.fallback = new FallbackLocatorRegistry(page);
    this.loadPageMaps();
  }

  private loadPageMaps(): void {
    const mapsDir = path.join(__dirname, '..', '..', '..', 'generated', 'page-maps');
    if (!fs.existsSync(mapsDir)) return;

    let fileCount = 0;
    for (const file of fs.readdirSync(mapsDir).filter(f => f.endsWith('.page-map.json'))) {
      const pageMap: PageMap = JSON.parse(fs.readFileSync(path.join(mapsDir, file), 'utf-8'));
      Object.assign(this.targets, pageMap.targets);
      fileCount++;
    }
    debug(`Loaded ${fileCount} page map(s) — ${Object.keys(this.targets).length} targets available`);
  }

  get(target: string): Locator {
    const entry = this.targets[target];
    if (!entry) {
      debug(`[Fallback] ${target}`);
      return this.fallback.get(target);
    }

    const best = pickBestCandidate(entry.locatorCandidates);
    const hint = best.value ?? best.name ?? best.role ?? '';
    const uniqueLabel = best.isUnique !== undefined ? ` unique:${best.isUnique}` : '';
    debug(`[PageMap] ${target} → ${best.strategy} "${hint}"${uniqueLabel}`);
    return buildLocator(best, this.page);
  }
}
