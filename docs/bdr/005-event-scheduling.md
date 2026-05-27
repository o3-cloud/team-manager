# BDR-005: Event Scheduling

## Status

Proposed

## Behavior

A coach can create a scheduled event — game, practice, meeting, or other — with a date, time, location, and optional notes, and all team members can view it.

## Context

Coordinating a team requires a shared, authoritative schedule. Members need to know when, where, and what type of activity is upcoming so they can plan attendance and RSVPs.

## Acceptance Criteria

1. A coach can create an event by providing a title, type (game/practice/meeting/other), date, time, and location; the event appears in the team schedule for all team members.
2. A coach can edit an existing event's title, date, time, location, or notes; the updated values are reflected in the schedule for all members.
3. A coach can delete an event; it no longer appears in the team schedule.
4. An event submitted without a title, date, or time is rejected with a validation error.
5. All team members (coach, player, parent) can retrieve the team schedule filtered by date range via `?from=&to=` query params; the response is a flat array ordered by `startsAt ASC`.
6. Creating or editing an event that overlaps an existing team event returns HTTP 200 (create: 201) with a `warnings` field; the event is saved regardless.

## Decisions

- **ADR-039**: Establishes schedule API conventions — flat `EventEntity[]`, `?from=&to=` date-range filter, no pagination envelope.
- **Deferred**: Extended role write permissions (ASSISTANT_COACH, TEAM_MANAGER, SCOREKEEPER) deferred to **BDR-014**.
- **Deferred**: Recurring events deferred to **BDR-006**.
- **Optimistic locking**: `PATCH /teams/:teamId/events/:id` requires a `version` field; concurrent edits return HTTP 409.
- **Overlap check**: Warn on overlap (HTTP 200/201 + `warnings[]` field), never block.

## Verification

**Scenario 1 — Create event**
- Given a coach on a team with an active season
- When they create an event with title, type, date, time, and location
- Then the event appears in the team schedule endpoint for all member roles

**Scenario 2 — Edit event**
- Given an existing event with a known location
- When the coach updates the location to a new value (passing the current `version`)
- Then the event returned from the schedule endpoint shows the new location

**Scenario 3 — Delete event**
- Given an existing event
- When the coach deletes it
- Then the event no longer appears in the team schedule for any member

**Scenario 4 — Missing required fields**
- Given a coach
- When they submit an event creation request with no `startsAt`
- Then the system returns HTTP 400 (validation error) and no event is created

**Scenario 5 — Member schedule access**
- Given a user with the player role
- When they request the team schedule (`GET /teams/:teamId/events`)
- Then the response is HTTP 200 with all events present

**Scenario 6 — Overlap warning**
- Given a team with an existing event on a given date/time
- When a coach creates a second event whose time window overlaps the first
- Then the response is HTTP 201 with a `warnings` field containing a conflict message
- And the event is saved (not blocked)

**Scenario 7 — Concurrent edit conflict**
- Given a coach who reads event at `version: 1`
- When a second coach simultaneously edits the same event (version advances to 2)
- And the first coach submits their edit with `version: 1`
- Then the first coach receives HTTP 409
- And the second coach's data is preserved

## Related

- ADR-039: Schedule API conventions
- BDR-006: Recurring Events
- BDR-014: Extended Role Permissions
