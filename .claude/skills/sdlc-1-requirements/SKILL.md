---
name: sdlc:1-requirements
description: Run the AI-SDLC Requirements gate — turn intent into an explicit, testable Requirements Brief. Trigger when the user asks to write requirements, clarify a feature, extract functional and non-functional requirements, or define acceptance criteria for a change.
when_to_use: Use as quality gate 1 of the AI-SDLC lifecycle, after intake and before design. Produces the Requirements Brief and surfaces ambiguity before any code is written. Do not use to propose a technical solution — that is the Design gate.
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
---

# AI-SDLC Gate 1 — Requirements

**Artifact:** Requirements Brief → `01-requirements-brief.md`
**Gate question:** Are expectations explicit?

## Inputs

The run slug in `$ARGUMENTS`, else the most recent in-progress run under `.sdlc/runs/`.
Read `contract.md`, `state.md`, and load the relevant context packs (`.claude/skills/sdlc-knowledge/reference/context-packs/`
01, 02, 03, 04, 05). Do not ask the human for anything a context pack already answers.

## Workflow

1. Restate the objective in precise product and engineering terms.
2. Define **scope** and **out-of-scope** explicitly.
3. Extract **functional requirements** (what the system must do).
4. Extract **non-functional requirements** — performance, reliability, scalability,
   accessibility, privacy, security, compliance.
5. Normalize the contract's Gherkin into testable **acceptance criteria**; build the
   traceability table (scenario → requirements covered).
6. Identify stakeholders, user flows, edge cases, dependencies, assumptions, and open
   questions.
7. Self-check the gate checklist below.
8. **Reassess risk:** if requirements are ambiguous or open questions block quality,
   raise Likelihood and flag the `ambiguous-requirements` hard-stop trigger. Use
   `state.md`'s frozen Risk formula — do not silently switch math. Mark any
   gate-1 risk score as `<n>` **(preview, formula: <as recorded>)** so the
   authoritative Risk gate can detect any inconsistency.
9. Write `01-requirements-brief.md`, update the `state.md` ledger row, emit the result.

## Gate checklist

- [ ] Objective restated in precise terms
- [ ] Scope and out-of-scope defined
- [ ] Functional + non-functional requirements captured
- [ ] Acceptance criteria normalized and testable
- [ ] Assumptions and open questions surfaced
- [ ] Edge cases and dependencies identified

## Artifact structure

`# Requirements Brief` with: a metadata table (Change, Author/agent, Date, Autonomy
level); Restated objective; Scope (in / out); Stakeholders; Business value & success
metrics; Functional requirements; Non-functional requirements; User flows; Edge cases;
Dependencies; Assumptions; Open questions; Acceptance criteria traceability table.

## Escalation

Escalate (run `/sdlc:escalate`) if requirements are ambiguous, intent is uncertain, or
unresolved open questions would change the design. See
[../sdlc-deliver/control-model.md](../sdlc-deliver/control-model.md).

## Output Format — append this block

```
### sdlc-result
gate: 1-requirements
status: passed | escalate
risk-score: <2-10 or n/a>
impact: <1-5>  likelihood: <1-5>
hard-stop-triggers: [<none | ambiguous-requirements | ...>]
artifact: .sdlc/runs/<slug>/01-requirements-brief.md
note: <one line>
```
