# BDR-012: Team Joining / Invitations

## Status

Proposed

## Behavior

A coach/admin can invite a user to join a team via an invite link or code, and the invited user can accept the invitation to become a team member with the assigned role.

## Context

Teams are only useful when all stakeholders are on them. Players and parents do not create teams — they join ones that coaches set up. An invite mechanism is the controlled path by which a coach grants access to the right people without opening team data to anyone with an account.

## Acceptance Criteria

1. A coach/admin can generate an invite for a specific role (player or parent); the invite produces a link or code that can be shared with the intended recipient.
2. A registered user who follows a valid, unexpired invite link or submits a valid invite code is added to the team with the role specified in the invite.
3. An invite that has already been accepted or has passed its expiry is rejected; the user is not added to the team.
4. A coach/admin can revoke a pending invite before it is accepted; a revoked invite is subsequently rejected if used.
5. A user who is already a member of the team cannot join again via a new invite; the duplicate membership is rejected.

## Verification

**Scenario 1 — Successful invite acceptance**
- Given a coach who generates a player-role invite
- When a registered user accepts the invite via the provided link or code
- Then the user appears in the team roster with the player role

**Scenario 2 — Expired invite rejected**
- Given an invite that has passed its expiry time
- When a user attempts to accept it
- Then the system returns an error and the user is not added to the team

**Scenario 3 — Revoked invite rejected**
- Given a coach who revokes a pending invite
- When a user attempts to use that invite
- Then the system returns an error and the user is not added to the team

**Scenario 4 — Duplicate membership rejected**
- Given a user who is already a member of the team
- When they attempt to accept a new invite to the same team
- Then the system returns an error and the existing membership is unchanged
