import { expect, Locator, Page, test } from '@playwright/test';

export class Assertions {
  constructor(private page: Page) {}

  async shouldBeVisible(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify visible: ${name}`, async () => {
      await expect(locator).toBeVisible();
    });
  }

  async shouldBeHidden(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify hidden: ${name}`, async () => {
      await expect(locator).toBeHidden();
    });
  }

  async shouldContainText(name: string, locator: Locator, expectedText: string | RegExp): Promise<void> {
    await test.step(`Verify text contains: ${name}`, async () => {
      await expect(locator).toContainText(expectedText);
    });
  }

  async shouldHaveText(name: string, locator: Locator, expectedText: string | RegExp): Promise<void> {
    await test.step(`Verify exact text: ${name}`, async () => {
      await expect(locator).toHaveText(expectedText);
    });
  }

  async shouldHaveValue(name: string, locator: Locator, expectedValue: string | RegExp): Promise<void> {
    await test.step(`Verify value: ${name}`, async () => {
      await expect(locator).toHaveValue(expectedValue);
    });
  }

  async shouldHaveUrl(expectedUrl: string | RegExp): Promise<void> {
    await test.step(`Verify URL: ${expectedUrl.toString()}`, async () => {
      await expect(this.page).toHaveURL(expectedUrl);
    });
  }

  async shouldBeChecked(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify checked: ${name}`, async () => {
      await expect(locator).toBeChecked();
    });
  }

  async shouldNotBeChecked(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify not checked: ${name}`, async () => {
      await expect(locator).not.toBeChecked();
    });
  }

  async shouldBeEnabled(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify enabled: ${name}`, async () => {
      await expect(locator).toBeEnabled();
    });
  }

  async shouldBeDisabled(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify disabled: ${name}`, async () => {
      await expect(locator).toBeDisabled();
    });
  }

  async shouldHaveCount(name: string, locator: Locator, expectedCount: number): Promise<void> {
    await test.step(`Verify count: ${name} = ${expectedCount}`, async () => {
      await expect(locator).toHaveCount(expectedCount);
    });
  }
}
