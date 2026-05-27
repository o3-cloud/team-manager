# ADR-004: TypeScript

## Status

Accepted

## Context and Problem Statement

The team needs a primary programming language for server-side and client-side JavaScript work. TypeScript's value comes entirely from its type system; loosening the compiler or escaping into `any` silently converts a TypeScript codebase into a JavaScript one with extra ceremony. We need to pin the compiler configuration, module system, and idiomatic patterns that keep the type system load-bearing so the compiler catches real defects, refactors stay safe, and `tsc` output is a reliable CI gate rather than advisory output.

## Decision Drivers

- Type safety: `strict: true` and supplementary flags (`noUncheckedIndexedAccess`, `noImplicitOverride`) eliminate whole classes of runtime defects at compile time
- Refactoring safety: explicit return types and no `any` keep refactors verifiable by the compiler
- Ecosystem alignment: TypeScript is the dominant language for Node.js and React projects; tooling, libraries, and frameworks assume it
- CI reliability: `tsc --noEmit` as a build gate makes type errors blocking, not advisory

## Considered Options

- TypeScript with `strict: true` and all supplementary flags, exact version pinning, and `tsc --noEmit` in CI
- TypeScript with relaxed compiler flags (no strict, `any` permitted)
- JavaScript with JSDoc type annotations
- Plain JavaScript with no type system

## Decision Outcome

We will use TypeScript as the primary language for all first-party code. Every `tsconfig.json` enables `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, and `noFallthroughCasesInSwitch`. `tsc --noEmit` runs in CI on every package and is treated as a build failure. The `any` type is forbidden; `unknown` with type guards is used instead. Non-null assertions (`!`) and unconstrained type assertions (`as Foo`) are forbidden. Exported function signatures carry explicit return types. `enum` is replaced by string literal unions or `as const` objects. The compiler version is pinned exactly as a `devDependency`.

## Consequences

- Positive: compiler catches real defects before CI; refactors across the codebase are safe
- Positive: explicit return types and no `any` make public API surfaces reviewable
- Negative: strict mode requires more upfront authoring discipline than loose TypeScript
- Negative: pinned compiler version requires deliberate upgrade PRs
- Neutral: JavaScript files, `require()`, and `module.exports` are forbidden in `.ts` files
