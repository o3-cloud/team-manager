---
name: sdlc:7-release
description: Run the AI-SDLC Release gate — produce a Release & Rollback Plan and the PR package so the change can ship safely. Trigger when the user asks to plan a release, write a rollout or rollback plan, plan a migration sequence, or prepare a change for deployment.
when_to_use: Use as quality gate 7 of the AI-SDLC lifecycle, after Security and before Production Validation. Produces the Release & Rollback Plan. It plans deployment; it does not deploy — production deployment is a blocked action requiring explicit human approval.
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

# AI-SDLC Gate 7 — Release

**Artifact:** Release & Rollback Plan → `07-release-plan.md`
**Gate question:** Can we ship safely?

## Inputs

The run slug in `$ARGUMENTS`, else the most recent in-progress run. Read `contract.md`,
`state.md`, and artifacts `01`–`06`. Load context packs 08 (operational readiness) and 09 (release governance): for each,
prefer `.claude/sdlc/<NN>-<name>.md` (project override) if the file exists; otherwise
fall back to `.claude/skills/sdlc-knowledge/reference/context-packs/<NN>-<name>.md`.

## Workflow

0. **Pre-release quality re-run.** Before drafting the rollout plan, re-run the
   project's quality gates and capture their status in the release artifact:
   `typecheck`, `test`, `lint`, `audit`, `build`. **Scope lint to the published
   surface** — derive the scope from `package.json` (`files`, `main`, or
   workspace roots) rather than running repo-wide, so unrelated example apps or
   docs trees do not mask real regressions. If repo-wide lint surfaces
   pre-existing failures *outside* the published surface, report them as a
   separate count ("pre-existing; out of release scope") rather than blocking
   the gate.

1. **Rollout strategy** — deployment sequence, environments, phased rollout (env,
   tenant, %, geography).
2. **Feature flags** — flag names, on/off behavior, ramp plan, cleanup owner.
3. **Migration sequencing** — expand → deploy → contract; the order of schema, data,
   infra, and API changes.
4. **Pre-deployment checks** — the explicit checklist to clear before deploying.
5. **Deployment steps** — the ordered runbook.
6. **Rollback plan** — defined *before* deployment: how to safely reverse or disable,
   and what must NOT be done as an emergency rollback (e.g. do not drop columns).
7. **Post-release validation** and **monitoring during rollout** — metrics, logs,
   alerts to watch and the thresholds that trigger an abort.
8. **Communication** — who needs to know before, during, and after.
9. Write `07-release-plan.md`. Update the `state.md` ledger row.
10. **Stop for approval.** Production deployment is a blocked action — do not deploy.
    Report that the plan is ready and human approval + deployment are required before
    `/sdlc:8-validation`.

## Gate checklist

- [ ] Rollout strategy, feature flags, migration sequencing defined
- [ ] Rollback plan defined *before* deployment
- [ ] Pre-deployment checks listed
- [ ] Observability in place to monitor the rollout
- [ ] Communication plan defined

## Artifact structure

`# Release & Rollback Plan` with: Rollout strategy; Feature flags; Migration
sequencing; Pre-deployment checks; Deployment steps; Rollback plan; Post-release
validation; Monitoring during rollout; Communication.

## Escalation

Production deployment **always** requires explicit human approval, at every autonomy
level. This gate ends in a pause by design. See
[../sdlc-deliver/control-model.md](../sdlc-deliver/control-model.md).

## Output Format — append this block

```
### sdlc-result
gate: 7-release
status: passed-awaiting-deploy-approval
risk-score: <2-10>
blocked-action: production-deployment (requires human approval)
artifact: .sdlc/runs/<slug>/07-release-plan.md
note: <one line>
```
