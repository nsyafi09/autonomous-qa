import { test } from '@playwright/test';
import { LoginFlow } from '../../src/flows/LoginFlow';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  let flow: LoginFlow;

  test.beforeEach(async ({ page }) => {
    flow = new LoginFlow(page);
    await flow.goto();
  });

  test('valid credentials redirects to secure area', async () => {
    await flow.login(users.valid.username, users.valid.password);
    await flow.verifyFlashContains('You logged into a secure area!');
  });

  test('invalid password shows error', async () => {
    await flow.login(users.invalidPassword.username, users.invalidPassword.password);
    await flow.verifyFlashContains('Your password is invalid!');
  });

  test('invalid username shows error', async () => {
    await flow.login(users.invalidUsername.username, users.invalidUsername.password);
    await flow.verifyFlashContains('Your username is invalid!');
  });

  test('empty fields shows error', async () => {
    await flow.login('', '');
    await flow.verifyFlashContains('Your username is invalid!');
  });
});
