# ADR-021: React

## Status

Accepted

## Context and Problem Statement

The team needs a UI rendering library for client-side and server-rendered user interfaces. React's rendering model depends on invariants — pure components, hooks called unconditionally at the top level, side effects isolated from render, stable keys across reorderings — that make `Component(props) => UI` a function rather than a side-effect machine. Violations do not fail loudly; they produce stale closures, double-mounted effects, lost input focus, infinite update loops, and accessibility gaps that only surface under concurrent rendering or specific state transitions. We need to pin these invariants plus an accessibility baseline so the framework's guarantees stay intact.

## Decision Drivers

- Component model correctness: pure function components with hook discipline prevent subtle rendering bugs under concurrent React
- Accessibility: semantic HTML and aria roles ensure the UI is usable by assistive technology
- Tooling alignment: `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` enforce the rules automatically
- TypeScript integration: typed props (`type` or `interface`, never `any`) integrate with the TypeScript decision ([ADR-004](004-typescript.md))

## Considered Options

- React with function components, strict hook discipline, accessibility rules enforced via ESLint
- Vue.js (different component model)
- Svelte (compiler-based, smaller ecosystem)
- Solid.js (reactive primitives, less ecosystem maturity at decision time)

## Decision Outcome

We will use React with function components exclusively — no new class components. Hooks are called only at the top level of React functions and only from React function components or custom hooks. Components are pure: no prop/state mutations during render. Side effects, DOM interactions, and subscriptions are isolated to `useEffect` with cleanup functions. Dependency arrays for `useEffect`, `useMemo`, and `useCallback` are exhaustive (`react-hooks/exhaustive-deps` is an error). Derived values are computed during render, not stored in state. Lists use stable, unique keys (no array index as key for reorderable lists). Forms use controlled inputs. `<StrictMode>` is enabled in development. Props are typed with TypeScript `type` or `interface`. Semantic HTML elements are used for their intended roles. `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y` enforce rules as CI build failures.

## Consequences

- Positive: function components + strict hook discipline prevent the class of subtle concurrent-rendering bugs
- Positive: ESLint plugin enforcement makes rule violations blocking rather than advisory
- Positive: semantic HTML and aria rules produce accessible interfaces without per-component audits
- Negative: hook rules can be confusing for developers accustomed to class components or Vue's Options API
- Negative: `react-hooks/exhaustive-deps` occasionally requires restructuring effects that would be simpler with manual deps
- Neutral: class components in new code and `any`-typed props are forbidden
