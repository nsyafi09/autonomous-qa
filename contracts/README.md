# About Contract (Contract Schemas)

The AI Engine is simply the program or the part that works to read framework 'artifacts' then writing draft scenario.

Where the `contracts` come in is to define the rules / schemas the engine must abide or it speaks (generate).

## Details

Super simplified illustration:
```
Engine (AI) -> Contracts -> Executable 
```

### Minimum contract

#### 0 - Input

Example:

| File | Description |
|---|---|
| `generated/page-maps/<pageName>.page-map.json` | Page structure — interactive targets, locators, detected features |
| `test-data/*.json` | Available test data refs (merged into dot-notation keys) |

Both are produced by the framework. Your engine reads them. It does not produce them.

#### 1 - Human input (Technically optional BUT absolutely crucial to differenciate between simple Agents than this framework design)
> This is although optional, is absolutely crucial in understanding the testing domain and goal of the Tester / QA Engineer

- (if present in `ai-engine/input/`):
- This the skills or references that the AI refers to as it design the Scenarios. Whether it is simple things such as Scope, Domain Contect, Existing Regression pattern, Business requirements, etc. --> It is what guides and provide enough context for the AI-Engine.

Example (Super Simple):

- `<page>-scope.md` — what to test / what not to test
- `<page>-context.md` — domain knowledge, risk notes
- `<page>-existing.md` — existing manual test cases

#### 2 - Output

Each scenario must match the schema contract that is declared here. Example something like: `web-scenario.schema.json`. 
Invalid scenarios sare rejected by the framework validator before human validation or autonamous 'promotion' (to official scenario) is done.

---

### Example 

> (Only samples, need to adjust depending on what Testing tools are used.)

Taking case of using `json` and utilizing `Playwright`

Valid json object:

```json
{
  "id": "login-empty-fields",
  "name": "User cannot log in with empty credentials",
  "tags": ["negative", "validation"],
  "steps": [
    { "action": "open", "target": "/login" },
    { "action": "click", "target": "login.loginButton" },
    { "action": "verifyText", "target": "login.loginPageHeading", "expected": "Login Page" }
  ]
}
```

**Target keys** must match keys from `page-map.json` (e.g. `login.username`, `checkboxes.checkbox1`).

**Data refs** (`valueRef`, `expectedRef`) must match dot-notation keys from `test-data/*.json`.

Full schema sample: `tbd later`

---


# About Advanced Output

AI-Engine may also produce artifacts such as:

- The Purpose of `Contracts` here is to keep the output consistent. So even if such test artifacts are to be made, they keep their expected formats and able to be re-used and readable by humans

*Human-readable Test Artifacts*
- Test Plan / Strategy
- Test Design
- Test Scenarios
- etc.

(Ex: Excel/CSV Table, and so on..)

To be able to display what kind of scenario is being made. In further advanced, depending on the domain / expectations also should be able:

- (example) to mark if some Tests mark as "Regression" or "Progression". 
- Mark the priority of the tests (Example if there are multiple features on the product, which are the)

These outputs are expected to work with each other to design the expected Test Scripts.


---

## What This Layer (AI-Engine) Should NOT Do (for now)
> At this point of the development / design, this is what I feel like to be off limits for the time being.

- Modify `test-executor` artifact, in this case `pw-automation`

In this rough design the ability to self-heal is still being considered for future solution.

- It's definitely important in the future to have more self-healing capabilites. However, the current scope of this Framework design is to promote Cross-collaboration test script generation + a AI that is hyper focused on certain task (in this case whatever domain it is)

---
# Other Note

The power to execute the test case from the Engine can also be considered.

Need to consider the reach and what's allowed and setup a proper CI if that were the case. 
We want to avoid the AI-Engine becoming another "Agent". One of the weakness of AI-Agent is that it may be seemingly like a "Black box" more than controlled (though in the future, they might improve)