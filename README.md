# Hello!

This is a simple pilot project, to test out capabilities and more importantly "Concepts" related to QA Automations

Some my ideas currently:
### 1. Utilizing AI to produce customized Scripts
- Considers the specific domain the AI should work with
- Maybe instead of utilizing "MCP Servers" we can utilize in-house (own-built) tools
- > by tools, it means something that AI can utilize whether it is API calls, knowledge skills etc. 

By extension it'll also be able to "Self-heal"

Note: Above are sloopishly written on the spot. I've got a lot of ideas in mind just not enough time and energy to work on it properly outside of my work lol.

Note 2: -


### Some other upcoming ideas:
1. Cross-colaboration capabilities
2. Autonomous CICD that works with QA processes 

Idk

---


# Details:

```
QA Brain  →  Contracts  →  Execution Body
(ai-engine)   (JSON)        (Playwright)
```

The built-in Python AI engine is the default. You can swap it for any engine that follows the contract.

---

## How it works

```
1. Scan     npm run scan -- <url>
            → discovers interactive elements, writes page map

2. Think    python ai-engine/main.py plan <page>
            → AI writes a test plan (scope, risks, coverage)

3. Design   python ai-engine/main.py design <page>
            → AI writes test cases (preconditions, data, expected results)

4. Generate python ai-engine/main.py generate <page>
            → AI writes executable scenario drafts, validated before saving

5. Approve  copy generated/scenarios/<id>.generated.scenario.json
                  → pw-automation/scenarios/ui/<id>.scenario.json

6. Run      npm test
            → Playwright auto-discovers and runs every approved scenario
```

No generated file is ever executed automatically. Approval is always manual.

---

## Prerequisites

```bash
# Playwright layer
cd pw-automation && npm install

# OPTIONAL (this part is currently private, but python was used for this AI-Engine and an open source api was used.)
pip install -r requirements.txt

# Make sure API Key is within .env (ignored by git)
```

---

## Quick start

```bash
# 0 - Scan a page
cd pw-automation
npm run scan -- /login

# 1 - AI design + generate
# Note: this will be based on the 'Contracts' and availble resources. 
# -> Future Note: Consider to also adapt Scanning a Page to be processed by the AI engine / model


# Or run the interactive wizard
python main.py wizard

# Approve a draft --> Human 
cp ../generated/scenarios/<generated-scenario>.json \
   ../pw-automation/scenarios/ui/<generated-scenario>.scenario.json

# Run tests
cd ../pw-automation && npm test
```

---

# About

## AI Engine

```
Description to-be added
```

---

## Key paths (Flow)

```
Description to-be added
```

---

## Human (QA) input or Skills

_Example:_
In `ai-engine/input/` to inject domain knowledge:

```
ai-engine/input/login-scope.md       # what to test / what not to test
ai-engine/input/login-context.md     # domain rules, risk notes, user types
ai-engine/input/login-existing.md    # existing test cases to reference
```

The AI engine reads these automatically when generating plans and designs.

Further designs --> also consider more input source such as CSV, Excel, etc. Potentially whatever format is used initially when designing the Test or Domain Knowledge. 

- Note: Very possible to promote Cross-Collaboration. For example understanding requirement documents form project / product manager or busieness requirement etc. 

---

TBD extra Docs...