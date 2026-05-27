# Domain Model

Team Manager is a sports-team coordination application. Coaches create teams, build rosters, schedule events, and communicate with players and parents. Players and parents confirm attendance via RSVP, receive notifications about schedule changes, and review game history. Every capability is scoped to a team, and access is governed by the member's role within that team.

## Core Domain

**Team Management** — scheduling, rostering, and communication tools that let coaches run a sports team without external apps.

## Supporting Domains

- Identity — account creation and authentication
- Notifications — in-app delivery of real-time updates

## Subdomains

| Subdomain | Type | Description |
|---|---:|---|
| Team | Core | Organises members, roles, roster, and seasons |
| Schedule | Core | Events (games, practices, meetings), recurrence, and cancellation |
| Participation | Core | RSVP commitments and post-event attendance records |
| Results | Supporting | Game scores, outcomes, and season win/loss records |
| Communication | Supporting | Coach-to-member announcements and notifications |
| Identity | Generic | User accounts and authentication |

## Related

- [Ubiquitous Language](ubiquitous-language.md)
- [Context Map](context-map.md)
