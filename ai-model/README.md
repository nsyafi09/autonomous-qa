# AI Engine

Future home for AI-assisted QA tooling:

- `dom-analysis/` — scans a URL, outputs element maps (locators, roles, labels)
- `scenario-generation/` — reads DOM maps, generates scenario YAML drafts
- `prompts/` — prompt templates used for scenario generation

## Output

Generated scenarios are written to `../generated/scenarios/` for human review before being moved to `../pw-automation/scenarios/`.
