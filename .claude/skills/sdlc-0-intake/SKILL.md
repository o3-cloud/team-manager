---
name: sdlc:0-intake
description: Intake and classify a software change for the AI-SDLC lifecycle. Trigger when starting a new change, writing the minimal human input contract, classifying a change, or setting up an SDLC run. Produces the contract, the change class, the gate profile, and the run state file.
when_to_use: Use as the first step of an AI-SDLC delivery, before any quality gate. Captures the five-part Minimal Human Input Contract, classifies the change, resolves which gates apply, and creates the run directory. Do not use to write requirements detail — that is the Requirements gate.
argument-hint: "<intent> [level=N] [risk=N] [research=on|off]"
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# AI-SDLC Gate 0 — Intake & Classify

## Goal

Turn a raw request into a **Minimal Human Input Contract**, classify the change, and
set up the run so the quality gates can execute against shared state.

## Inputs

`$ARGUMENTS`: the change intent, optionally `level=N` (autonomy 1–5), `risk=N`
(risk tolerance 2–10), and `research=on|off` to force or skip the pre-gate research step.
See [../sdlc-deliver/control-model.md](../sdlc-deliver/control-model.md).

## Workflow

1. **Build the Minimal Human Input Contract** (`.claude/skills/sdlc-knowledge/reference/templates/minimal-input-contract.md`):
   - **Intent** — one sentence: the desired outcome. Required — ask if missing.
   - **Context delta** — only what is new, unusual, or risky vs. the context packs.
     Infer a reasonable default if absent and state the assumption.
   - **Priority** — the main tradeoff to optimize (safe rollout, auditability, speed,
     UX, performance, cost). Infer if absent.
   - **Authority** — autonomy level + explicit escalation triggers. Required — if no
     `level` was given, default to `2` and state it.
   - **Acceptance** — Gherkin scenarios (happy path + a negative/boundary path).
     Required — draft them from the intent if the human did not, and mark as drafted.
2. **Restate the objective** in one precise sentence; confirm understanding.
3. **Classify the change** into exactly one class (`.claude/skills/sdlc-knowledge/reference/agent/change-classes.md`). When a
   change spans classes, pick the **most rigorous**:

   | Class | Default level | Gate profile |
   |-------|---------------|--------------|
   | Trivial | 4 | I, T(light), G |
   | Test-only | 3–4 | I, T, G |
   | Contained bug fix | 3 | R(light), K, I, T, P, G |
   | Internal refactor | 2–4 | D, K, I, T, P, G |
   | Small feature increment | 2–3 | R, D, K, I, T, S, L, P, G |
   | New feature | 2 | R, D, K, I, T, S, L, P, G (all nine) |
   | Schema / data migration | 2 | R, D, K, I, T, S, L, P, G |
   | Public API change | 2 | all nine |
   | Security / auth change | 1–2 | all nine + threat model |
   | Dependency change | 2–3 | K, I, T, S, L, P, G |
   | Infrastructure / deploy | 2–3 | D, K, I, T, S, L, P, G |

4. **Resolve the effective autonomy level**: the human's stated level overrides the
   class default in either direction. The class default is a recommendation, not a ceiling —
   a human operator may raise or lower the level as they see fit. **Resolve risk
   tolerance**: use the given `risk`, else the default for the level (L1→3, L2→4, L3→6,
   L4→8, L5→9).
5. **Create the run directory** `.sdlc/runs/<slug>/` where `<slug>` is a short
   kebab-case name from the intent.
6. **Run conditional pre-gate research** (new). If the change class is **Trivial** or **Test-only**, skip this step unless `research=on` was explicitly passed. Otherwise, unless `research=off` was passed, invoke `/sdlc:research` with the run slug and `out=.sdlc/runs/<slug>/`:

   | Change class | `questions=N` passed to research |
   |---|---|
   | Trivial | skip (unless `research=on`) |
   | Test-only | skip (unless `research=on`) |
   | Contained bug fix | 3 |
   | Internal refactor | 3 |
   | Small feature increment | 5 |
   | New feature | 7 |
   | Schema / data migration | 7 |
   | Public API change | 8 |
   | Security / auth change | 8 |
   | Dependency change | 5 |
   | Infrastructure / deploy | 6 |

   On success, record `research-report.md` and `research-questions.md` paths under `## Pre-gate artifacts` in `state.md`. If the research step errors, record the failure reason there and continue — research failure is non-blocking.
7. **Write `contract.md`** — the five contract sections plus the restated objective.
8. **Write `state.md`** using the structure below.
9. Report the slug, change class, gate profile, level, risk tolerance, pre-gate research status.

## state.md structure

```markdown
# AI-SDLC Run State

- Slug: <slug>
- Intent: <one line>
- Change class: <class>
- Autonomy level: <1-5>
- Risk tolerance: <2-10>   (pause when a gate's risk score >= this)
- Risk formula: Impact + Likelihood (range 2-10)   # authoritative; every gate uses this
- Latest risk score: <n/a until gate 3>
- Status: in-progress
- Created: <date>

## Pre-gate artifacts

- Research: <path to research-report.md or reason skipped/failed>
- Research questions: <path to research-questions.md or "n/a">

## Gate ledger

| # | Gate | Required | Status | Risk score | Artifact |
|---|------|----------|--------|------------|----------|
| 1 | Requirements | yes/no | pending | - | - |
| 2 | Design | yes/no | pending | - | - |
| 3 | Risk | yes/no | pending | - | - |
| 4 | Implementation | yes/no | pending | - | - |
| 5 | Test | yes/no | pending | - | - |
| 6 | Security | yes/no | pending | - | - |
| 7 | Release | yes/no | pending | - | - |
| 8 | Production Validation | yes/no | pending | - | - |
| 9 | Learning | yes/no | pending | - | - |

## Escalation log

_(none yet)_
```

Set `Required` to `yes` for gates in the profile, `no` otherwise. A gate marked `no`
stays `pending` and is skipped — but "light" gates (e.g. `R(light)`) are `yes` and run
proportionately.

**Risk formula is frozen at intake.** Every gate that reassesses risk MUST read the
formula from `state.md` rather than restating it. If a gate disagrees with the
recorded formula, escalate before computing — never silently switch math
(addition vs. multiplication, etc.). This prevents preview-score drift
between gates.

## Output Format

1. Run slug and directory path.
2. Restated objective.
3. Change class, effective autonomy level, risk tolerance, resolved gate profile.
4. Any assumptions made for inferred contract fields.
