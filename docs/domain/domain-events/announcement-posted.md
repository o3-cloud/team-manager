# AnnouncementPosted

## Description

Raised when a Coach creates an Announcement targeting a specific audience. Triggers in-app Notifications for each Member in the target audience group.

## Producer

Communication Context

## Consumers

| Consumer | Reason |
|---|---|
| Communication (self) | Generates Notifications for each Member matching the target audience |

## Payload

```json
{
  "announcementId": "uuid",
  "teamId": "uuid",
  "occurredAt": "ISO-8601",
  "authorMemberId": "uuid",
  "body": "string",
  "audience": "PLAYERS | PARENTS | ALL",
  "urgent": false
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Communication Context](../bounded-contexts/communication.md)
- [Announcement Aggregate](../aggregates/announcement.md)
- [Notification Policy](../policies/notification-delivery.md)
