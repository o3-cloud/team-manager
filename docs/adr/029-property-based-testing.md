# ADR-029: Property-Based Testing

## Status

Accepted

## Context and Problem Statement

Example-based tests verify specific `(input, output)` pairs that a developer thought of; everything else stays untested. Edge cases that developers fail to imagine — NaN, empty collections, integer min/max, Unicode boundary code points, leap-day timestamps — silently slip through the example suite. Property-based testing inverts the model: the developer specifies an invariant that must hold across the input space, and the framework searches for a counterexample by generating inputs and shrinking any failure to a minimal reproducer. Without a disciplined application of this technique, "property tests" degrade into `for _ in range(100)` loops with single assertions that mostly pass by luck.

## Decision Drivers

- Edge-case discovery: generators explore the input space including values developers would not manually think to test
- Shrinking: the framework automatically reduces failures to minimal reproducible examples
- Round-trip verification: codecs and serializers are natural targets for `decode(encode(x)) == x` properties
- Regression capture: discovered counterexamples are persisted as explicit regression cases

## Considered Options

- Property-based testing with fast-check (JS/TS) as a complement to example-based unit tests
- Example-based unit tests only with broad parameterization
- Fuzz testing (coverage-guided, more complex setup, better for security testing)
- No explicit property testing discipline

## Decision Outcome

We will use property-based testing with the language-appropriate framework (fast-check for JS/TS) for pure functions, codecs, parsers, math, and data-structure operations. Each property is expressed as a predicate over the input space, not as an assertion about a specific input. Property tests identify the pattern (round-trip, oracle, invariant, idempotence, metamorphic) in their name or docstring. Custom generators are defined for constrained input domains. Shrinking is never disabled. A deterministic seed (or framework-managed example database) ensures failures reproduce on the next run. Counterexamples are persisted as explicit regression cases (`@example` in the framework's notation). `max_examples` is set explicitly per property. Properties targeting I/O-heavy code are addressed via example-based or integration tests instead.

## Consequences

- Positive: generators discover edge cases that example-based tests miss, especially at type boundaries
- Positive: shrinking makes failures actionable by providing the smallest possible counterexample
- Positive: round-trip properties provide high-confidence codec correctness across the full input domain
- Negative: writing useful generators and properties requires understanding the technique; there is a learning curve
- Negative: property tests run more iterations and are slower than single example-based assertions
- Neutral: example-based tests for I/O-heavy code and custom random-number sources inside properties are forbidden
