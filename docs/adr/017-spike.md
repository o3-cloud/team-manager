# ADR-017: Spikes (Time-Boxed Investigation)

## Status

Accepted

## Context and Problem Statement

The team encounters technical unknowns that block estimation or design — "will this library handle our throughput?", "what does the real API response look like?", "is this refactor reachable in one sprint?" — and needs a disciplined process for resolving them. Without that discipline, "spike" becomes the label teams attach to any speculative work; time slips silently into days; the prototype gets merged because "it already works"; and the question that motivated the spike is never explicitly answered. We need a convention that keeps spikes time-boxed, purpose-driven, and disposable, with written outcomes that feed ADRs and BDRs.

## Decision Drivers

- Uncertainty management: spikes exist solely to retire a specific unknown, not to deliver features
- Budget accountability: explicit time-boxes prevent unlimited scope creep under the "spike" label
- Knowledge capture: outcomes must be written and must feed ADRs ([ADR-016](016-madr.md)) and BDRs ([ADR-011](011-bdr.md)) so learning is not lost in ticket comments
- Code discipline: spike code is disposable; production re-implementation follows TDD ([ADR-018](018-tdd.md)) and code review

## Considered Options

- Time-boxed spikes with a written charter, disposable code on named branches, and a written outcome document
- Open-ended exploration stories with no time limit
- Prototype PRs that are promoted to production if "they work"
- No formal spike process — treat exploration as part of normal feature development

## Decision Outcome

We will use spikes as a formal work type tracked in the issue tracker with a `spike` label. Every spike opens with a written charter: question to answer (one sentence), time-box (fixed person-hours or person-days), success criteria, and named owner. The time-box is held — no silent extensions. Spike code lives on a `spike/<short-question>` branch and is never merged to trunk. Every spike ends with a written outcome document recording the answer, evidence, resulting decision (proceed/abandon/follow-up), and new unknowns. Architectural decisions the spike produced are captured as ADRs. Behavioral contracts the spike clarified are captured as BDRs. Any surviving code is re-implemented from scratch in a properly engineered PR following TDD and code-review rules.

## Consequences

- Positive: explicit time-boxes and written outcomes prevent unlimited exploration and knowledge loss
- Positive: disposable-code rule prevents prototypes from silently becoming production code
- Negative: writing a charter and outcome document adds overhead compared to informal exploration
- Negative: re-implementing rather than promoting spike code is slower but produces well-designed, tested code
- Neutral: spike code merges to trunk, and open-ended exploration without a charter, are forbidden
