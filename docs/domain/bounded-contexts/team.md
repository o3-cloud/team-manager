# Team Context

## Purpose

The core context of the application. Governs team creation, member enrollment, role assignment, roster curation, season lifecycle, and invitation management. Every other context resolves authorization by querying a Member's Role within a Team.

## Responsibilities

- Create and name Teams (unique per owner, case-insensitive)
- Assign and change Member Roles (COACH, ASSISTANT_COACH, TEAM_MANAGER, SCOREKEEPER, PLAYER, PARENT)
- Maintain the Roster: add/update RosterEntries, link Parents to Players
- Manage Invites: generate, revoke, accept (with expiry and duplicate-membership guard)
- Manage Seasons: create, make active, archive (one active at a time)
- Enforce IDOR: Members may only access Teams they belong to

## Out of Scope

- Scheduling Events (owned by [Schedule context](schedule.md))
- RSVP and Attendance (owned by [Participation context](participation.md))
- Announcements and Notifications (owned by [Communication context](communication.md))
- Game scores and records (owned by [Results context](results.md))

## Key Concepts

| Concept | Type | Description |
|---|---|---|
| Team | Aggregate Root | The central organizing unit; owns Memberships, Roster, Seasons |
| Membership | Entity | A User's participation in a Team with a specific Role |
| Role | Value Object | One of: COACH, ASSISTANT_COACH, TEAM_MANAGER, SCOREKEEPER, PLAYER, PARENT |
| RosterEntry | Entity | A Player's profile (name, jersey, position) within a Team |
| Season | Aggregate Root | Named date range scoping events and results; one active per Team |
| Invite | Aggregate Root | Time-limited, role-scoped token enabling a User to join a Team |

## Integrations

| Direction | Other Context | Mechanism |
|---|---|---|
| Subscribes | Identity | `UserRegistered` — anchors a User identity for Membership creation |
| Publishes | Schedule | Membership roles for authorization; Season scope for Events |
| Publishes | Participation | Membership and Roster data for RSVP and Attendance |
| Publishes | Communication | Membership and Role data for Announcement targeting |

## Related

- [Ubiquitous Language](../ubiquitous-language.md)
- [Context Map](../context-map.md)
