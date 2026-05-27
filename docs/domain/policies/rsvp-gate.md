# RSVP Gate Policy

## Trigger

A request to submit or update an RSVP for an Event.

## Effect

The policy blocks RSVP writes on `CANCELLED` Events. Existing RSVPs are preserved but no new submission or replacement is permitted (HTTP 422).

## Owning Context

Participation

## Rules

- RSVP writes are allowed on `SCHEDULED` Events regardless of whether `startsAt` is in the past or future.
- On `EventCancelled`, the gate is activated for that Event; no further RSVP writes are accepted.
- On `EventReinstated`, the gate is lifted and RSVP writes resume.
- Preserved RSVPs from before cancellation remain readable by the coach RSVP view.

## Related

- [RSVP Aggregate](../aggregates/rsvp.md)
- [Event Aggregate](../aggregates/event.md)
- [EventCancelled Domain Event](../domain-events/event-cancelled.md)
- [EventReinstated Domain Event](../domain-events/event-reinstated.md)
- [Participation Context](../bounded-contexts/participation.md)
