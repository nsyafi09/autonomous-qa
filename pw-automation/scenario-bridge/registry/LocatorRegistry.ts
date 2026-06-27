import { Locator, Page } from '@playwright/test';

// Maps human/AI-readable target names to Playwright locators.
// Naming convention: page.element (e.g. login.username, login.submitButton)
// Intentionally mirrors LoginPage locators — this is the AI-facing interface.
// DOM scanner (Milestone 4) will eventually populate this automatically.
export class LocatorRegistry {
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
      throw new Error(`Unknown locator target: "${target}". Add it to LocatorRegistry.`);
    }

    return locator;
  }
}
