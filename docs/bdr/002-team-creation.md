# BDR-002: Team Creation

## Status

Proposed

## Behavior

An authenticated user can create a new team and becomes its Head Coach.

## Context

A team is the central organizing unit of the application. All other features — rosters, schedules, announcements — belong to a team. At least one coach must exist to set up and manage the team.

## Acceptance Criteria

1. An authenticated user who submits a valid team name receives confirmation that the team was created and is listed in their team dashboard.
2. The creator is automatically assigned the `coach` role for the newly created team.
3. A team name that is blank, consists entirely of whitespace, or exceeds 100 characters after trimming leading and trailing whitespace is rejected with a validation error; no team is created. Team names are stored verbatim as Unicode plain text with no server-side transformation.
4. A user can create more than one team and each appears independently in their team list.
5. A team name must be unique per user, case-insensitively. A second team whose name differs only in case from an existing team owned by the same user must be rejected with a 409 response.
6. A user may only read teams they are a member of; requests for teams the user does not belong to return 403.

## Verification

**Scenario 1 — Successful team creation**
- Given an authenticated user
- When they submit a valid team name
- Then the system returns a success response and the new team appears in their team list with them as coach

**Scenario 2 — Creator assigned coach role**
- Given an authenticated user who just created a team
- When the team detail is fetched
- Then the creator's membership record shows the `coach` role

**Scenario 3 — Blank team name**
- Given an authenticated user
- When they submit a team creation request with a blank team name
- Then the system returns a validation error and no team is persisted

**Scenario 4 — Whitespace-only team name**
- Given an authenticated user
- When they submit a team name consisting entirely of whitespace
- Then the system returns a validation error and no team is persisted

**Scenario 5 — Team name too long**
- Given an authenticated user
- When they submit a team name exceeding 100 characters
- Then the system returns a validation error and no team is persisted

**Scenario 6 — Multiple teams**
- Given an authenticated user who already owns one team
- When they create a second team with a different name
- Then both teams appear in their team list as separate entries

**Scenario 7 — Duplicate name same user**
- Given an authenticated user who already owns a team named "U12 Red"
- When they attempt to create another team named "u12 red"
- Then the system returns a 409 response and no team is persisted

**Scenario 8 — Duplicate name different user**
- Given two different users each with no team named "U12 Red"
- When each creates a team named "U12 Red"
- Then both teams are created successfully; uniqueness is scoped per user

**Scenario 9 — IDOR protection**
- Given an authenticated user who is not a member of a team
- When they request that team by ID
- Then the system returns 403 and no team data is disclosed
