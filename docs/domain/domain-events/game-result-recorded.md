# GameResultRecorded

## Description

Raised when a Coach (or Scorekeeper per BDR-014) records or updates the score and outcome for a completed Game Event. Triggers a Notification to all Team members and causes the SeasonRecord to be recomputed.

## Producer

Results Context

## Consumers

| Consumer | Reason |
|---|---|
| Communication | Generates game-result Notifications for all Team members |

## Payload

```json
{
  "eventId": "uuid",
  "teamId": "uuid",
  "seasonId": "uuid",
  "occurredAt": "ISO-8601",
  "ownScore": 3,
  "opponentScore": 1,
  "outcome": "WIN | LOSS | TIE",
  "notes": "string | null",
  "seasonRecord": {
    "wins": 4,
    "losses": 1,
    "ties": 0
  }
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Results Context](../bounded-contexts/results.md)
- [GameResult Aggregate](../aggregates/game-result.md)
- [Notification Policy](../policies/notification-delivery.md)
