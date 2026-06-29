/**
 * Scenario Runner — auto-discovers and executes all *.scenario.json files in scenarios/ui/.
 *
 * No hardcoded test names. Each JSON file becomes one Playwright test automatically.
 * To add a new test: drop a *.scenario.json file into scenarios/ui/ and run npm test.
 *
 * How to run specific scenarios:
 *   npm test -- --grep "Valid user"         # by scenario name (matches scenario.name)
 *   npm run test:smoke                      # by tag: runs scenarios tagged with "smoke"
 *   DEBUG_LOCATORS=true npm test            # log per-step locator resolution
 *
 * Tags in the scenario JSON (e.g. ["smoke", "login"]) become Playwright tags (@smoke, @login).
 * Use --grep @tagname to filter by tag.
 *
 * page — Playwright's browser Page fixture, injected fresh per test by the framework.
 *        A new WebScenarioRunner is created per test so there is no shared state between scenarios.
 */

import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import { WebScenarioRunner } from '../../scenario-bridge/runner/WebScenarioRunner';
import { WebScenario } from '../../scenario-bridge/types/WebScenario';

// Load scenarios in -> scenarios/ui/
const scenariosDir = path.join(__dirname, '..', '..', 'scenarios', 'ui');

const scenarios: WebScenario[] = fs
  .readdirSync(scenariosDir)
  .filter(f => f.endsWith('.scenario.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(scenariosDir, f), 'utf-8')) as WebScenario);

test.describe('Scenario Runner', () => {
  for (const scenario of scenarios) {
    test(scenario.name, { tag: scenario.tags?.map(t => `@${t}`) ?? [] }, async ({ page }) => {
      await new WebScenarioRunner(page).run(scenario);
    });
  }
});
