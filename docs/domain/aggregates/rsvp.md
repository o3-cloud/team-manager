# RSVP Aggregate

## Purpose

Records a Member's declared intent to attend a specific Event. Only the latest response is retained per (Member, Event) pair. Parents may submit RSVPs on behalf of linked Players.

## Aggregate Root

`RSVP`

## Entities

_(none — RSVP is a single entity)_

## Value Objects

- `RsvpStatus` — `GOING` | `NOT_GOING` | `MAYBE`

## Invariants

- An RSVP may only reference a `SCHEDULED` Event; submission to a `CANCELLED` Event is rejected (HTTP 422).
- Submitting a new RSVP for an Event the Member has already responded to replaces the prior response; no history is retained.
- A Parent may submit an RSVP only for Players to whom they are linked via the Roster parent-link.
- A non-respondent is distinguishable from a `NOT_GOING` RSVP in the coach RSVP view.

## Commands

| Command | Description | Emits |
|---|---|---|
| SubmitRsvp | Creates or replaces an RSVP for (Member, Event) | `RsvpSubmitted` |

## Related

- [Participation Context](../bounded-contexts/participation.md)
- [Event Aggregate](event.md)
- [Ubiquitous Language](../ubiquitous-language.md)
