# Communication Context

## Purpose

Provides two outbound channels for team communication: coach-authored Announcements targeted to role-based audience segments, and system-generated Notifications triggered by domain events from other contexts.

## Responsibilities

- Create Announcements with a target audience (`PLAYERS`, `PARENTS`, `ALL`) and optional urgency flag
- Enforce announcement authorship: only COACH and eligible staff roles may post
- Filter Announcement visibility by Member role at read time
- Generate Notifications for:
  - New Announcement (targeted to Member's role)
  - Event updated or deleted (schedule change)
  - Event reminder (configurable window before `startsAt`)
  - Event cancelled or reinstated
  - Game result recorded
- Track `READ` / `UNREAD` state per Notification per Member

## Out of Scope

- Delivery over external channels (email, SMS, push) — in-app only unless extended
- Announcement replies or threaded discussions
- Event creation or management (owned by [Schedule context](schedule.md))

## Key Concepts

| Concept | Type | Description |
|---|---|---|
| Announcement | Aggregate Root | A coach-authored message with audience targeting and optional urgency |
| AnnouncementAudience | Value Object | `PLAYERS`, `PARENTS`, or `ALL` |
| Notification | Aggregate Root | A system-generated in-app alert for a Member with read/unread state |
| NotificationType | Value Object | `ANNOUNCEMENT`, `SCHEDULE_CHANGE`, `EVENT_REMINDER`, `EVENT_CANCELLED`, `EVENT_REINSTATED`, `GAME_RESULT` |

## Integrations

| Direction | Other Context | Mechanism |
|---|---|---|
| Subscribes | Schedule | `EventUpdated`, `EventCancelled`, `EventReinstated` → generate Notifications |
| Subscribes | Results | `GameResultRecorded` → generate Notifications |
| Subscribes | Team | Membership and Role data for audience targeting |

## Related

- [Ubiquitous Language](../ubiquitous-language.md)
- [Context Map](../context-map.md)
