# ADR-038: Storybook

## Status

Accepted

## Context and Problem Statement

The frontend needs a component-state catalog that can serve as a verification surface — interaction tests, visual regression checks, and accessibility audits — and as living documentation reviewable per PR without running the app locally. Without enforced conventions, Storybook degrades into a demo playground: scattered formats, stale fixtures, stories that call real backend APIs, and no test wiring. This produces a second codebase that "documents" what the real code used to do, adding maintenance burden rather than confidence.

## Decision Drivers

- Verification value: stories must exercise real component states so failures surface regressions, not just render the component
- CI enforceability: story tests and accessibility checks must be automated gates, not optional manual reviews
- Network isolation: stories must not depend on a running backend, keeping them fast and deterministic
- Reviewability: every PR must produce a preview build so reviewers can inspect UI changes without a local setup
- Consistency: a single prescribed format (CSF3) prevents story drift across contributors

## Considered Options

- Storybook with CSF3, interaction tests, MSW mocking, `@storybook/test-runner` in CI, and Chromatic/Percy/Playwright visual diffing
- Storybook without enforced conventions (ad-hoc formats, no CI gate)
- No dedicated component catalog (rely solely on unit tests and manual review)

## Decision Outcome

Chosen option: **Storybook with enforced CSF3, test-runner CI gate, MSW mocking, and per-PR preview builds**, because it provides automated verification at the component level that complements unit and E2E tests, and the spec rules prevent the common failure mode of stale, untested stories.

Configuration lives in `.storybook/main.ts` (framework, addons, stories glob) and `.storybook/preview.tsx` (global decorators, parameters, themes); runtime monkey-patching is forbidden. The Storybook framework package must match the app's build tooling (`@storybook/react-vite` for Vite, `@storybook/nextjs` for Next.js). `storybook` and its framework package are pinned to exact versions and upgraded together via `npx storybook upgrade`.

Stories follow these rules:
- Each `*.stories.tsx` file is colocated next to the component it describes.
- Every component exported from a shared, design-system, or public package has at least one story.
- Stories use Component Story Format 3: a `default` export for `meta` and named `StoryObj` exports per story.
- Variation is driven through `args` and `argTypes`; hardcoded prop duplication across story bodies is forbidden.
- `tags: ['autodocs']` is set on every `meta` export unless generated docs are explicitly unwanted.
- Stories are named after user-visible states (`Default`, `Loading`, `Empty`, `Error`, `Disabled`) — names derived from implementation details are forbidden.
- Global providers (theme, locale, router, `QueryClient`, etc.) are supplied through global decorators in `preview.tsx`; individual stories do not set these up themselves.
- Stories import the real component; parallel simplified implementations inside story files are forbidden.
- Business logic, data fetching, and routing flows are excluded from stories — stories render display states only.

Testing and CI rules:
- `@storybook/addon-a11y` is registered; any WCAG AA violation it surfaces is a failing CI check.
- Interaction tests are written in `play` functions using `userEvent` and `expect` from `@storybook/test`.
- Network requests are mocked with MSW via `msw-storybook-addon`; stories must not call real backend endpoints.
- Story tests run in CI via `@storybook/test-runner` or the Vitest Storybook addon; failures are build failures.
- Visual regression tests run against published Storybook builds (Chromatic, Percy, Loki, or Playwright visual comparisons); merges are gated on passing diffs.
- A Storybook preview build is published per pull request to a reviewable URL.

## Consequences

- Positive: interaction and accessibility tests catch regressions at the component level before E2E tests run
- Positive: MSW mocking keeps stories fast and deterministic regardless of backend availability
- Positive: per-PR preview URLs eliminate "run it locally to see the change" review friction
- Positive: CSF3 + colocation makes stories discoverable and maintainable alongside the components they describe
- Negative: visual regression services (Chromatic, Percy) add external cost and a third-party dependency in the CI pipeline
- Negative: global decorator setup in `preview.tsx` requires upfront investment and must be kept in sync as providers change
- Negative: browser binaries for the test-runner add CI setup time similar to Playwright
