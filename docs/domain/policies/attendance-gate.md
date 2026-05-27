# Attendance Gate Policy

## Trigger

A request to record or update Attendance for an Event.

## Effect

The policy evaluates two conditions before permitting the write:

1. **Temporal guard** — `Event.startsAt` must be in the past. Future-event attendance attempts are rejected.
2. **Status guard** — `Event.status` must be `SCHEDULED`. `CANCELLED` Event attendance attempts are rejected (HTTP 422).

If both conditions pass, the Attendance write proceeds and `AttendanceRecorded` is emitted.

## Owning Context

Participation

## Rules

- Both guards are independent; either can block the write.
- The temporal guard is evaluated against wall-clock time at request receipt.
- A CANCELLED Event remains blocked even if its `startsAt` has passed.
- Coaches may correct a previously recorded mark; the temporal and status guards apply to corrections as well.

## Related

- [AttendanceRecord Aggregate](../aggregates/attendance-record.md)
- [Event Aggregate](../aggregates/event.md)
- [EventCancelled Domain Event](../domain-events/event-cancelled.md)
- [Participation Context](../bounded-contexts/participation.md)
