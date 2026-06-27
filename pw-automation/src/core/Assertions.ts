import { expect, Locator, Page, test } from '@playwright/test';

export class Assertions {
  constructor(private page: Page) {}

  async shouldBeVisible(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify visible: ${name}`, async () => {
      await expect(locator).toBeVisible();
    });
  }

  async shouldNotBeVisible(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify not visible: ${name}`, async () => {
      await expect(locator).toBeHidden();
    });
  }

  async shouldContainText(name: string, locator: Locator, expectedText: string): Promise<void> {
    await test.step(`Verify text: ${name}`, async () => {
      await expect(locator).toContainText(expectedText);
    });
  }

  async shouldHaveValue(name: string, locator: Locator, expectedValue: string): Promise<void> {
    await test.step(`Verify value: ${name}`, async () => {
      await expect(locator).toHaveValue(expectedValue);
    });
  }

  async shouldHaveUrl(expectedUrl: string | RegExp): Promise<void> {
    await test.step(`Verify URL: ${expectedUrl}`, async () => {
      await expect(this.page).toHaveURL(expectedUrl);
    });
  }
}
