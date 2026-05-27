# Schedule Context

## Purpose

Maintains the authoritative team calendar. Coaches create, edit, and delete Events (games, practices, meetings). Events may recur on a weekly cadence. Events have a lifecycle status (`SCHEDULED` / `CANCELLED`) and support optimistic concurrency via a `version` counter.

## Responsibilities

- Create, edit, and delete Events with required fields (title, type, date/time, location)
- Validate required fields and detect time-window overlaps (warn, do not block)
- Manage RecurringEventSeries and generate individual Event instances
- Cancel and reinstate Events; enforce reinstatement guard (past start time)
- Enforce optimistic concurrency (`version` on PATCH and cancel)
- Expose team schedule filtered by date range (`?from=&to=`), ordered by `startsAt ASC`
- Authorise writes by Role (COACH; extended roles per BDR-014)
- Scope Events to the Team's active Season

## Out of Scope

- RSVP and Attendance (owned by [Participation context](participation.md))
- Game scores (owned by [Results context](results.md))
- Notification delivery (owned by [Communication context](communication.md))

## Key Concepts

| Concept | Type | Description |
|---|---|---|
| Event | Aggregate Root | A single scheduled activity with status, version, and optional recurrence link |
| EventStatus | Value Object | `SCHEDULED` (default) or `CANCELLED` |
| EventType | Value Object | `GAME`, `PRACTICE`, `MEETING`, `OTHER` |
| RecurringEventSeries | Aggregate Root | Template that generates Event instances on a recurrence rule |
| RecurrenceRule | Value Object | Cadence definition (e.g., WEEKLY on a given day) plus an end date |
| OverlapWarning | Value Object | Non-blocking advisory returned when an Event's window overlaps another |
| Version | Value Object | Optimistic-concurrency counter; required on PATCH and cancel; mismatch → HTTP 409 |

## Integrations

| Direction | Other Context | Mechanism |
|---|---|---|
| Subscribes | Team | Season scope and role-based write authorization |
| Publishes | Participation | `EventCreated`, `EventUpdated`, `EventCancelled` — govern RSVP validity |
| Publishes | Communication | `EventUpdated`, `EventCancelled`, `EventReinstated` — trigger Notifications |
| Publishes | Results | Event model (type guard: only GAME events accept Results) |

## Related

- [Ubiquitous Language](../ubiquitous-language.md)
- [Context Map](../context-map.md)
