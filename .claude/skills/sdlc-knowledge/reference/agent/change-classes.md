# Change Classes & Gate Profiles

The full nine quality gates are the *default*, not a tax on every change. Matching the
process weight to the change is how AI-SDLC delivers **speed without losing quality**:
trivial changes move fast; risky changes get full rigor.

Classify every change into exactly one class. The class sets the **gate profile** and a
**default autonomy level**; the Authority in the Minimal Human Input Contract always
overrides the default.

## Gate index

`R` Requirements · `D` Design · `K` Risk · `I` Implementation · `T` Test ·
`S` Security/Privacy · `L` Release · `P` Production Validation · `G` Learning
(see `../quality-gates/quality-gates.md`)

## The classes

| Change class | Examples | Default level | Required gates | Mandatory escalation |
|--------------|----------|---------------|----------------|----------------------|
| **Trivial** | Docs, comments, copy, config value with no behavior change | 4 | I, T(light), G | If behavior changes |
| **Test-only** | Add or repair tests, no source change — includes adding new test scenarios for existing production behavior, fixing test bugs (e.g. wrong URLs, broken selectors), and expanding test coverage within an existing test file, as long as no file under `src/` or any deployed artifact changes | 3–4 | I, T, G | Failing tests with unclear cause |
| **Contained bug fix** | Localized fix, no schema/API change | 3 | R(light), K, I, T, P, G | Cause unclear; fix touches auth/data/API |
| **Internal refactor** | Behavior-preserving restructure | 2–4 | D, K, I, T, P, G | Blast radius beyond the module |
| **Small feature increment** | New behavior within an existing surface | 2–3 | R, D, K, I, T, S, L, P, G | Schema / API / auth / dependency change |
| **New feature** | New user-visible capability | 2 | All nine | Schema / API / auth / dependency change |
| **Schema / data migration** | DB schema or data change | 2 | R, D, K, I, T, S, L, P, G | Always — before the migration |
| **Public API change** | Endpoint, schema, or event contract change | 2 | All nine | Always — before the change |
| **Security / auth change** | Authn, authz, crypto, secrets handling | 1–2 | All nine + threat model | Always — mandatory human review |
| **Dependency change** | Add / remove / upgrade a library or service | 2–3 | K, I, T, S, L, P, G | Always — before adding |
| **Infrastructure / deploy** | IaC, pipeline, runtime config | 2–3 | D, K, I, T, S, L, P, G | Production-affecting changes |

## How to use it

1. Pick the class. When a change spans classes, use the **most rigorous** one.
2. Take its gate profile and default level.
3. Apply the human's Authority — it can raise rigor or lower autonomy, never the reverse
   without explicit approval.
4. "Light" gates still happen — they are just proportionate (a one-line restated
   objective instead of a full Requirements Brief).

## Sub-class: full reference implementation (example apps)

When a "New feature" run produces a **full reference implementation** (not a minimal
demo) — meaning it showcases an entire realistic stack end-to-end — use the following
defaults instead of the conservative "minimal footprint" defaults for example apps:

| Decision point | Conservative default (minimal demo) | Full-reference default |
|----------------|--------------------------------------|------------------------|
| Stack scope | Frontend slice only | Full stack (backend + frontend + infra) |
| Auth | Optional / anonymous | Auth enabled (JWT or session) |
| Dev loop | docker-compose | Skaffold (if k8s is in scope) |
| Observability | Off | OTEL + collector in-cluster |
| Storybook | Off | On (if component library present) |
| Node version | Current LTS (≥20) | Upstream spec version (e.g. ≥26) |
| SHA pinning | Pin upstream spec at scaffold time | Track `main`; record SHA in README |

**Why:** The 2026-05-24 `examples-todo-app` run had a 43% decision divergence ratio
(6/14 overrides) because the agent defaulted to the conservative column for all of the
above, and the user overrode each one toward the full-reference column. For runs where
the contract says "full walkthrough" or "realistic demonstration", start in the
full-reference column to avoid unnecessary question rounds.

**How to identify:** The contract's Priority field says "clarity and reproducibility"
*and* the scope includes multiple layers (auth + persistence + observability + tests),
*and* the target audience is engineers learning from the example.

## The fast path

Trivial and test-only changes, at Level 4, inside an approved operating domain, with all
automated checks green, may complete without human review. Everything else stops at its
profile's human gates.

This is the single biggest lever for delivery speed — it removes ceremony from the
60–80% of changes that are low-risk, so reviewer attention concentrates where blast
radius is real.
