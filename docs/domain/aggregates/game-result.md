# GameResult Aggregate

## Purpose

Records the final score, derived outcome, and optional notes for a completed Game Event. Feeds into the Season Record (win/loss/tie totals) and is visible to all team members.

## Aggregate Root

`GameResult`

## Entities

_(none — GameResult is a single entity)_

## Value Objects

- `Score` — own-team integer + opponent integer
- `Outcome` — derived: `WIN` (own > opponent) | `LOSS` (own < opponent) | `TIE` (own == opponent)
- `SeasonRecord` — aggregate W/L/T counts for the owning Season; updated on each GameResult write

## Invariants

- A GameResult may only be created for an Event of type `GAME`.
- Recording is blocked for `CANCELLED` Events (HTTP 422).
- The `Outcome` is always derived from scores; it cannot be set directly.
- Updating a GameResult recalculates the SeasonRecord immediately.
- Recording is coach-only (SCOREKEEPER also permitted per BDR-014).

## Commands

| Command | Description | Emits |
|---|---|---|
| RecordGameResult | Creates a new GameResult for a GAME-type Event | `GameResultRecorded` |
| UpdateGameResult | Corrects a previously recorded result; recalculates Season Record | `GameResultRecorded` (updated) |

## Related

- [Results Context](../bounded-contexts/results.md)
- [Season Aggregate](season.md)
- [Event Aggregate](event.md)
- [GameResultRecorded Domain Event](../domain-events/game-result-recorded.md)
- [Ubiquitous Language](../ubiquitous-language.md)
