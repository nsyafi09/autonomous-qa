/**
 * Executes a WebScenario end-to-end against a live browser page.
 * Connects: scenario JSON → TestDataResolver (refs) → PageMapLocatorRegistry (locators) → UiActions/Assertions.
 *
 * Each step is resolved (valueRef/expectedRef filled) before dispatch.
 * Direct value/expected always wins over a ref.
 */

import path from 'path';
import { Page, test } from '@playwright/test';
import { UiActions } from '../../src/core/UiActions';
import { Assertions } from '../../src/core/Assertions';
import { PageMapLocatorRegistry } from '../registry/PageMapLocatorRegistry';
import { WebScenario, WebScenarioStep } from '../types/WebScenario';
import { TestDataResolver } from '../data/TestDataResolver';

export class WebScenarioRunner {
  private readonly uiActions: UiActions;
  private readonly assertions: Assertions;
  private readonly registry: PageMapLocatorRegistry;
  private readonly dataResolver: TestDataResolver;

  constructor(private readonly page: Page) {
    this.uiActions = new UiActions(page);
    this.assertions = new Assertions(page);
    this.registry = new PageMapLocatorRegistry(page);
    this.dataResolver = TestDataResolver.load(path.join(__dirname, '..', '..', 'test-data'));
  }

  async run(scenario: WebScenario): Promise<void> {
    await test.step(`Run scenario: ${scenario.name}`, async () => {
      for (const step of scenario.steps) {
        await this.runStep(step);
      }
    });
  }

  // Fills value/expected from data refs if not set already directly
  private resolveStep(raw: WebScenarioStep): WebScenarioStep {
    return {
      ...raw,
      value: raw.value ?? (raw.valueRef ? this.dataResolver.get(raw.valueRef) : undefined),
      expected: raw.expected ?? (raw.expectedRef ? this.dataResolver.get(raw.expectedRef) : undefined),
    };
  }

  private async runStep(rawStep: WebScenarioStep): Promise<void> {
    const step = this.resolveStep(rawStep);
    switch (step.action) {
      case 'open':
        await this.uiActions.gotoPage(step.target);
        break;

      case 'click':
        await this.uiActions.click(step.target, this.registry.get(step.target));
        break;

      case 'doubleClick':
        await this.uiActions.doubleClick(step.target, this.registry.get(step.target));
        break;

      case 'input':
        this.requireValue(step);
        await this.uiActions.input(step.target, this.registry.get(step.target), step.value);
        break;

      case 'clear':
        await this.uiActions.clear(step.target, this.registry.get(step.target));
        break;

      case 'pressKey':
        this.requireKey(step);
        await this.uiActions.pressKey(step.target, this.registry.get(step.target), step.key);
        break;

      case 'select':
        this.requireValue(step);
        await this.uiActions.select(step.target, this.registry.get(step.target), step.value);
        break;

      case 'hover':
        await this.uiActions.hover(step.target, this.registry.get(step.target));
        break;

      case 'check':
        await this.uiActions.check(step.target, this.registry.get(step.target));
        break;

      case 'uncheck':
        await this.uiActions.uncheck(step.target, this.registry.get(step.target));
        break;

      case 'verifyVisible':
        await this.assertions.shouldBeVisible(step.target, this.registry.get(step.target));
        break;

      case 'verifyHidden':
        await this.assertions.shouldBeHidden(step.target, this.registry.get(step.target));
        break;

      case 'verifyText':
        this.requireExpected(step);
        await this.assertions.shouldContainText(step.target, this.registry.get(step.target), step.expected);
        break;

      case 'verifyExactText':
        this.requireExpected(step);
        await this.assertions.shouldHaveText(step.target, this.registry.get(step.target), step.expected);
        break;

      case 'verifyValue':
        this.requireExpected(step);
        await this.assertions.shouldHaveValue(step.target, this.registry.get(step.target), step.expected);
        break;

      case 'verifyChecked':
        await this.assertions.shouldBeChecked(step.target, this.registry.get(step.target));
        break;

      case 'verifyUnchecked':
        await this.assertions.shouldNotBeChecked(step.target, this.registry.get(step.target));
        break;

      case 'verifyUrl':
        this.requireExpected(step);
        await this.assertions.shouldHaveUrl(step.expected);
        break;

      default:
        throw new Error(`Unsupported scenario action: "${(step as WebScenarioStep).action}"`);
    }
  }

  // TypeScript assertion guards —> narrow step type so downstream code has a guaranteed non-undefined field
  private requireValue(step: WebScenarioStep): asserts step is WebScenarioStep & { value: string } {
    if (step.value === undefined) {
      throw new Error(`Action "${step.action}" requires "value". Target: "${step.target}"`);
    }
  }

  private requireExpected(step: WebScenarioStep): asserts step is WebScenarioStep & { expected: string } {
    if (step.expected === undefined) {
      throw new Error(`Action "${step.action}" requires "expected". Target: "${step.target}"`);
    }
  }

  private requireKey(step: WebScenarioStep): asserts step is WebScenarioStep & { key: string } {
    if (step.key === undefined) {
      throw new Error(`Action "${step.action}" requires "key". Target: "${step.target}"`);
    }
  }
}
