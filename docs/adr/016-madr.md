# ADR-016: Markdown Any Decision Records (MADR)

## Status

Accepted

## Context and Problem Statement

Decisions made in chat, meetings, or inline comments evaporate. Months later a contributor cannot tell why the service chose Postgres over DynamoDB, whether the call was deliberate or expedient, or what forces drove it — so the team re-debates, re-decides, or silently drifts. We need a format for capturing architectural decisions as a numbered sequence of short markdown documents stored next to the code, reviewed through the same PR mechanism as code, with a fixed section layout so a reader can scan Context / Options / Decision / Consequences in seconds.

## Decision Drivers

- Traceability: every architectural decision has a durable, numbered, cross-referenceable record in version control
- PR-reviewed: proposals and approvals happen through the same mechanism as code review
- Immutability: `Accepted` ADRs are not edited after merge; new decisions replace old ones with a `Superseded by` link
- Machine-readability: fixed section layout enables tooling, search, and cross-referencing via `ADR-NNN` identifiers

## Considered Options

- MADR (Markdown Any Decision Records) in `docs/adr/` with numbered files and required section layout
- Confluence/Notion pages (not co-located with code, not PR-reviewed)
- RFC process (heavier, better suited for public proposals)
- Inline comments in code (no single authoritative location, hard to search)

## Decision Outcome

We will store ADRs in `docs/adr/` following the MADR format. Each file is named `NNN-short-title.md` with a three-digit zero-padded monotonic sequence number. Every ADR includes `## Status`, `## Context and Problem Statement`, `## Considered Options`, `## Decision Outcome`, and `## Consequences` sections. `Accepted` ADR bodies are immutable after merge. Superseded ADRs have their `## Status` updated to `Superseded by ADR-NNN` in the same PR that introduces the replacement. An index `README.md` lists all ADRs by number, title, and status. ADRs are proposed via pull request and reviewed through the PR mechanism.

## Consequences

- Positive: all architectural decisions are discoverable, cross-referenceable, and stored with the code they describe
- Positive: PR-review mechanism provides a natural debate-and-approval workflow
- Negative: requires discipline to write and update ADRs on every significant decision
- Negative: immutability of `Accepted` ADRs means corrections require new ADRs rather than edits
- Neutral: architectural decisions made only in Slack, Notion, or comments are insufficient under this decision
