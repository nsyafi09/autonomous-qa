# Scenarios

Reviewed and approved scenario definitions ready for execution.

These are human-reviewed versions of AI-generated drafts from `generated/scenarios/`.

## Flow

```
ai-engine/ generates draft
    ↓
generated/scenarios/        ← raw AI output
    ↓  (human reviews)
pw-automation/scenarios/    ← approved, runnable
    ↓
Playwright scenario runner executes
```

## Format (planned: YAML)

```yaml
scenario: Valid Login
steps:
  - action: goto
    target: /login
  - action: login
    data: users.valid
  - action: verifyFlashContains
    expected: You logged into a secure area!
```
