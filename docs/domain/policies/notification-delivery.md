# Notification Delivery Policy

## Trigger

Any of the following domain events:
- `AnnouncementPosted` (from Communication Context)
- `EventUpdated` (from Schedule Context)
- `EventCancelled` (from Schedule Context)
- `EventReinstated` (from Schedule Context)
- `GameResultRecorded` (from Results Context)
- Reminder timer fires within the configured window before `Event.startsAt`

## Effect

For each triggering event, the policy resolves the target Member set and creates one `Notification` record per Member with `status = UNREAD`.

| Trigger | Target Members | Notification Type |
|---|---|---|
| `AnnouncementPosted` | Members matching `audience` (PLAYERS, PARENTS, or ALL) | `ANNOUNCEMENT` |
| `EventUpdated` | All Team Members | `SCHEDULE_CHANGE` |
| `EventCancelled` | All Team Members | `EVENT_CANCELLED` |
| `EventReinstated` | All Team Members | `EVENT_REINSTATED` |
| `GameResultRecorded` | All Team Members | `GAME_RESULT` |
| Reminder timer | All Team Members with the Event on their schedule | `EVENT_REMINDER` |

## Owning Context

Communication

## Rules

- A Notification is created per Member; it is not shared.
- Marking a Notification as read updates only that Member's record.
- Delivery is in-app only; no external channels are in scope.
- The reminder window timing (how far in advance the reminder fires) is an open configuration question — not yet specified in any BDR.

## Open Questions

- What is the configurable reminder window (e.g., 24 h before, 1 h before)?
- Should urgent Announcements generate higher-priority Notifications?

## Related

- [Communication Context](../bounded-contexts/communication.md)
- [AnnouncementPosted Domain Event](../domain-events/announcement-posted.md)
- [EventCancelled Domain Event](../domain-events/event-cancelled.md)
- [GameResultRecorded Domain Event](../domain-events/game-result-recorded.md)
