# EventCancelled

## Description

Raised when a Coach transitions a SCHEDULED Event to CANCELLED status. The Event remains in the schedule as a read-only record. All Team members receive a Notification; existing RSVPs are preserved but no new RSVPs may be submitted.

## Producer

Schedule Context

## Consumers

| Consumer | Reason |
|---|---|
| Communication | Generates cancellation Notifications for all Team members (includes title, original start time, reason) |
| Participation | Blocks new RSVP submissions against the cancelled Event |

## Payload

```json
{
  "eventId": "uuid",
  "teamId": "uuid",
  "occurredAt": "ISO-8601",
  "eventTitle": "string",
  "originalStartsAt": "ISO-8601",
  "cancellationReason": "string | null",
  "version": 3
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Schedule Context](../bounded-contexts/schedule.md)
- [Event Aggregate](../aggregates/event.md)
- [EventReinstated Domain Event](event-reinstated.md)
- [Notification Policy](../policies/notification-delivery.md)
