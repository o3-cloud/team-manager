# Domain Model Index

- [README](README.md) — Business overview, subdomain map
- [Ubiquitous Language](ubiquitous-language.md) — Canonical term glossary
- [Context Map](context-map.md) — Context relationships and integration patterns

## Bounded Contexts

- [Identity](bounded-contexts/identity.md) — User accounts and auth (Generic)
- [Team](bounded-contexts/team.md) — Membership, roles, roster, seasons, invites (Core)
- [Schedule](bounded-contexts/schedule.md) — Events, recurrence, cancellation (Core)
- [Participation](bounded-contexts/participation.md) — RSVP and attendance (Core)
- [Results](bounded-contexts/results.md) — Game scores and season records (Supporting)
- [Communication](bounded-contexts/communication.md) — Announcements and notifications (Supporting)

## Aggregates

- [User](aggregates/user.md) — Authenticated identity
- [Team](aggregates/team.md) — Central organizing unit
- [Membership](aggregates/membership.md) — User role within a team
- [Season](aggregates/season.md) — Named date range scoping events and results
- [Event](aggregates/event.md) — Scheduled activity with lifecycle status and version
- [RecurringEventSeries](aggregates/recurring-event-series.md) — Template generating Event instances
- [RSVP](aggregates/rsvp.md) — Member's declared attendance intent
- [AttendanceRecord](aggregates/attendance-record.md) — Post-event factual presence log
- [GameResult](aggregates/game-result.md) — Score, outcome, and season record
- [Announcement](aggregates/announcement.md) — Role-targeted coach message
- [Invite](aggregates/invite.md) — Time-limited team join token

## Domain Events

- [EventCreated](domain-events/event-created.md)
- [EventUpdated](domain-events/event-updated.md)
- [EventCancelled](domain-events/event-cancelled.md)
- [EventReinstated](domain-events/event-reinstated.md)
- [GameResultRecorded](domain-events/game-result-recorded.md)
- [AnnouncementPosted](domain-events/announcement-posted.md)
- [InviteAccepted](domain-events/invite-accepted.md)

## Policies

- [Notification Delivery](policies/notification-delivery.md) — What triggers in-app notifications
- [Attendance Gate](policies/attendance-gate.md) — Past-event-only and non-cancelled guard
- [RSVP Gate](policies/rsvp-gate.md) — Cancellation blocks new RSVP writes

## Architecture Decision Records

- [ADR-0001](adr/0001-schedule-api-conventions.md) — Flat array, date-range filter, optimistic lock on events
