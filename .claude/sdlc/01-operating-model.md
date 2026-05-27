# Context Pack 01 — AI-SDLC Operating Model

> Layer 1 (Universal). Standing delivery process for all team-manager changes.

## Default delivery process

For every software change, follow this process. Scale depth to the change class.

1. Restate the objective.
2. Identify users, stakeholders, and success criteria.
3. Extract functional requirements.
4. Extract non-functional requirements.
5. Identify assumptions, unknowns, risks, dependencies, and edge cases.
6. Propose a technical design; consider alternatives and tradeoffs.
7. Create an implementation plan of small, reviewable steps.
8. Implement minimally and consistently with existing patterns.
9. Produce or update tests.
10. Perform security, privacy, and operational review.
11. Prepare release, rollback, and validation plan.
12. Critique the solution against the quality criteria.
13. Revise once before finalizing.

## Quality criteria

Correct · Secure · Maintainable · Testable · Observable · Minimal scope ·
Compatible with existing architecture · Safe to deploy · Easy to review.

## Failure modes to avoid

- Jumping directly to code.
- Making hidden assumptions or hidden product decisions inside code.
- Overengineering; unnecessary abstractions.
- Ignoring edge cases or deployment concerns.
- Producing code without tests.
- Large unrelated refactors.
- Silent failures, swallowed exceptions, hardcoded values, hidden side effects.

## Definition of Done

See `05-definition-of-done.md`.
