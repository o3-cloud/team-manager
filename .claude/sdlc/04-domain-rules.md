# Context Pack 04 — Domain Rules

> Layer 5 (Domain). Team-manager domain. Source of truth: `docs/domain/`.

## Domain vocabulary

| Term | Meaning |
|------|---------|
| Team | Central organizing unit. All schedules, rosters, announcements, results belong to a team. Created by a Coach. |
| Member | A registered User who belongs to a Team under a specific Role. One User may belong to multiple Teams. |
| Role | `COACH` · `ASSISTANT_COACH` · `TEAM_MANAGER` · `SCOREKEEPER` · `PLAYER` · `PARENT`. Determines write permissions. |
| Coach | Member with `COACH` role. Full write access. Automatically assigned to team creator. |
| Player | Member with `PLAYER` role. Read and RSVP access. |
| Parent | Member with `PARENT` role. Can RSVP on behalf of linked Players. |
| Roster | List of Player profiles managed by coaching staff. Distinct from Membership. |
| RosterEntry | Single Player record: name, jersey number, position. At most one per Player per Team. |
| Season | Named date range scoping Events, Results, and win/loss record. Only one active at a time. |
| Active Season | Current non-archived Season. New Events and Results scoped to it. |
| Archived Season | Read-only past Season. |
| Event | Scheduled team activity: `GAME` · `PRACTICE` · `MEETING` · `OTHER`. Belongs to a Season. |
| EventStatus | `SCHEDULED` (default) or `CANCELLED`. |
| RecurringEventSeries | Template generating individual Event instances on a repeating schedule. Each instance is independent. |
| RSVP | Member's declared intent: `GOING` · `NOT_GOING` · `MAYBE`. Latest response only retained. |
| Attendance | Post-event record: `PRESENT` or `ABSENT`. Only recordable for past Events. |
| GameResult | Score, outcome (win/loss/tie), optional notes for a completed GAME Event. |
| Season Record | Aggregate win/loss/tie counts, recomputed from GameResults. Resets on new Season. |
| Announcement | Coach-authored message to `PLAYERS` · `PARENTS` · `ALL`. May be marked urgent. |
| Notification | In-app alert with `READ`/`UNREAD` state. Per-Member, not shared. |
| Invite | Time-limited, role-scoped token granting team membership. May be revoked before acceptance. |
| Version | Optimistic-concurrency counter on Event. Required on PATCH and cancellation; mismatch → HTTP 409. |
| Overlap Warning | Non-blocking alert when a new/edited Event overlaps another on the same team. |

**Avoid:** "User" (use Member in team context), "Admin" (use Coach), "Staff" (use Coaching Staff).

## Business invariants

- Only one active Season per Team at a time.
- Archived Seasons are read-only (no new Events, no Results changes).
- RSVP writes are blocked on `CANCELLED` Events; preserved RSVPs remain readable.
- Attendance writes require `Event.startsAt` in the past AND `Event.status = SCHEDULED`. Coaches may correct prior records.
- `GameResult` may only be recorded for `GAME`-type Events.
- `Event.version` must be provided and match on PATCH and cancellation.
- A RosterEntry can exist without a corresponding User account.
- At most one RosterEntry per Player per Team.
- A Notification is per-Member — marking it read affects only that Member's record.

## Valid & invalid states

| Entity | Valid states | Transitions |
|--------|-------------|-------------|
| Event | `SCHEDULED` → `CANCELLED` → `SCHEDULED` (reinstatement) | Cancel requires version match |
| Season | active → archived | Only one active at a time |
| RSVP | any of `GOING / NOT_GOING / MAYBE`; only latest retained | Blocked when Event is `CANCELLED` |
| Notification | `UNREAD` → `READ` | No reversal |
| Invite | pending → accepted or revoked | Cannot be accepted after revocation |

## Domain workflows

**RSVP gate:** Submissions blocked on `CANCELLED` Events (HTTP 422). Lifted on `EventReinstated`.

**Attendance gate:** Both guards independent — temporal (`startsAt` past) and status (`SCHEDULED`) must pass. Corrections are subject to the same guards.

**Notification delivery:** One `Notification` record per Member per trigger event. Triggers:
- `AnnouncementPosted` → audience-targeted Members.
- `EventUpdated` / `EventCancelled` / `EventReinstated` / `GameResultRecorded` → all Team Members.
- Reminder timer → all Members with the Event on their schedule.

**Context map (upstream → downstream):**
- Identity → Team (Open Host Service / `UserRegistered`)
- Team → Schedule / Participation / Communication (Customer-Supplier, supplies Season scope and role auth)
- Schedule → Participation / Communication (Published Language — `EventCreated`, `EventUpdated`, `EventCancelled`, `EventReinstated`)
- Results → Communication (Published Language — `GameResultRecorded`)
- Results → Schedule (Conformist — game-type Events only)

## Data classification

- **PII:** user email, display name — never log; handle per privacy obligations.
- **Credentials:** JWT secret, DB URL, OTel auth — environment variables only; no fallback literals in source.
- **Team content:** event details, announcements, game results — team-scoped; no cross-team leakage.

## Known domain edge cases

- A RecurringEventSeries instance is an independent Event; cancelling one instance does not cancel the series.
- Overlap Warning is non-blocking — the Event is created even if an overlap exists.
- Parent may RSVP on behalf of linked Players; the RSVP records the acting Member.
- Version mismatch on Event PATCH returns HTTP 409 — client must re-fetch before retrying.
- Reminder window timing is an open question (not yet specified in any BDR).
