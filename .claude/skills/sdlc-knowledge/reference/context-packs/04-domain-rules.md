# Context Pack 04 — Domain Rules

> Layer 5 (Domain). Reusable across many features in the same business domain.

## Domain vocabulary

| Term | Definition |
|---|---|
| Team | An organization unit (sports team, club). Has an `ownerId`. |
| Membership | A user's affiliation to a team with a role (COACH, PLAYER, PARENT). |
| Invite | A single-use bearer credential that grants membership when accepted. Has a 72-hour TTL. |
| Season | A time-bounded competition period for a team. |
| Event | A scheduled occurrence (game, practice, meeting) belonging to a team or season. |
| RSVP | A user's attendance intention for an event (YES / NO / MAYBE). |

## Business invariants

- A user may hold exactly one membership per team.
- An Invite token is a bearer credential — knowing the token is sufficient to accept it. It must be hashed at rest.
- The raw Invite token MUST be returned exactly once (on `POST /teams/:id/invites` creation) and never again — not in list responses, not in GET single-invite, not in revoke responses.
- An accepted Invite cannot be revoked (status transition ACCEPTED → REVOKED is not allowed; return 409).
- An already-revoked Invite may be re-revoked (DELETE is idempotent for the REVOKED status; return 200 with the invite body).
- Team membership check MUST occur AFTER resource existence check: 404 before 403. Never return 403 for a team that does not exist.
- Team names must not contain HTML or SQL metacharacters (`< > ' " ; &`). Enforce with `@Matches`.
- A blank (whitespace-only) team name is a client error (400), not a conflict (409).

## Valid & invalid states

### Invite lifecycle
```
PENDING → ACCEPTED  (via POST /invites/:token/accept — once only)
PENDING → REVOKED   (via DELETE /teams/:teamId/invites/:inviteId — idempotent)
ACCEPTED → *        (no further transitions; DELETE returns 409)
REVOKED → REVOKED   (DELETE is a no-op; return 200 with body)
```

## Decision rules & domain workflows

### Invite creation
1. Generate 32 cryptographically random bytes → 64-hex raw token.
2. Compute `SHA-256(rawToken)` → 64-hex `tokenHash`.
3. Store only `tokenHash` in DB.
4. Return `{ ...publicFields, token: rawToken }` — one time only.

### Invite acceptance
1. Receive raw token from caller.
2. Compute `SHA-256(rawToken)` to get `lookupHash`.
3. `findOneBy({ tokenHash: lookupHash })` — 404 if not found.
4. Validate PENDING + not expired → create Membership.

### Team access guard ordering
```
1. findOne(teamId) → NotFoundException if null (404)
2. findMembership(teamId, userId) → ForbiddenException if null (403)
```

## Data classification

| Field | Classification | Rule |
|---|---|---|
| `invite.tokenHash` | Secret (hashed) | Never include in any response (not even hashed form) |
| `invite.token` (raw, ephemeral) | Secret | Return only in creation response; never log |
| `user.passwordHash` | Secret | Never serialize |
| `user.email` | PII | Do not log at INFO level |

## Known domain edge cases

| ID | Edge case | Expected behavior |
|---|---|---|
| EC-1 | Accept invite with a SHA-256 hash string (attacker submits hash directly) | 404 — `SHA-256(hashString) ≠ storedHash` unless attacker knows pre-image |
| EC-2 | Team UUID that is syntactically invalid (not a UUID) | 400 — requires `ParseUUIDPipe` on route param before hitting service |
| EC-3 | Double-accept (ACCEPTED invite re-accepted) | 410 Gone — "Invite has already been used or revoked" |
| EC-4 | Revoke ACCEPTED invite | 409 — "Invite is not pending" |
| EC-5 | Emoji / Unicode in team name | Accepted — `@Matches(/^[^<>'";&]+$/)` does not block Unicode |
| EC-6 | Ampersand in team name (e.g., "Boys & Girls") | 400 — `&` is in the blacklist |

> Updated: api-contract-fixes run, 2026-05-27. Fills in domain rules from F-1 through F-5 fixes.
