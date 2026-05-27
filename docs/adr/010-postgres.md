# ADR-010: PostgreSQL

## Status

Accepted

## Context and Problem Statement

The team needs a primary relational database. Schema and convention choices made at project start are binding when the table has billions of rows, the team has tripled, and zero-downtime deploys are non-negotiable. Painful failure modes — `timestamp` columns that drop time zones, `NOT NULL` added to a hot table in a single migration, orphan rows from skipped foreign keys, application code connecting as superuser, ad-hoc DDL from a developer's `psql` session — are not Postgres bugs but the result of conventions not enforced early. We need rules covering schema design, migrations, query patterns, and connection management so the database remains evolvable under load and deploys stay zero-downtime.

## Decision Drivers

- Correctness: `timestamptz` over `timestamp`, foreign keys, `CHECK` constraints, and boolean types prevent silent data corruption
- Zero-downtime deploys: backwards-compatible migrations, multi-step `NOT NULL` additions, and deprecation-period column renames
- Security: least-privilege application roles, secret-manager-sourced credentials, TLS-enforced connections, connection pooling
- Observability: `pg_stat_statements`, query metrics, and Postgres log forwarding to the central observability store ([ADR-005](005-openobserve.md))

## Considered Options

- PostgreSQL with version pinning, migration tooling, and the full zero-downtime migration discipline
- MySQL/MariaDB
- CockroachDB or PlanetScale (distributed SQL)
- MongoDB or another document store (rejected: team needs relational guarantees)

## Decision Outcome

We will use PostgreSQL as the primary relational database. The major version is pinned per project. Production runs on a managed service or documented HA topology with automated backups. TLS is required on all non-localhost connections. All DDL goes through a migrations tool; no ad-hoc production DDL. Every time column uses `timestamptz`. String columns default to `text`. Foreign keys declare explicit `ON DELETE`/`ON UPDATE` actions. Every mutable table has `created_at`/`updated_at timestamptz` columns. Migrations are backwards-compatible with the previously deployed application version. `NOT NULL` additions follow the multi-step pattern. All queries use parameterized statements. Application code connects through a service-specific least-privilege role via a connection pooler. Credentials come from a secret manager.

## Consequences

- Positive: zero-downtime migrations allow deploying schema changes independently of application deploys
- Positive: least-privilege roles and connection pooling limit blast radius of a compromised service
- Positive: `pg_stat_statements` and forwarded logs provide query-level observability
- Negative: multi-step migration patterns require more migration files per schema change
- Negative: connection pooler (PgBouncer or equivalent) is an additional infrastructure dependency
- Neutral: ad-hoc DDL in production and direct superuser connections from application code are forbidden
