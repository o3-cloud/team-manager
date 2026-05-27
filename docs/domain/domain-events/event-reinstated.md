# EventReinstated

## Description

Raised when a Coach transitions a CANCELLED Event back to SCHEDULED status. Only permitted if the Event's original `startsAt` is still in the future. Triggers reinstatement Notifications for all Team members.

## Producer

Schedule Context

## Consumers

| Consumer | Reason |
|---|---|
| Communication | Generates reinstatement Notifications for all Team members |
| Participation | Re-opens the Event to new RSVP submissions |

## Payload

```json
{
  "eventId": "uuid",
  "teamId": "uuid",
  "occurredAt": "ISO-8601",
  "eventTitle": "string",
  "startsAt": "ISO-8601",
  "version": 4
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Schedule Context](../bounded-contexts/schedule.md)
- [Event Aggregate](../aggregates/event.md)
- [EventCancelled Domain Event](event-cancelled.md)
