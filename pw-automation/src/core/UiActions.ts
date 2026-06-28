import { Locator, Page, test } from '@playwright/test';

export class UiActions {
  constructor(private readonly page: Page) {}

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

  async doubleClick(name: string, locator: Locator): Promise<void> {
    await test.step(`Double click: ${name}`, async () => {
      await locator.dblclick();
    });
  }

  async input(name: string, locator: Locator, value: string): Promise<void> {
    await test.step(`Input: ${name}`, async () => {
      await locator.fill(value);
    });
  }

  async clear(name: string, locator: Locator): Promise<void> {
    await test.step(`Clear: ${name}`, async () => {
      await locator.clear();
    });
  }

  async pressKey(name: string, locator: Locator, key: string): Promise<void> {
    await test.step(`Press key on ${name}: ${key}`, async () => {
      await locator.press(key);
    });
  }

  async select(name: string, locator: Locator, value: string): Promise<void> {
    await test.step(`Select: ${name} → ${value}`, async () => {
      await locator.selectOption(value);
    });
  }

  async hover(name: string, locator: Locator): Promise<void> {
    await test.step(`Hover: ${name}`, async () => {
      await locator.hover();
    });
  }

  async check(name: string, locator: Locator): Promise<void> {
    await test.step(`Check: ${name}`, async () => {
      await locator.check();
    });
  }

  async uncheck(name: string, locator: Locator): Promise<void> {
    await test.step(`Uncheck: ${name}`, async () => {
      await locator.uncheck();
    });
  }

  async scrollIntoView(name: string, locator: Locator): Promise<void> {
    await test.step(`Scroll into view: ${name}`, async () => {
      await locator.scrollIntoViewIfNeeded();
    });
  }

  async getText(name: string, locator: Locator): Promise<string> {
    return await test.step(`Get text: ${name}`, async () => {
      return await locator.innerText();
    });
  }

  async getRawText(name: string, locator: Locator): Promise<string> {
    return await test.step(`Get raw text: ${name}`, async () => {
      return (await locator.textContent()) ?? '';
    });
  }

  async getAttribute(name: string, locator: Locator, attributeName: string): Promise<string | null> {
    return await test.step(`Get attribute: ${name}.${attributeName}`, async () => {
      return await locator.getAttribute(attributeName);
    });
  }
}
