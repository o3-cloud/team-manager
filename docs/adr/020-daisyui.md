# ADR-020: daisyUI

## Status

Accepted

## Context and Problem Statement

Given the decision to use Tailwind CSS ([ADR-022](022-tailwind.md)) as the styling framework, the team needs a component library that provides semantic UI components without requiring a React-specific component library. Without shared conventions on daisyUI usage, teams enable all 35 themes in production builds (bloating CSS), hardcode colors instead of using theme tokens, and reach for raw CSS overrides before exhausting the built-in modifier system — producing bloated builds, inconsistent theming, and components that break when the design system changes.

## Decision Drivers

- Semantic components: `btn`, `card`, `modal`, and other semantic classes reduce boilerplate without leaving Tailwind's utility model
- CSS-variable theming: theme switching via `data-theme` attribute requires no JavaScript and works with SSR
- Bundle size discipline: `themes: all` must never reach production; only declared themes are included
- Tailwind alignment: daisyUI is a Tailwind plugin — no parallel CSS framework or component library is needed

## Considered Options

- daisyUI with Tailwind CSS — semantic component classes + CSS-variable theming
- Headless UI or Radix UI with custom Tailwind styling (more flexibility, more work)
- shadcn/ui (copy-paste Radix components with Tailwind)
- Material UI or Chakra UI (CSS-in-JS, not aligned with Tailwind)

## Decision Outcome

We will use daisyUI as the component layer on top of Tailwind CSS. daisyUI is registered as `@plugin "daisyui"` after `@import "tailwindcss"`. Only the themes the project actually uses are declared in plugin configuration (no `themes: all` in production). One theme is designated default with `--default`; one dark-mode theme with `--prefersdark`. Themes are applied via `data-theme` on the root or scoped elements. Modifier classes (`btn-primary`, `btn-outline`, etc.) are exhausted before adding raw Tailwind utility overrides. Custom themes are defined via `@plugin "daisyui/theme"` with CSS variable assignments. Design tokens are referenced as CSS variables (`var(--color-primary)`), never hardcoded color values.

## Consequences

- Positive: semantic component classes reduce Tailwind boilerplate without leaving the utility-first model
- Positive: CSS-variable theming enables runtime theme switching with zero JavaScript overhead
- Positive: tight Tailwind alignment means no parallel styling systems in the codebase
- Negative: daisyUI's component class semantics must be learned alongside Tailwind utilities
- Negative: `themes: all` in production significantly increases CSS bundle size — must be actively prevented
- Neutral: overriding daisyUI component internals and hardcoding color values are forbidden
