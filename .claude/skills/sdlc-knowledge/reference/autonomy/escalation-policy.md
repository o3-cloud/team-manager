# Risk & Escalation Policy

> Layer 2 (Organization). Reusable. Lets the human give less input while keeping
> control: the agent proceeds autonomously *only while the work stays inside the
> approved operating conditions.*

## Mandatory escalation triggers

Stop and request human approval before proceeding if the change involves:

- Authentication or authorization logic
- Payment logic
- PII or other sensitive data
- Database schema or data migrations
- Public API breaking changes
- New third-party dependencies
- Production deployment
- Failed tests with an unclear cause
- Security scan failures
- Ambiguous requirements
- More than ~20% uncertainty in intended behavior
- Any change exceeding the approved scope or autonomy level

## Escalation decision tree

```
Touches auth / authz? .................. yes → ESCALATE
Touches sensitive data / PII? .......... yes → ESCALATE
Requires a database migration? ......... yes → ESCALATE
Changes public API behavior? ........... yes → ESCALATE
New third-party dependency? ............ yes → ESCALATE
Validation failed, cause unclear? ...... yes → ESCALATE
Exceeds approved scope / authority? .... yes → ESCALATE
Otherwise ............................. continue within authority
```

## When escalating

Produce an **Escalation Report** (`../templates/escalation-report.md`): the trigger,
work completed so far, the specific decision(s) requested, a recommended option, and
the boundaries respected. Then stop. Human approval moves the agent to the *next
authorized phase only* — it is not blanket permission to proceed unsupervised.

## Allowed autonomous actions (within authority)

Interpreting tickets, inspecting code, proposing options, implementing in-scope
changes, generating and running tests, updating documentation, preparing PRs,
summarizing risk and validation results.

## Blocked actions (always require approval, regardless of level)

Production deployment, secrets/credentials handling, dropping database columns or
tables, disabling security controls, modifying audit logs.

## Audit requirements

Every escalation, approval, override, and autonomous completion should be recorded
(decision record + evidence trail) so higher autonomy remains auditable. Higher
autonomy requires *stronger* evidence, not less.
