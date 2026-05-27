# ADR-031: Testcontainers

## Status

Accepted

## Context and Problem Statement

The integration testing discipline ([ADR-025](025-integration-testing.md)) requires real out-of-process dependencies. Testcontainers is the library that turns this aspiration into a default: a Postgres, NATS, Kafka, or LocalStack — each booted as a throwaway container per test run, wired to the application via a discovered host/port, and torn down at the end. Used carelessly, it becomes the slowest and flakiest part of CI: unpinned images rebase overnight and break the suite on schema-incompatible point releases, shared module-scoped containers leak state between tests, missing `wait_for` strategies let tests hit dependencies before they are ready, and Ryuk disabled "for speed" fills the runner's disk with orphaned containers.

## Decision Drivers

- Realism: the same container image and migrations as production, not a separate test schema
- Isolation: per-test lifecycle scoping prevents state leakage and non-deterministic orderings
- Reliability: explicit wait strategies ensure dependencies are actually ready before tests connect
- Reproducibility: image digest pinning prevents overnight image rebases from breaking the suite

## Considered Options

- Testcontainers (official language bindings, published modules for Postgres, Kafka, etc.) with image digest pinning
- Docker Compose with a shared container pool for all tests (state leakage risk)
- In-memory fakes (SQLite for Postgres, embedded broker) — violates the integration testing discipline
- Hand-rolled `subprocess.run(["docker", ...])` in test setup

## Decision Outcome

We will use the official Testcontainers binding for the project language. Published modules (`PostgreSQLContainer`, `KafkaContainer`, etc.) are preferred over `GenericContainer`. Every container image is referenced by digest or a specific immutable tag — floating tags are forbidden. The Testcontainers library and Ryuk reaper image versions are both pinned in the project lockfile. Container lifecycle is scoped to the smallest unit needed (function for full isolation, module/session only when boot cost dominates and tests prove clean shared state). An explicit `wait_for` strategy is required on every container. Host and mapped port are read from the container instance at connection time — no hardcoded ports. The Ryuk reaper is left enabled. Testcontainers tests run in a separate tagged target so unit tests can run without Docker.

## Consequences

- Positive: throwaway containers per test run provide genuine isolation with production-identical dependencies
- Positive: official published modules encode correct wait strategies and default ports so teams do not re-implement them
- Positive: Ryuk ensures orphaned containers are cleaned up even when tests crash
- Negative: cold-starting containers adds 5–30 seconds per suite; lifecycle scoping and caching are required to keep CI fast
- Negative: requires Docker or a compatible runtime on every CI runner and developer machine
- Neutral: hand-rolled `docker` subprocesses, unpinned floating image tags, and `TESTCONTAINERS_RYUK_DISABLED=true` in CI without documentation are forbidden
