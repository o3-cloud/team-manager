# Results Context

## Purpose

Records final scores and outcomes for completed Game events, maintains the Season's running win/loss/tie record, and makes the full game history visible to all team members.

## Responsibilities

- Record and update GameResults (own score, opponent score, optional notes)
- Derive outcome (`WIN`, `LOSS`, `TIE`) from recorded scores automatically
- Compute and update the Season Record (aggregate W/L/T) on each result write
- Enforce event-type guard: results only on `GAME`-type Events
- Enforce status guard: results blocked on `CANCELLED` Events
- Expose game history and season record to all roles (read-only for non-coaches)

## Out of Scope

- Attendance records (owned by [Participation context](participation.md))
- Schedule management (owned by [Schedule context](schedule.md))
- Notification delivery (owned by [Communication context](communication.md))

## Key Concepts

| Concept | Type | Description |
|---|---|---|
| GameResult | Aggregate Root | Score, derived outcome, and notes for a single Game Event |
| Outcome | Value Object | Derived from scores: `WIN`, `LOSS`, or `TIE` |
| SeasonRecord | Entity | Aggregate W/L/T counts for a Season; recomputed on each GameResult write |

## Integrations

| Direction | Other Context | Mechanism |
|---|---|---|
| Subscribes | Schedule | Event model — enforces game-type and non-cancelled guards |
| Subscribes | Team | Season scope for record isolation |
| Publishes | Communication | `GameResultRecorded` — triggers member Notifications |

## Related

- [Ubiquitous Language](../ubiquitous-language.md)
- [Context Map](../context-map.md)
