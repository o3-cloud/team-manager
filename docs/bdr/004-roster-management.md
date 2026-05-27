# BDR-004: Roster Management

## Status

Proposed

## Behavior

A coach/admin can add players to a team roster, update their profile details, and link a parent/guardian to a player.

## Context

Rosters define who is on a team. Player details like jersey number and position are needed for game-day logistics. Parent links are required so parents can RSVP and receive updates on behalf of their players.

## Acceptance Criteria

1. A coach/admin can add a player to the roster with a name, jersey number, and position; the player appears in the team roster listing.
2. A coach/admin can update an existing player's jersey number, position, or name and the roster reflects the change.
3. A coach/admin can link a registered parent/guardian account to a player; the parent can subsequently view and manage RSVP for that player.
4. A player profile can be linked to at most one team roster entry per team; duplicate additions are rejected.

## Verification

**Scenario 1 — Add player**
- Given a coach/admin on a team with no players
- When they submit a new player with name, jersey number, and position
- Then the player appears in the team roster response

**Scenario 2 — Update player details**
- Given an existing player on the roster
- When the coach updates the player's jersey number to a new value
- Then the roster entry for that player returns the updated jersey number

**Scenario 3 — Link parent to player**
- Given a registered user with the parent role and an existing player on the roster
- When the coach links the parent to that player
- Then the parent's account can fetch and update the RSVP for that player

**Scenario 4 — Duplicate player rejected**
- Given a player already on the roster
- When the coach attempts to add the same player again
- Then the system returns an error and the roster still contains only one entry for that player
