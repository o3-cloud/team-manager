# Context Pack 03 — System Context

> Layer 4 (System). Reusable within one repo / service / product.
> **This pack is a template. Fill it in for your system.**

## System purpose
_What this system does and why it exists._

## Architecture overview
_Key components, service boundaries, deployment topology._

## Data stores
_Databases, caches, queues, object stores — and what each holds._

## APIs & integration points
_Public APIs, internal APIs, events consumed/produced, third-party integrations._

## Authentication & authorization model
_How identity and permissions work._

## Known constraints & invariants
_e.g. events must be idempotent; ordering not guaranteed; PII must not be logged;
schema changes need backward compatibility for N release cycles._

## Known technical debt
_Shortcuts and fragile areas the agent should be aware of._

## Ownership
_Owning team, on-call, escalation contacts._

---

### Example (billing service)

> Handles customer billing events: receives events from the commerce platform,
> normalizes them, persists billing state, publishes downstream notifications.
>
> Constraints: billing events must be idempotent; event ordering is not guaranteed;
> duplicate events are expected; customer PII must not be logged; external calls
> require retry with bounded backoff; schema changes require backward compatibility
> for at least two release cycles.
