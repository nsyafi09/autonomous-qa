import { Page } from '@playwright/test';
import { BasePage } from '../core/BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly loginButton = this.page.locator('button[type="submit"]');
  private readonly flashMessage = this.page.locator('#flash');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.uiActions.gotoPage('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.uiActions.input('Username', this.usernameInput, username);
    await this.uiActions.input('Password', this.passwordInput, password);
    await this.uiActions.click('Login Button', this.loginButton);
  }

  async verifyFlashContains(expectedText: string): Promise<void> {
    await this.assertions.shouldContainText('Flash Message', this.flashMessage, expectedText);
  }
}
