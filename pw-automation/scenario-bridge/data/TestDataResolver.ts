/**
 * Resolves dot-notation data refs (e.g. "users.valid.username" → "tomsmith").
 * Data source: all *.json files in test-data/ merged at construction.
 * Used by WebScenarioRunner to fill valueRef / expectedRef in scenario steps.
 */

import fs from 'fs';
import path from 'path';

export class TestDataResolver {
  constructor(private readonly data: Record<string, unknown>) {}

  static load(dir: string): TestDataResolver {
    const merged: Record<string, unknown> = {};
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
        Object.assign(merged, JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')));
      }
    }
    return new TestDataResolver(merged);
  }

  // Traverses dot-notation path into the loaded data --> Throws on missing ref or non-string value
  // NOTE:
  // --> In the future, I think it's important to delve deeper into traversal logic, especially if we truly want to achieve scalability and effectiveness.
  get(ref: string): string {
    const value = ref.split('.').reduce<unknown>((cur, key) => {
      if (cur && typeof cur === 'object' && key in cur)
        return (cur as Record<string, unknown>)[key];
      throw new Error(`Unknown test data ref: "${ref}"`);
    }, this.data);

    if (typeof value !== 'string')
      throw new Error(`Test data ref "${ref}" must resolve to a string. Got: ${typeof value}`);
    return value;
  }
}
