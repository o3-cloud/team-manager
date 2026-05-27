# ADR-023: TypeDoc

## Status

Accepted

## Context and Problem Statement

Published TypeScript packages need navigable API reference documentation. Left to defaults, TypeDoc silently skips undocumented symbols, accepts broken `{@link}` references, emits docs that drift from the published package version, and lets internal helpers leak into the public reference because nobody tagged them `@internal`. Without API-stability markers (`@public`/`@beta`/`@alpha`/`@internal`), every export is treated as load-bearing API, so refactoring an internal helper becomes a "breaking change" by default. We need TypeDoc configured as a CI gate so doc-comment warnings block merges and the generated reference is a reliable contract.

## Decision Drivers

- Accuracy: `validation.invalidLink`, `validation.notExported`, and `validation.notDocumented` flags make TypeDoc a CI gate rather than a documentation generator
- API stability signaling: `@public`/`@beta`/`@alpha`/`@internal` markers tell consumers what they can rely on
- Version-pinned docs: published HTML is tied to a released package version so consumers always read docs for the version they installed
- TypeScript alignment: TSDoc tags are used, not JSDoc-only tags whose semantics differ in TypeScript ([ADR-004](004-typescript.md))

## Considered Options

- TypeDoc with validation flags as a CI gate, TSDoc tags, API-stability markers, and version-pinned publishing
- JSDoc with documentation.js (less TypeScript-aware)
- API Extractor + API Documenter (heavier, Microsoft-focused toolchain)
- No generated API documentation

## Decision Outcome

We will use TypeDoc as the canonical API reference generator for all published TypeScript packages. The TypeDoc version is pinned exactly. Configuration lives in `typedoc.json`. Generated output goes to a `.gitignore`d build directory. All exported symbols from a package's main entry point carry an API-stability tag. Every exported function/method has `@param`, `@returns`, and at least one `@example` block. `validation.invalidLink`, `validation.notExported`, and `validation.notDocumented` are enabled. `treatValidationWarningsAsErrors` is set to `true`. TypeDoc runs in CI on every PR (`typedoc --emit none`) as a blocking check. TSDoc syntax is linted with `eslint-plugin-tsdoc`. Docs are published to a stable URL including the package version on every release tag.

## Consequences

- Positive: validation flags make broken doc-comment references a CI failure, not a runtime surprise
- Positive: `@internal` markers protect refactoring freedom; consumers know what is load-bearing API
- Positive: version-pinned docs URLs prevent consumers from reading docs for the wrong version
- Negative: documenting all public symbols with `@param`, `@returns`, and `@example` adds authoring overhead
- Negative: TypeDoc validation failures can block PR merges for documentation-only issues
- Neutral: hand-maintained parallel API reference docs and JSDoc-only tags are forbidden
