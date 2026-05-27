# BDR-015: Event Cancellation

## Status

Proposed

## Behavior

A coach can cancel a scheduled event, preserving it in the schedule as a read-only record while notifying all team members and blocking further writes to that event.

## Context

Events are routinely cancelled due to weather, venue unavailability, or opponent forfeiture. Deleting an event (BDR-005 AC-3) erases it entirely, which loses the historical record and any RSVPs members have already submitted. Cancellation is a distinct lifecycle state: the event remains visible and queryable but is closed to attendance recording, result entry, and edits. Members need timely notification so they do not travel to a cancelled event.

## Acceptance Criteria

1. A coach can cancel a scheduled event with an optional cancellation reason; the event transitions to CANCELLED status and remains visible in the team schedule.
2. Cancelling an event triggers a notification to all team members that includes the event title, original start time, and the cancellation reason if provided.
3. A CANCELLED event is read-only: attempts to edit it, record attendance against it, or record a game result for it are rejected.
4. A CANCELLED event can be reinstated to SCHEDULED by a coach before its original start time; reinstatement triggers a notification to all team members.
5. A CANCELLED event that has passed its original start time cannot be reinstated.
6. Existing RSVP responses for a cancelled event are preserved and remain readable; no new RSVPs may be submitted for a CANCELLED event.
7. All team members (any role) can read a CANCELLED event and its cancellation reason.

## Decisions

- **EventStatus** is a new value object on the `Event` aggregate: `SCHEDULED` (default) | `CANCELLED`. Cancellation reason is an optional string field added to `Event`.
- **Deletion vs. cancellation**: `DELETE /events/:id` (BDR-005 AC-3) permanently removes the event. `POST /events/:id/cancel` transitions status to CANCELLED. These are intentionally separate operations.
- **Optimistic concurrency**: the cancellation request must supply the current `version`; a mismatch returns HTTP 409, consistent with BDR-005 edit behaviour.
- **Reinstatement guard**: reinstatement is blocked once `startsAt` is in the past, preventing confusion with the attendance and result write rules in BDR-008 and BDR-009.
- **Extended roles**: ASSISTANT_COACH and TEAM_MANAGER may also cancel and reinstate events, consistent with their event write permissions established in BDR-014.

## Verification

**Scenario 1 — Coach cancels an event**
- Given a coach and a SCHEDULED event with `version: 1`
- When the coach submits a cancellation request with reason "Field flooded" and `version: 1`
- Then the event status is CANCELLED, the reason is stored, and the event remains in the schedule

**Scenario 2 — Cancellation notification delivered**
- Given the cancellation in Scenario 1
- When the event is cancelled
- Then a notification is delivered to every team member containing the event title, original start time, and "Field flooded"

**Scenario 3 — Cancelled event blocks writes**
- Given a CANCELLED event
- When a coach attempts to edit the event title
- Then the system returns HTTP 422
- When a coach attempts to record attendance for a player
- Then the system returns HTTP 422
- When a coach attempts to record a game result for the event
- Then the system returns HTTP 422

**Scenario 4 — Cancelled event blocks new RSVPs**
- Given a CANCELLED event where a player has an existing RSVP of "Going"
- When the player attempts to submit a new RSVP of "Not Going"
- Then the system returns HTTP 422 and the existing "Going" RSVP is unchanged and readable

**Scenario 5 — Reinstatement before start time**
- Given a CANCELLED event whose start time is in the future
- When the coach reinstates the event
- Then the event status returns to SCHEDULED and a notification is delivered to all team members

**Scenario 6 — Reinstatement after start time rejected**
- Given a CANCELLED event whose original start time is in the past
- When the coach attempts to reinstate it
- Then the system returns HTTP 422 and the event remains CANCELLED

**Scenario 7 — Optimistic concurrency on cancellation**
- Given a coach who reads an event at `version: 2`
- When a second coach edits the event (version advances to 3)
- And the first coach submits a cancellation with `version: 2`
- Then the first coach receives HTTP 409 and the event is not cancelled

**Scenario 8 — Member reads cancelled event**
- Given a player on a team with a CANCELLED event
- When the player fetches the team schedule
- Then the CANCELLED event appears in the response with its status and cancellation reason

## Related

- BDR-005: Event Scheduling (defines EventDeleted and the existing delete path)
- BDR-007: RSVP (RSVP writes are blocked for CANCELLED events)
- BDR-008: Attendance Tracking (attendance writes are blocked for CANCELLED events)
- BDR-009: Game Results (result writes are blocked for CANCELLED events)
- BDR-011: Notifications (cancellation and reinstatement trigger notifications)
- BDR-014: Extended Role Permissions (ASSISTANT_COACH and TEAM_MANAGER inherit cancel/reinstate rights)
