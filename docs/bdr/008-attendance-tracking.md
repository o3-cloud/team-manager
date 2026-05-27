# BDR-008: Attendance Tracking

## Status

Proposed

## Behavior

A coach/admin can record which players were present at a past event, and the attendance record is stored per player per event.

## Context

Tracking who showed up — separately from who said they would — gives coaches an accurate participation history. It also allows follow-up with frequently absent players and can inform decisions about game lineups or team policies.

## Acceptance Criteria

1. A coach/admin can mark individual players as present or absent for a specific event, and the record is persisted.
2. Attendance can be recorded only for events whose scheduled time has already passed; attempts to record attendance for future events are rejected.
3. A coach/admin can update a previously recorded attendance mark for a player; the updated value replaces the prior one.
4. A coach/admin can retrieve the full attendance record for an event, listing each player and their present/absent status.

## Verification

**Scenario 1 — Record attendance**
- Given a coach/admin and a past event with two players on the roster
- When the coach marks player A as present and player B as absent
- Then the attendance record for that event returns present for player A and absent for player B

**Scenario 2 — Future event rejected**
- Given an event scheduled for tomorrow
- When the coach attempts to record attendance for it
- Then the system returns an error and no attendance record is created

**Scenario 3 — Update attendance**
- Given player A previously marked as absent for an event
- When the coach updates player A's attendance to present
- Then the attendance record returns present for player A

**Scenario 4 — Retrieve full attendance**
- Given an event with three players, all with recorded attendance
- When the coach fetches the attendance for that event
- Then the response includes all three players with their respective statuses
