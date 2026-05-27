# AttendanceRecord Aggregate

## Purpose

The factual post-event presence log for all Players at a specific Event. Distinct from RSVP (intent), Attendance reflects what actually happened. Coaches use it to track participation history across the season.

## Aggregate Root

`AttendanceRecord`

## Entities

- `AttendanceMark` — a single Player's `PRESENT` / `ABSENT` status within this Record

## Value Objects

- `AttendanceStatus` — `PRESENT` | `ABSENT`

## Invariants

- Attendance may only be recorded for Events whose `startsAt` is in the past.
- Attendance recording is blocked for `CANCELLED` Events (HTTP 422).
- Recording is coach-only (or eligible staff per BDR-014).
- A Player's mark may be corrected; the latest mark wins.

## Commands

| Command | Description | Emits |
|---|---|---|
| RecordAttendance | Sets PRESENT / ABSENT for one or more Players on a past Event | `AttendanceRecorded` |
| UpdateAttendanceMark | Corrects a previously recorded mark | `AttendanceRecorded` (updated) |

## Related

- [Participation Context](../bounded-contexts/participation.md)
- [Event Aggregate](event.md)
- [Ubiquitous Language](../ubiquitous-language.md)
