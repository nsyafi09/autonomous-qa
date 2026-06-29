/**
 * Schema types for scenario JSON files (scenarios/ui/*.scenario.json).
 * These are the types AI will write and WebScenarioRunner will execute.
 *
 * value/valueRef and expected/expectedRef: direct value always wins over a ref.
 * Refs are resolved at runtime via TestDataResolver from test-data/*.json.
 */

export type WebScenarioAction =
  | 'open'
  | 'click'
  | 'doubleClick'
  | 'input'
  | 'clear'
  | 'pressKey'
  | 'select'
  | 'hover'
  | 'check'
  | 'uncheck'
  | 'verifyVisible'
  | 'verifyHidden'
  | 'verifyText'
  | 'verifyExactText'
  | 'verifyValue'
  | 'verifyChecked'
  | 'verifyUnchecked'
  | 'verifyUrl';

export type WebScenarioStep = {
  action: WebScenarioAction;
  target: string;
  value?: string;
  valueRef?: string;
  expected?: string;
  expectedRef?: string;
  key?: string; // pressKey action only
};

export type WebScenario = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  steps: WebScenarioStep[];
};
