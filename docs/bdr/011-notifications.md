# BDR-011: Notifications

## Status

Proposed

## Behavior

The system delivers in-app notifications to team members for event reminders, schedule changes, new announcements, and score updates.

## Context

Team members should not have to poll the app to stay informed. Timely push-style notifications ensure members receive relevant updates — upcoming events, changes to the schedule, new communications — without manual checking.

## Acceptance Criteria

1. A team member receives a notification when a new announcement targeted to their role is posted.
2. A team member receives a notification when an event they are associated with is updated (date, time, or location changed) or deleted.
3. A team member receives an event reminder notification before a scheduled event; the notification references the event by name and time.
4. A team member receives a notification when a game result is recorded for their team.
5. A member who has already read a notification can distinguish it from unread notifications in the notifications list.

## Verification

**Scenario 1 — Announcement notification**
- Given a player on a team
- When the coach posts a new announcement targeting all members
- Then the player's notification list contains a new unread entry referencing the announcement

**Scenario 2 — Schedule change notification**
- Given a player with an upcoming event
- When the coach updates the event's start time
- Then the player's notification list contains a new entry indicating the event was updated

**Scenario 3 — Event reminder**
- Given a team member with an event scheduled within the reminder window
- When the system processes reminders
- Then the member's notification list contains a reminder entry that includes the event name and scheduled time

**Scenario 4 — Score update notification**
- Given all members of a team
- When a coach records a game result
- Then each team member's notification list contains a new entry referencing the game result

**Scenario 5 — Read vs. unread state**
- Given a member with one unread notification
- When the member marks it as read
- Then the notification list distinguishes the read notification from any unread ones
