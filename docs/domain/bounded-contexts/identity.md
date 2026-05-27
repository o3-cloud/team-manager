# Identity Context

## Purpose

Manages User account creation and authentication. Provides a verified identity that all other contexts use as the anchor for a Member's access.

## Responsibilities

- Accept new User registrations (email + password)
- Enforce password strength requirements and unique email constraint
- Authenticate Users and issue session credentials
- Emit `UserRegistered` for downstream contexts to create their own projections

## Out of Scope

- Team membership or roles (owned by [Team context](team.md))
- Profile data beyond authentication credentials
- Social login or third-party OAuth

## Key Concepts

| Concept | Type | Description |
|---|---|---|
| User | Aggregate Root | An authenticated identity with email and hashed password |
| Email | Value Object | Unique, case-insensitive identifier for a User |
| Password | Value Object | Validated to meet minimum length; stored as hash |

## Integrations

| Direction | Other Context | Mechanism |
|---|---|---|
| Publishes | Team | `UserRegistered` domain event |

## Related

- [Ubiquitous Language](../ubiquitous-language.md)
- [Context Map](../context-map.md)
