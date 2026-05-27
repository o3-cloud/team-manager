---
name: sdlc:4-implementation
description: Run the AI-SDLC Implementation gate — produce a sequenced Implementation Plan and then build the change. Trigger when the user asks to plan the build, break work into steps, or implement a change that has passed requirements, design, and risk gates.
when_to_use: Use as quality gate 4 of the AI-SDLC lifecycle, after Risk and before Test. Produces the Implementation Plan and then executes it as small, reviewable steps with tests written alongside. Do not use before the design and risk gates have passed.
argument-hint: "[run-slug]"
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Agent
---

# AI-SDLC Gate 4 — Implementation

**Artifact:** Implementation Plan → `04-implementation-plan.md`, then the code change.
**Gate question:** Is the work reviewable and sequenced?

## Inputs

The run slug in `$ARGUMENTS`, else the most recent in-progress run. Read `contract.md`,
`state.md`, and artifacts `01`–`03`. Load engineering-standards context
(`.claude/skills/sdlc-knowledge/reference/context-packs/02`, and the matching `.claude/skills/sdlc-knowledge/reference/context-packs/starters/`).

## Workflow

1. **Produce the Implementation Plan** — small, sequenced, reviewable steps grouped
   into 2–5 **slices** (see *Slice discipline* below). For each step: purpose,
   files/modules, behavior change, tests, risk, validation method. Mark any step
   that requires a blocked or out-of-scope action as an **escalation point**.
2. Self-check the gate checklist. If a step needs a blocked action (production deploy,
   secrets, dropping DB objects, disabling security controls, audit-log changes) or
   exceeds scope — **stop and run `/sdlc:escalate`** before writing any code.
3. **Pre-implementation review** — at autonomy L1–L2 the plan itself is an approval
   point; if running standalone, present it and wait.
4. **Execute the plan, step by step:**
   - Smallest safe change. Match existing patterns. **No unrelated refactors.**
   - Write or update tests alongside each step; trace each test to an acceptance
     criterion or a risk. Use TDD where the logic is well-specified.
   - Run static checks (lint, format, type) after each step.
5. **Reassess risk** — raise Likelihood if implementation surfaced unknowns; raise
   Impact if the blast radius grew. Update `state.md`'s Latest risk score.
6. Write `04-implementation-plan.md` (final, with steps marked done), update the
   `state.md` ledger row, emit the result.

## Gate checklist

- [ ] Work broken into 2–5 slices, each with a runnable hard-gate exit criterion
- [ ] Each step maps to a slice, a requirement, and to tests
- [ ] No unrelated refactors
- [ ] Pre-implementation review passed; approval obtained if required
- [ ] Static checks pass on the changed code after each slice

## Slice discipline

Group steps into **2–5 slices**. Each slice has:

- A theme (one phrase: e.g. "types + schema + session migration").
- A **hard gate** that must pass before the next slice starts (typecheck clean,
  a named test file green, a property suite green, `bun audit` clean — pick the
  smallest concrete signal that exercises the slice's contract).
- An exit criterion expressed as a runnable check, not a count snapshot.

Recommended slice ordering when a change adds typed fields or persisted state:

| Slice | Theme | Why first |
|---|---|---|
| 1 | Types + schema + backward-compat tests | Defaults-merge / migration regressions are cheapest to catch before any consumer code references the field. |
| 2 | Core load-bearing logic + safety invariants | If a property test (e.g. fast-check) is the load-bearing mitigation for a Risk-gate residual, it lands HERE — before any preset or downstream consumer ships. |
| 3 | Consumers / presets / wiring | These can only land after their invariant tests pass. |
| 4 | Surface (CLI, observability, public exports) | Last because they cross the most module boundaries. |

If the plan does not group steps into slices, write it that way before executing.
"Small sequenced steps" without slice gates is how mid-stream regressions slip
through.

## Artifact structure

`# Implementation Plan` with: a **slice table** (Slice, Theme, Hard gate / exit
criterion); a **step table** (Step, Slice, Purpose, Files/modules, Behavior change,
Tests, Risk, Validation); Escalation points; Out of scope.

## Escalation

Escalate if a step requires a blocked action, a new dependency, a schema migration, a
public API change, an auth/authz change, or anything beyond approved scope. See
[../sdlc-deliver/control-model.md](../sdlc-deliver/control-model.md).

## Output Format — append this block

```
### sdlc-result
gate: 4-implementation
status: passed | escalate
risk-score: <2-10>
impact: <1-5>  likelihood: <1-5>
hard-stop-triggers: [<none | ...>]
files-changed: [<paths>]
artifact: .sdlc/runs/<slug>/04-implementation-plan.md
note: <one line>
```
