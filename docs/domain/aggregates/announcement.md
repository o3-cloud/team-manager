# Announcement Aggregate

## Purpose

A coach-authored message broadcast to a targeted audience within a Team. Supports role-based visibility filtering so players and parents each see only the messages relevant to them.

## Aggregate Root

`Announcement`

## Entities

_(none — Announcement is a single entity)_

## Value Objects

- `AnnouncementAudience` — `PLAYERS` | `PARENTS` | `ALL`
- `UrgencyFlag` — boolean; urgent announcements are distinguishable in the feed

## Invariants

- Only COACH (and eligible staff per BDR-014) may create Announcements.
- An Announcement targeted to `PLAYERS` must not be visible to Members whose only Role is `PARENT`.
- An Announcement targeted to `PARENTS` must not be visible to Members whose only Role is `PLAYER`.
- An `ALL` Announcement is visible to every Member regardless of Role.

## Commands

| Command | Description | Emits |
|---|---|---|
| PostAnnouncement | Creates a new Announcement with body, audience, and optional urgency | `AnnouncementPosted` |

## Related

- [Communication Context](../bounded-contexts/communication.md)
- [AnnouncementPosted Domain Event](../domain-events/announcement-posted.md)
- [Ubiquitous Language](../ubiquitous-language.md)
