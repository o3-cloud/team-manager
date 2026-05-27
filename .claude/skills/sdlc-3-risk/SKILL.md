---
name: sdlc:3-risk
description: Run the AI-SDLC Risk gate — build a Risk Register, compute the change's risk score, and decide whether to escalate. Trigger when the user asks to assess risk, score a change, run the escalation check, or decide if a change is safe to proceed.
when_to_use: Use as quality gate 3 of the AI-SDLC lifecycle, after Design and before Implementation. This is where the authoritative risk score is set and compared to the run's risk tolerance. Do not use to plan the build — that is the Implementation gate.
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

# AI-SDLC Gate 3 — Risk

**Artifact:** Risk Register → `03-risk-register.md`
**Gate question:** Is it safe to proceed?

This gate sets the **authoritative risk score** for the run and is the primary
enforcement point for the user's risk tolerance. Read
[../sdlc-deliver/control-model.md](../sdlc-deliver/control-model.md) in full.

## Inputs

The run slug in `$ARGUMENTS`, else the most recent in-progress run. Read `contract.md`,
`state.md`, `01-requirements-brief.md`, `02-design-note.md`.

## Workflow

1. **Enumerate risks** — for each: description, severity, likelihood, mitigation, owner.
   Cover technical, product, delivery, security, and operational risks.
2. **Score the change overall** using the **frozen formula from `state.md`**
   (`Risk formula:` line — set at intake, never re-derived per gate):
   - **Impact (1–5)** — how bad if it goes wrong (cosmetic → severe outage/breach).
   - **Likelihood (1–5)** — how likely something goes wrong (well-understood+tested →
     ambiguous/untested).
   - Apply the formula in `state.md` (default: `Impact + Likelihood`, range 2–10).
     If a previous gate previewed risk with a different formula, flag the drift in
     §"Risk reassessment" rather than silently switching math.
3. **Run the hard-stop escalation check** — mark every trigger that applies:
   auth/authz, payments, PII/sensitive data, schema/data migration, public API break,
   new dependency, production deployment, failed tests (unclear cause), security scan
   failure, ambiguous requirements / >20% uncertainty, exceeds approved scope.
4. **For each open question that changes a schema, data model, or persisted on-disk
   surface, add a "BDR / conformance impact" line.** Enumerate the BDRs (or spec
   sections) that reference the field/shape being changed and state whether the
   proposed default preserves, weakens, or breaks each one. Closing a schema question
   without this line is a defect — surface the conformance gap *before* an
   escalation is needed to reconcile it.
5. **Decide:** escalation is **required** if any hard-stop trigger fired **or** the risk
   score ≥ the run's risk tolerance (from `state.md`).
6. Define a mitigation for every High/Med risk.
7. Write `03-risk-register.md`. Update `state.md`: set **Latest risk score** and the
   gate-3 ledger row. If escalation is required, set status `escalate` and run
   `/sdlc:escalate`.

## Gate checklist

- [ ] Risks classified by impact, blast radius, complexity, uncertainty
- [ ] Mitigations defined for every High/Med risk
- [ ] Risk score computed using `state.md`'s frozen Risk formula
- [ ] Open questions that change schema/data-model/on-disk surface include a "BDR / conformance impact" line
- [ ] Hard-stop escalation check completed
- [ ] Risk score compared to the run's risk tolerance

## Artifact structure

`# Risk Register` with: a risk table (#, Risk, Severity, Likelihood, Mitigation, Owner);
Risk classification (impact, blast radius, complexity, uncertainty); the computed
**Risk score** with its Impact and Likelihood breakdown; the hard-stop escalation
checklist; and `Escalation required: Yes/No — reason`.

## Output Format — append this block

```
### sdlc-result
gate: 3-risk
status: passed | escalate
risk-score: <2-10>
impact: <1-5>  likelihood: <1-5>
risk-tolerance: <2-10>
hard-stop-triggers: [<none | ...>]
escalate-reason: <none | score>=tolerance | trigger:<name>>
artifact: .sdlc/runs/<slug>/03-risk-register.md
note: <one line>
```
