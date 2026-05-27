# Membership Aggregate

## Purpose

Represents a User's participation in a Team and their Role within it. Role controls write access across all team features.

## Aggregate Root

`Membership`

## Entities

_(none — Membership is a single entity)_

## Value Objects

- `Role` — `COACH` | `ASSISTANT_COACH` | `TEAM_MANAGER` | `SCOREKEEPER` | `PLAYER` | `PARENT`

## Invariants

- A User may have at most one Membership per Team.
- Only a Member with `COACH` (or eligible staff role per BDR-014) may change another Member's Role.
- A non-admin Member cannot change their own Role.

## Commands

| Command | Description | Emits |
|---|---|---|
| AssignRole | Updates the Role on an existing Membership (coach-only) | `MemberRoleAssigned` |

## Role Permission Matrix

| Action | COACH | ASSISTANT_COACH | TEAM_MANAGER | SCOREKEEPER | PLAYER | PARENT |
|---|---|---|---|---|---|---|
| Create/edit/delete events | ✅ | ✅* | ✅* | ❌ | ❌ | ❌ |
| Cancel/reinstate events | ✅ | ✅* | ✅* | ❌ | ❌ | ❌ |
| Edit roster | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Record attendance | ✅ | ✅* | ❌ | ✅* | ❌ | ❌ |
| Record game results | ✅ | ❌ | ❌ | ✅* | ❌ | ❌ |
| Send announcements | ✅ | ❌ | ✅* | ❌ | ❌ | ❌ |
| RSVP to events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

_* = proposed in BDR-014; not yet accepted_

## Open Questions

- BDR-014 acceptance criteria for ASSISTANT_COACH, TEAM_MANAGER, and SCOREKEEPER write scopes are still being finalized.

## Related

- [Team Aggregate](team.md)
- [Team Context](../bounded-contexts/team.md)
- [Ubiquitous Language](../ubiquitous-language.md)
