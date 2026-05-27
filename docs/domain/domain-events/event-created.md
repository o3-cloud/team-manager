# EventCreated

## Description

Raised when a Coach successfully creates a new scheduled Event for a Team. May include an `OverlapWarning` if the Event's time window conflicts with an existing Event.

## Producer

Schedule Context

## Consumers

| Consumer | Reason |
|---|---|
| Participation | Establishes the Event as a valid target for RSVP submissions |

## Payload

```json
{
  "eventId": "uuid",
  "teamId": "uuid",
  "seasonId": "uuid",
  "occurredAt": "ISO-8601",
  "title": "string",
  "type": "GAME | PRACTICE | MEETING | OTHER",
  "startsAt": "ISO-8601",
  "location": "string",
  "notes": "string | null",
  "version": 1,
  "warnings": []
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Schedule Context](../bounded-contexts/schedule.md)
- [Event Aggregate](../aggregates/event.md)
