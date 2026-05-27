# InviteAccepted

## Description

Raised when a registered User successfully redeems a valid, non-expired, non-revoked Invite. Creates a new Membership for that User on the Team with the Role specified in the Invite.

## Producer

Team Context

## Consumers

| Consumer | Reason |
|---|---|
| Team (self) | Creates the Membership record for the new Member |

## Payload

```json
{
  "inviteId": "uuid",
  "teamId": "uuid",
  "occurredAt": "ISO-8601",
  "acceptedByUserId": "uuid",
  "grantedRole": "PLAYER | PARENT"
}
```

## Versioning

| Version | Change |
|---|---|
| 1 | Initial event |

## Related

- [Team Context](../bounded-contexts/team.md)
- [Invite Aggregate](../aggregates/invite.md)
- [Membership Aggregate](../aggregates/membership.md)
