# ADR 0001: Schedule API Conventions (ADR-039)

## Status

Accepted

## Context

The team schedule endpoint needed a consistent shape. Options considered: paginated envelope, cursor-based pagination, flat array. Most schedule consumers want all events in a date window — pagination adds client complexity without benefit for typical team sizes.

## Decision

- The schedule endpoint returns a flat `EventEntity[]` array (no pagination envelope).
- Date-range filtering via `?from=&to=` query parameters.
- Response ordered by `startsAt ASC`.
- Overlapping Events produce a `warnings[]` field in create/edit responses but are saved regardless (warn, never block).
- `PATCH /teams/:teamId/events/:id` requires a `version` field for optimistic concurrency; mismatch returns HTTP 409.

## Consequences

- Simple client consumption: no cursor management.
- Large date ranges on busy teams could return large payloads — acceptable for current team sizes; revisit if performance degrades.
- All writes must carry `version`, adding a round-trip requirement for clients that do not cache event state.

## Related

- [Schedule Context](../bounded-contexts/schedule.md)
- [Event Aggregate](../aggregates/event.md)
