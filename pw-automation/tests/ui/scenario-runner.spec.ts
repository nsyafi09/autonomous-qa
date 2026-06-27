import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import { WebScenarioRunner } from '../../scenario-bridge/runner/WebScenarioRunner';
import { WebScenario } from '../../scenario-bridge/types/WebScenario';

function loadScenario(filename: string): WebScenario {
  const scenarioPath = path.join(__dirname, '..', '..', 'scenarios', 'ui', filename);
  return JSON.parse(fs.readFileSync(scenarioPath, 'utf-8')) as WebScenario;
}

test.describe('Scenario Runner', () => {
  test('login-valid', { tag: ['@smoke', '@login'] }, async ({ page }) => {
    const scenario = loadScenario('login-valid.scenario.json');
    const runner = new WebScenarioRunner(page);
    await runner.run(scenario);
  });
});
