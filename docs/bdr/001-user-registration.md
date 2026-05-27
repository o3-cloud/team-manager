# BDR-001: User Registration

## Status

Verified

## Behavior

A visitor can create an account with an email and password to access Team Manager.

## Context

Every role in the system — coach, player, parent — requires a verified identity before accessing team data. Without registration, no personalized experience, role assignment, or secure communication is possible.

## Acceptance Criteria

1. A visitor who submits a valid email and password receives confirmation that their account was created and can subsequently log in.
2. A visitor who submits an email address already registered receives an error indicating the email is taken; no duplicate account is created.
3. A visitor who submits a password below the minimum length requirement receives a validation error before the account is created.
4. A newly registered user who has not yet joined or created a team sees an empty state prompting them to create or join a team.

## Verification

**Scenario 1 — Successful registration**
- Given a visitor who has no existing account
- When they submit a unique email and a valid password
- Then the system returns HTTP 201 (or equivalent success) and the user can log in with those credentials

**Scenario 2 — Duplicate email**
- Given an email address already associated with an existing account
- When a visitor attempts to register with that same email
- Then the system returns an error response indicating the email is already in use and creates no new account

**Scenario 3 — Weak password**
- Given a visitor submitting a password shorter than the minimum required length
- When the registration form is submitted
- Then the system returns a validation error before persisting any data

**Scenario 4 — Empty state after registration**
- Given a newly registered user with no team memberships
- When they log in and navigate to the home screen
- Then the UI displays a prompt to create or join a team and shows no team data
