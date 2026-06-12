---
name: sdlc:2-design
description: Run the AI-SDLC Design gate — produce a technically sound Design Note with options, tradeoffs, and a recommended design. Trigger when the user asks to design a solution, compare approaches, write a design doc or ADR, or plan architecture for a change.
when_to_use: Use as quality gate 2 of the AI-SDLC lifecycle, after Requirements and before Risk. Produces the Design Note covering architecture, API, data model, error handling, security, and observability. Do not use to write the step-by-step build plan — that is the Implementation gate.
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

# AI-SDLC Gate 2 — Design

**Artifact:** Design Note → `02-design-note.md`
**Gate question:** Is the solution technically sound?

## Inputs

The run slug in `$ARGUMENTS`, else the most recent in-progress run. Read `contract.md`,
`state.md`, `01-requirements-brief.md`, and context packs 03 (system context) and
04 (domain rules). For each pack, prefer `.claude/sdlc/<NN>-<name>.md` (project
override) if the file exists; otherwise fall back to
`.claude/skills/sdlc-knowledge/reference/context-packs/<NN>-<name>.md`.

## Workflow

1. **Map the current state.** For a non-trivial codebase, spawn an `Explore` subagent
   to find the affected components, schemas, APIs, and call sites — keep this skill's
   context focused on the conclusions.
2. **Gap analysis** — the difference between current and desired behavior.
3. **Generate at least two solution options.** For each: pros, cons.
4. **Tradeoff analysis** — compare options across complexity, risk, cost,
   maintainability, security, performance, and rollout safety.
5. **Recommend a design** that stays within the contract's Authority. If the only sound
   design needs a public API or data-model change, that is a hard-stop trigger.
6. **Detail the design:** architecture / components, API contract, data model / schema
   changes, state model & transitions, error handling, security considerations,
   observability, backward compatibility.
7. Self-check the gate checklist. Reassess risk using `state.md`'s frozen Risk
   formula — raise Impact for new surface area, raise Likelihood for unfamiliar
   areas. Do not silently switch math from what intake recorded. If a design
   decision is significant, also record a Decision Record
   (`.claude/skills/sdlc-knowledge/reference/templates/decision-record.md`).
8. Write `02-design-note.md`, update the `state.md` ledger row, emit the result.

## Gate checklist

- [ ] Current state and gap analyzed
- [ ] Options generated with a tradeoff analysis
- [ ] Recommended design within authority
- [ ] Architecture, API, data model, state, error handling defined
- [ ] Backward compatibility considered

## Artifact structure

`# Design Note` with: Current state; Gap analysis; Solution options (≥2, each pros/cons);
Tradeoff analysis; Recommended design; Design detail (architecture, API contract, data
model/schema, state model, error handling, security, observability); Risks (pointer to
the Risk Register).

## Patterns to apply when they fit

- **Cross-path merger → property test.** When the recommended design introduces a
  function that combines decisions/results from two or more independent paths
  (e.g. a `mergeResults(tsDecision, mdResult)` between a TypeScript engine and a
  Markdown middleware), the Design Note MUST call out a **preservation invariant**
  (which inputs MUST be unchanged in the output) and the Risk gate SHOULD then
  require a property-test suite (e.g. `fast-check`) asserting that invariant
  across hundreds of generated inputs. This is the highest-leverage form of
  R1-class safety mitigation we have.
- **Schema additions go through defaults-merge.** When the design adds a typed
  field to a persisted shape, prefer extending the existing defaults-merge over
  writing a migration script. Document the backward-compatibility test that
  proves legacy files load cleanly.
- **Sidecar files for axis-dimensioned counters.** When a schema decision would
  force a typed field to be axis-dimensioned (per-file, per-command, per-key)
  and the typed-field count exceeds 1, consider an NDJSON sidecar at
  `.ctrl-loop/state/<feature>.jsonl` instead. Keeps the typed schema flat and
  the I/O surface bounded.

## Escalation

Escalate if the design requires a public API change, a data-model / schema change, new
dependencies, or auth/authz changes. See
[../sdlc-deliver/control-model.md](../sdlc-deliver/control-model.md).

## Output Format — append this block

```
### sdlc-result
gate: 2-design
status: passed | escalate
risk-score: <2-10 or n/a>
impact: <1-5>  likelihood: <1-5>
hard-stop-triggers: [<none | public-api-change | schema-migration | new-dependency | auth-change>]
artifact: .sdlc/runs/<slug>/02-design-note.md
note: <one line>
```
