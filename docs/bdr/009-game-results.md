# BDR-009: Game Results

## Status

Proposed

## Behavior

A coach/admin can record the score, outcome, and optional notes for a completed game, and all team members can view the results and season record.

## Context

Capturing game outcomes gives the team a historical record of performance. A win/loss/tie record helps coaches and players track progress across a season, and game notes provide context beyond the final score.

## Acceptance Criteria

1. A coach/admin can record a score (own team score and opponent score) and optional notes for a game-type event; the result is stored and visible to all team members.
2. The system derives the outcome (win, loss, or tie) from the recorded scores and returns it alongside the result.
3. The season record (total wins, losses, and ties) updates to reflect each new game result and is accessible to all team members.
4. A coach/admin can update a previously recorded result; the updated score, outcome, and season record are reflected immediately.
5. Scores may only be recorded for events of type "game"; attempts to record scores for practice or other event types are rejected.

## Verification

**Scenario 1 — Record a win**
- Given a game event and a coach/admin
- When the coach records a score of 3–1 in favor of the home team
- Then the result endpoint returns a score of 3–1 with an outcome of "win"

**Scenario 2 — Season record updates**
- Given a team with one prior recorded win and no losses
- When the coach records a new loss (score 0–2)
- Then the season record shows 1 win and 1 loss

**Scenario 3 — Update result**
- Given a previously recorded result of 2–0
- When the coach updates the score to 2–1
- Then the result endpoint returns the updated score and the season record adjusts accordingly

**Scenario 4 — Non-game event rejected**
- Given a practice event
- When the coach attempts to record a score for it
- Then the system returns an error and no result is stored

**Scenario 5 — Member views results**
- Given a player on the team
- When they fetch game results
- Then they receive the list of recorded results including scores, outcomes, and notes
