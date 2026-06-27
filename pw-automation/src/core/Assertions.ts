import { expect, Locator, test } from '@playwright/test';

export class Assertions {
  async shouldBeVisible(name: string, locator: Locator): Promise<void> {
    await test.step(`Verify visible: ${name}`, async () => {
      await expect(locator).toBeVisible();
    });
  }

  async shouldContainText(name: string, locator: Locator, expectedText: string): Promise<void> {
    await test.step(`Verify text: ${name}`, async () => {
      await expect(locator).toContainText(expectedText);
    });
  }
}
