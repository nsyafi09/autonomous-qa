import { Page } from '@playwright/test';
import { UiActions } from './UiActions';
import { Assertions } from './Assertions';

export abstract class BasePage {
  protected uiActions: UiActions;
  protected assertions: Assertions;

  constructor(protected page: Page) {
    this.uiActions = new UiActions(page);
    this.assertions = new Assertions();
  }
}
