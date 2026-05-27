# BDR-006: Recurring Events

## Status

Proposed

## Behavior

A coach/admin can create a recurring event that automatically generates instances on a defined schedule (e.g., weekly).

## Context

Regular activities like weekly practices would require tedious manual re-entry without recurrence support. A recurring event pattern lets coaches define the cadence once and have the schedule populated automatically.

## Acceptance Criteria

1. A coach/admin can create a recurring event with a recurrence rule (e.g., weekly on a given day) and an end date; the system generates individual event instances for each occurrence within that range.
2. All generated instances appear in the team schedule and are individually visible to team members.
3. A coach/admin can cancel a single instance of a recurring event without affecting other instances in the series.
4. A coach/admin can cancel the entire series; all remaining future instances are removed from the schedule.

## Verification

**Scenario 1 — Weekly recurrence generates instances**
- Given a coach/admin creating a weekly recurring event starting on a Monday with an end date four weeks out
- When the event is created
- Then the team schedule contains four individual event instances on the correct dates

**Scenario 2 — Members see recurring instances**
- Given a recurring event with generated instances
- When a player fetches the team schedule
- Then each instance appears as a distinct entry in the response

**Scenario 3 — Cancel single instance**
- Given a recurring series with three future instances
- When the coach cancels the second instance
- Then the first and third instances remain in the schedule and the second is absent

**Scenario 4 — Cancel entire series**
- Given a recurring series with multiple future instances
- When the coach cancels the entire series
- Then no future instances from that series appear in the team schedule
