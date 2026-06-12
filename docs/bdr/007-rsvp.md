# BDR-007: RSVP to Events

## Status

Proposed

## Behavior

Players and parents can submit an RSVP status — Going, Not Going, or Maybe — for any scheduled team event, and coaches can view the aggregated responses.

## Context

Coaches need to know how many players will show up to plan practices and game lineups. Players and parents need a simple way to communicate availability without separate messages or calls.

## Acceptance Criteria

1. A player can submit an RSVP of Going, Not Going, or Maybe for a team event, and that response is stored and retrievable.
2. A parent can submit an RSVP on behalf of a linked player for a team event, provided that player has a registered user account. A roster entry without a linked user account cannot receive an RSVP; the parent RSVP UI must exclude such entries from the player selector.
3. Submitting a new RSVP for an event a user has already responded to replaces the previous response; only the latest response is retained.
4. A coach/admin can retrieve a list of all RSVP responses for an event, including the responder identity, player name, and status.
5. Team members who have not responded to an event are identifiable as non-respondents in the coach's RSVP view.

## Verification

**Scenario 1 — Player submits RSVP**
- Given a player and a scheduled event
- When the player submits an RSVP of "Going"
- Then the RSVP for that player on that event is returned as "Going"

**Scenario 2 — Parent RSVPs for player**
- Given a parent linked to a player who has a registered user account and a scheduled event
- When the parent submits an RSVP of "Not Going" for their player
- Then the player's RSVP on that event is stored as "Not Going"

**Scenario 2b — Parent's linked player has no user account**
- Given a parent linked to a roster entry that has no registered user account
- When the parent views the RSVP section for an event
- Then that roster entry does not appear in the player selector and cannot be RSVPed for

**Scenario 3 — RSVP update replaces previous**
- Given a player who previously RSVPed "Going" to an event
- When the player submits a new RSVP of "Maybe"
- Then the event RSVP for that player shows "Maybe" and no "Going" entry exists

**Scenario 4 — Coach views all RSVPs**
- Given three players, two of whom have RSVPed
- When the coach fetches RSVPs for the event
- Then the response lists all three players, with statuses for the two who responded and a non-respondent indicator for the third
