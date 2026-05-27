# BDR-013: Season Management

## Status

Proposed

## Behavior

A coach/admin can create and archive seasons for a team; each season maintains its own schedule, roster, and win/loss record, while historical seasons remain accessible and read-only.

## Context

Sports teams operate in discrete seasons. Mixing schedules and records across seasons makes historical data ambiguous and clutters the active view. Season boundaries let coaches start fresh each year while preserving prior records for reference.

## Acceptance Criteria

1. A coach/admin can create a new season for a team with a name and date range; the season becomes the active season and new events, results, and roster changes are scoped to it.
2. A team can have only one active season at a time; attempting to create a second active season is rejected.
3. A coach/admin can archive the active season; once archived, the season's schedule, roster, and record are readable but no new events or results can be added to it.
4. The win/loss/tie record for a season is isolated to that season; archiving a season and starting a new one begins the record at 0–0–0.
5. All team members can view the record and schedule of any past archived season.

## Verification

**Scenario 1 — Create a season**
- Given a team with no active season
- When a coach creates a season with a name and date range
- Then the season is returned as active and subsequent events created for the team are scoped to it

**Scenario 2 — Duplicate active season rejected**
- Given a team with an existing active season
- When the coach attempts to create another active season
- Then the system returns an error and the existing active season is unchanged

**Scenario 3 — Archive season makes it read-only**
- Given an active season with one recorded game result
- When the coach archives the season
- Then attempting to add a new event or record a result to that season returns an error, while the existing result remains readable

**Scenario 4 — New season starts fresh record**
- Given an archived season with a record of 3 wins and 1 loss
- When the coach creates a new active season and records one game result
- Then the new season's record shows only the result from the new season

**Scenario 5 — Members can read archived seasons**
- Given a player on a team with one archived and one active season
- When the player fetches the archived season's schedule and record
- Then the system returns HTTP 200 with the historical data
