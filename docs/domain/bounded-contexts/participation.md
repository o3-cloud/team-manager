# Participation Context

## Purpose

Records two distinct kinds of member engagement with Events: forward-looking RSVP commitments (before the event) and backward-looking Attendance records (after the event). Coaches use the combined picture to plan lineups and follow up with absent players.

## Responsibilities

- Accept and replace RSVP responses (`GOING`, `NOT_GOING`, `MAYBE`) from Players and Parents
- Allow Parents to RSVP on behalf of linked Players (via Roster parent-link)
- Surface non-respondents alongside respondents in the coach RSVP view
- Record per-player Attendance (`PRESENT` / `ABSENT`) only for past Events
- Block Attendance recording for future Events and for CANCELLED Events
- Allow Attendance corrections; latest mark wins

## Out of Scope

- Event creation or status changes (owned by [Schedule context](schedule.md))
- Notifications triggered by Attendance (owned by [Communication context](communication.md))

## Key Concepts

| Concept | Type | Description |
|---|---|---|
| RSVP | Aggregate Root | A Member's declared intent for a specific Event; only the latest response is kept |
| RsvpStatus | Value Object | `GOING`, `NOT_GOING`, `MAYBE` |
| AttendanceRecord | Aggregate Root | The factual presence log for all Players at a specific past Event |
| AttendanceMark | Entity | A single Player's `PRESENT` / `ABSENT` record within an AttendanceRecord |

## Integrations

| Direction | Other Context | Mechanism |
|---|---|---|
| Subscribes | Schedule | `EventCancelled` — blocks new RSVPs; `EventStatus` — guards Attendance recording |
| Subscribes | Team | Roster parent-links (for parent RSVP on behalf of Player) and Membership roles |

## Related

- [Ubiquitous Language](../ubiquitous-language.md)
- [Context Map](../context-map.md)
