import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export class LoginFlow {
  private loginPage: LoginPage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
  }

  async goto(): Promise<void> {
    await this.loginPage.goto();
  }

  async login(username: string, password: string): Promise<void> {
    await this.loginPage.login(username, password);
  }

  async verifyFlashContains(expectedText: string): Promise<void> {
    await this.loginPage.verifyFlashContains(expectedText);
  }
}
