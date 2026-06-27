import { test } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { LoginFlow } from '../../src/flows/LoginFlow';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  let loginPage: LoginPage;
  let flow: LoginFlow;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    flow = new LoginFlow(page);
    await loginPage.goto();
  });

  test('valid credentials redirects to secure area', async () => {
    await flow.login(users.valid.username, users.valid.password);
    await loginPage.verifyFlashContains('You logged into a secure area!');
  });

  test('invalid password shows error', async () => {
    await flow.login(users.invalidPassword.username, users.invalidPassword.password);
    await loginPage.verifyFlashContains('Your password is invalid!');
  });

  test('invalid username shows error', async () => {
    await flow.login(users.invalidUsername.username, users.invalidUsername.password);
    await loginPage.verifyFlashContains('Your username is invalid!');
  });

  test('empty fields shows error', async () => {
    await flow.login('', '');
    await loginPage.verifyFlashContains('Your username is invalid!');
  });
});
