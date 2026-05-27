# BDR-010: Announcements

## Status

Proposed

## Behavior

A coach/admin can send an announcement to targeted team members — players only, parents only, or all — and recipients can view it in the team feed.

## Context

Coaches need a direct channel to push important information (schedule changes, reminders, team news) to relevant subsets of the team without relying on external messaging apps. Targeting prevents information overload for members who don't need every message.

## Acceptance Criteria

1. A coach/admin can create an announcement with a body and a target audience (players, parents, or all); the announcement appears in the feed for every member in the target group.
2. An announcement targeted to players is not visible to members whose only role is parent.
3. An announcement targeted to parents is not visible to members whose only role is player.
4. An announcement marked urgent is distinguishable from non-urgent announcements in the feed response.
5. A player or parent cannot create an announcement; such attempts are rejected with an authorization error.

## Verification

**Scenario 1 — Announcement visible to target group**
- Given a team with one player and one parent
- When the coach sends an announcement targeted to "all"
- Then both the player and the parent see the announcement in their feed

**Scenario 2 — Players-only announcement hidden from parents**
- Given a coach who sends an announcement targeted to "players"
- When a parent-only member fetches their feed
- Then the announcement does not appear in their response

**Scenario 3 — Parents-only announcement hidden from players**
- Given a coach who sends an announcement targeted to "parents"
- When a player-only member fetches their feed
- Then the announcement does not appear in their response

**Scenario 4 — Urgent flag distinguishable**
- Given a coach who sends one urgent and one non-urgent announcement
- When any team member fetches their feed
- Then the urgent announcement's response payload includes a field or flag that distinguishes it from the non-urgent one

**Scenario 5 — Player cannot send announcement**
- Given a user with the player role
- When they attempt to create an announcement
- Then the system returns an authorization error (HTTP 403 or equivalent)
