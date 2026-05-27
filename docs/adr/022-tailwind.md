# ADR-022: Tailwind CSS

## Status

Accepted

## Context and Problem Statement

The team needs a CSS styling approach for React ([ADR-021](021-react.md)) and HTML interfaces. Without shared conventions on Tailwind usage, teams abuse `@apply` to recreate semantic CSS, construct class names dynamically so the scanner misses them and builds silently exclude the styles, and override the default design-system scale instead of extending it — all of which undermine the utility-first model and produce bloated or broken builds. We need conventions that keep Tailwind builds minimal, design systems coherent, and class names statically analyzable.

## Decision Drivers

- Utility-first discipline: direct class application in markup is faster to iterate and avoids semantic CSS abstraction layers
- Build correctness: static class strings are required for the Tailwind scanner to detect them; dynamic concatenation produces missing styles
- Design system coherence: extending rather than replacing the default scale preserves semantic relationships
- Tree-shaking: Tailwind v4 with explicit `@source inline()` ensures only used classes ship

## Considered Options

- Tailwind CSS with utility-first discipline, `@theme` extension, and static class strings
- CSS Modules (scoped, but requires per-file CSS management)
- styled-components or Emotion (CSS-in-JS, adds runtime overhead)
- Plain CSS with BEM methodology (no utility generation, no design system enforcement)

## Decision Outcome

We will use Tailwind CSS as the primary styling framework. Utility classes are written as complete, static strings in markup — never constructed by concatenating string fragments. Design tokens are added via `@theme` (v4) or `theme.extend` (v3); default scales are never replaced. Default element styles go in `@layer base`, reusable component abstractions in `@layer components`, custom utilities in `@utility` (v4). Arbitrary value syntax is used for genuine one-off exceptions only. `@apply` is reserved for styling HTML that cannot carry utility classes directly. CSS variables (`var(--color-red-500)`) replace the `theme()` function in v4. Dynamically referenced classes are safelisted via `@source inline()` (v4) or `safelist` (v3).

## Consequences

- Positive: static class strings make builds deterministic and tree-shakeable
- Positive: `@theme` extension ensures new tokens coexist with default scale relationships
- Positive: no separate CSS files per component reduces cognitive overhead
- Negative: long class strings in markup can reduce HTML readability
- Negative: dynamic class construction is forbidden, requiring workarounds (predefining all variants statically)
- Neutral: `@apply` for component abstractions and overriding default theme scales are forbidden
