/**
 * NOTE: This is a fallback for now, in the future, there should only be ONE dynamically available registery.
 * --> In the meantime this is a fallback
 * 
 * Hardcoded fallback registry for targets not present in any page map.
 * Used for dynamic elements (e.g. flash messages) and cross-page targets
 * that aren't on the page at scan time.
 *
 * Target naming: page.element (e.g. login.flashMessage).
 */

import { Locator, Page } from '@playwright/test';

export class FallbackLocatorRegistry {
  constructor(private readonly page: Page) {}

  get(target: string): Locator {
    const locators: Record<string, Locator> = {
      'login.username': this.page.getByLabel('Username'),
      'login.password': this.page.getByLabel('Password'),
      'login.submitButton': this.page.getByRole('button', { name: /login/i }),
      'login.flashMessage': this.page.locator('#flash'),
      'login.secureAreaHeading': this.page.getByRole('heading', { name: 'Secure Area', exact: true }),
    };

    const locator = locators[target];

    if (!locator) {
      throw new Error(`Unknown locator target: "${target}". Scan the page or add it to FallbackLocatorRegistry.`);
    }

    return locator;
  }
}
