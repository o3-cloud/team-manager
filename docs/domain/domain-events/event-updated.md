# EventUpdated

## Description

Raised when a Coach successfully edits a SCHEDULED Event's title, date, time, location, or notes. Triggers schedule-change Notifications for all Team members associated with the Event.

## Producer

Schedule Context

## Consumers

| Consumer | Reason |
|---|---|
| Communication | Generates schedule-change Notifications for all Team members |

## Payload

```json
{
  "eventId": "uuid",
  "teamId": "uuid",
  "occurredAt": "ISO-8601",
  "changedFields": ["startsAt", "location"],
  "previousValues": {
    "startsAt": "ISO-8601",
    "location": "string"
  },
  "newValues": {
    "startsAt": "ISO-8601",
    "location": "string"
  },
  "version": 2
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Schedule Context](../bounded-contexts/schedule.md)
- [Event Aggregate](../aggregates/event.md)
- [Notification Policy](../policies/notification-delivery.md)
