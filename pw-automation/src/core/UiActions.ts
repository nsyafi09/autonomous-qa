import { Locator, Page, test } from '@playwright/test';

export class UiActions {
  constructor(private page: Page) {}

  async gotoPage(pathOrUrl: string): Promise<void> {
    await test.step(`Open page: ${pathOrUrl}`, async () => {
      await this.page.goto(pathOrUrl);
    });
  }

  async click(name: string, locator: Locator): Promise<void> {
    await test.step(`Click: ${name}`, async () => {
      await locator.click();
    });
  }

  async input(name: string, locator: Locator, value: string): Promise<void> {
    await test.step(`Input: ${name}`, async () => {
      await locator.fill(value);
    });
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }
}
