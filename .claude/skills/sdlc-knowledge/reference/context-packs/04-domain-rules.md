# Context Pack 04 — Domain Rules

> Layer 5 (Domain). Reusable across many features in the same business domain.
> **This pack is a template. Fill it in for your domain.**

## Domain vocabulary
_Define the terms. The agent should not rediscover these from the human each time._

## Business invariants
_Rules that must always hold._

## Valid & invalid states
_The legal states of core entities and the allowed transitions._

## Decision rules & domain workflows
_The business logic that governs how the domain behaves._

## Regulatory & compliance constraints
_Jurisdictional rules, audit obligations, mandated controls._

## Data classification
_What data is sensitive and how it must be handled._

## Known domain edge cases
_Unusual cases the agent should always account for._

---

### Example (payments domain)

> - A payment may be authorized, captured, voided, refunded, partially refunded,
>   disputed, or failed.
> - A refund cannot exceed the captured amount.
> - A void is only valid before capture settlement.
> - Payment failure reasons must be preserved for audit.
> - Do not expose raw processor errors directly to end users.
> - Payment events must be idempotent.
> - Payment state transitions must be auditable.
