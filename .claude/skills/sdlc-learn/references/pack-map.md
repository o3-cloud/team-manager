# Context Pack Map

Maps learning sources in a PIR to the correct `.claude/sdlc/` file.

## Pack files

| File | Covers | Add learnings when… |
|------|--------|---------------------|
| `02-engineering-standards.md` | Language/framework patterns, DTO patterns, NestJS/React specifics, test framework conventions | A defect or lesson reveals a coding pattern, framework gotcha, or tool-level anti-pattern |
| `03-system-context.md` | Architecture, known constraints, open tech debt | An open TD-x item describes an ongoing system constraint; update `## Known technical debt` |
| `04-domain-rules.md` | Business invariants, domain edge cases | A defect exposed a domain rule that wasn't documented or a domain edge case that bit the delivery |
| `06-test-strategy.md` | Test patterns, Playwright patterns, test data, traceability | A defect was caught too late (wrong gate); add the test pattern that would have caught it earlier |
| `07-security-privacy.md` | Security patterns, auth patterns, input handling, credential handling | A security finding (any severity) reveals a pattern — auth, input validation, credential management, HTTP status semantics, injection surface |
| `08-operational-readiness.md` | Deployment patterns, k8s gotchas, Skaffold, health probes, infra config | A deployment defect or operational issue reveals an infra/config pattern |
| `09-release-governance.md` | Release patterns, migration patterns, rollback | A release-phase issue reveals a governance or migration pattern |

## PIR section → pack mapping

| PIR section | Typical target pack(s) |
|-------------|------------------------|
| `Learning-Loop Framework Updates § Context Pack 07` | `07-security-privacy.md` |
| `Learning-Loop Framework Updates § Context Pack 08` | `08-operational-readiness.md` |
| `Learning-Loop Framework Updates § Context Pack 02` | `02-engineering-standards.md` |
| `Learning-Loop Framework Updates § Context Pack 06` | `06-test-strategy.md` |
| `Defects Discovered` — deployment root cause | `08-operational-readiness.md` |
| `Defects Discovered` — auth/security root cause | `07-security-privacy.md` |
| `Defects Discovered` — test-coverage gap | `06-test-strategy.md` |
| `Defects Discovered` — domain rule violation | `04-domain-rules.md` |
| `Technical Debt` — open system constraint | `03-system-context.md` (tech debt bullets) |
| `Technical Debt` — coding pattern shortcut | `02-engineering-standards.md` |

## Rules

- A single defect may produce patterns in multiple packs (e.g., D-1 → operational pattern in `08` + test gap in `06`).
- Patterns from `What Did Not Go Well` go into the same target pack as the corresponding defect, if one exists.
- Do not add a pattern to `01-operating-model.md` or `05-definition-of-done.md` unless the PIR explicitly proposes a DoD or process change.
- Packs `01` and `05` are rarely updated — process-level changes are intentional and should be explicit.
