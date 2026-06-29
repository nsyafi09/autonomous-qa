/**
 * Translates a LocatorCandidate (from PageMap) into a Playwright Locator.
 * Called by PageMapLocatorRegistry after candidate selection.
 */

import { Locator, Page } from '@playwright/test';
import { LocatorCandidate } from '../../tools/page-mapper/PageMap';

export function buildLocator(candidate: LocatorCandidate, page: Page): Locator {
  switch (candidate.strategy) {
    case 'label':
      return page.getByLabel(candidate.value!);
    case 'role':
      return page.getByRole(candidate.role as Parameters<Page['getByRole']>[0], {
        name: candidate.name,
        exact: candidate.exact,
      });
    case 'placeholder':
      return page.getByPlaceholder(candidate.value!);
    case 'text':
      return page.getByText(candidate.value!);
    case 'css':
      return page.locator(candidate.value!);
    case 'cssNth': // positional — element had no unique attribute at scan time
      return page.locator(candidate.value!).nth(candidate.index ?? 0);
    default:
      throw new Error(`Unknown locator strategy: "${(candidate as LocatorCandidate).strategy}"`);
  }
}
