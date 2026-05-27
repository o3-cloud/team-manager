# BDR-003: Role Assignment

## Status

Proposed

## Behavior

A coach/admin can assign a role — coach, player, or parent — to any member of their team, and the member's access changes accordingly.

## Context

Different stakeholders have different responsibilities. Coaches need full control; players need read and RSVP access; parents need RSVP and notification access for their linked players. Role assignment is the mechanism by which the system enforces these boundaries.

## Acceptance Criteria

1. A coach/admin can change a team member's role to coach, player, or parent, and the change is reflected immediately when that member next fetches their profile or permissions.
2. A player cannot access coach-only actions (schedule creation, roster editing, attendance recording) after their role is confirmed as player.
3. A parent cannot access coach-only actions after their role is confirmed as parent.
4. A non-admin team member cannot change any team member's role, including their own.

## Verification

**Scenario 1 — Coach assigns a role**
- Given a coach/admin and a team member currently assigned the player role
- When the coach updates that member's role to parent
- Then the member's role is returned as parent on subsequent requests

**Scenario 2 — Player access restriction**
- Given a user with the player role on a team
- When they attempt to create an event or edit the roster via the API
- Then the system returns an authorization error (HTTP 403 or equivalent)

**Scenario 3 — Parent access restriction**
- Given a user with the parent role on a team
- When they attempt to record attendance or send an announcement
- Then the system returns an authorization error

**Scenario 4 — Member cannot self-promote**
- Given a user with the player role
- When they attempt to update their own role to coach/admin
- Then the system returns an authorization error and the role remains player
