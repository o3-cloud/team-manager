# ADR-039: Schedule API Conventions

## Status

Accepted

## Context and Problem Statement

BDR-005 (Event Scheduling) requires decisions on how the schedule API is shaped: whether to return a calendar structure vs. a flat list, how clients filter events by date, and whether the API should enforce pagination. Without explicit conventions these choices drift across future features and make the frontend harder to test.

## Decision Drivers

- Separation of concerns: calendar layout is a presentational choice; the API should not dictate it
- Simplicity: avoid envelopes and pagination complexity for bounded, time-scoped queries
- Evolvability: the convention must remain correct after recurring-event expansion (BDR-006) adds more events per range

## Considered Options

- Return a calendar-shaped response (nested by week/day)
- Return a flat `EventEntity[]` array with optional date-range filter
- Return a paginated envelope (`{ data: [], total, page }`)

## Decision Outcome

Chosen option: **flat `EventEntity[]` ordered by `startsAt ASC` with `?from=&to=` date-range filter**, because:

- Calendar layout is a frontend concern; colocating it in the API response couples the two unnecessarily.
- Bounding queries by date range keeps result sets small without a pagination envelope.
- A flat array is trivially groupable by day on the frontend using a `reduce`.

Specific rules:
- `GET /teams/:teamId/events` returns a flat `EventEntity[]` ordered by `startsAt ASC`.
- Clients pass `?from=<ISO8601>&to=<ISO8601>` to bound results; the filter applies to `startsAt`.
- When both params are absent, all events for the team are returned (used by feeds / export).
- No pagination envelope is added. If a team accumulates so many events that unbounded queries become expensive, a follow-up ADR should introduce cursor-based pagination rather than retrofitting a limit here.
- Calendar grid rendering (grouping by day, week layout) lives entirely in the frontend.

## Consequences

- Positive: frontend can render any calendar shape without an API change
- Positive: no pagination envelope keeps integration tests and client code simple
- Positive: consistent with the existing flat-list pattern used by announcements and roster
- Negative: unbounded queries without `from`/`to` could be slow at scale; the follow-up pagination ADR must be implemented before the team event count crosses a defined threshold
