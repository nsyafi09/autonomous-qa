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
  expected?: string;
  key?: string;
};

export type WebScenario = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  steps: WebScenarioStep[];
};
