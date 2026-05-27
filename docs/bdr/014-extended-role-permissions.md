# BDR-014: Extended Role Permissions

## Status

Proposed

## Behavior

Define write access for ASSISTANT_COACH, TEAM_MANAGER, and SCOREKEEPER roles across all team-management features (events, announcements, roster, attendance, game results). Currently only COACH has write access; this BDR extends those permissions to the extended staff roles.

## Context

BDR-003 introduced ASSISTANT_COACH, TEAM_MANAGER, and SCOREKEEPER roles but deferred their write permissions. BDR-005 explicitly deferred extended role permissions to this BDR. All write endpoints currently enforce `role === COACH`; the `requireCoach()` guard must be replaced with a more granular capability check once this BDR is accepted.

## Related

- BDR-003: Role Assignment — defines the extended roles
- BDR-005: Event Scheduling — deferred extended role write access here

## Acceptance Criteria

_To be defined during spike/council session._

1. ASSISTANT_COACH can create, edit, and delete events and record attendance.
2. TEAM_MANAGER can create, edit, and delete events and send announcements.
3. SCOREKEEPER can record game results and attendance.
4. COACH retains all existing write permissions.
5. PLAYER and PARENT roles cannot perform any write operations that were not already permitted.

## Verification

_Scenarios to be added after AC finalization._
