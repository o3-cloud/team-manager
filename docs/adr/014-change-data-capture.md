# ADR-014: Change Data Capture

## Status

Accepted

## Context and Problem Statement

The team needs a standard pattern for propagating database mutations to downstream systems. Without shared conventions, teams poll with timestamps that miss deletes, stream deltas without a baseline snapshot, publish mixed-table events that are impossible to replay correctly, and leave replication slots orphaned — producing inconsistent replicas, silent data loss, and storage-exhaustion incidents. We need rules that keep CDC pipelines correct, recoverable, and operationally safe.

## Decision Drivers

- Completeness: log-based capture (WAL) captures inserts, updates, and deletes without polling gaps
- Consistency: a full initial snapshot before incremental changes prevents baseline drift
- Operational safety: monitoring replication slot lag and cleaning up orphaned slots prevents storage exhaustion
- Consumer reliability: idempotent consumers handle at-least-once delivery; durable position tracking enables safe restarts

## Considered Options

- Log-based CDC (WAL for PostgreSQL) via a CDC connector (Debezium, etc.) with per-table topics
- Timestamp-column polling (misses deletes, gaps on concurrent updates)
- Database triggers writing to outbox tables
- Application-level event publishing (dual-write, no atomic guarantee)

## Decision Outcome

We will use log-based capture (WAL for PostgreSQL) as the preferred CDC method. Timestamp-column polling is only acceptable when log access is unavailable, and must explicitly account for missed deletes. Before streaming incremental changes, a consistent transaction-level initial snapshot of each source table is captured. Every change event includes the operation type, full before- and after-image, and a monotonically increasing position identifier (LSN). Each source table publishes to its own dedicated topic or stream. All consumers are idempotent. Replication slot lag is monitored with an alert before it threatens source storage. Orphaned slots and consumer group offsets are released when consumers are decommissioned. Change event schemas are versioned with backward-compatible evolution enforced. The last-processed position is stored in durable transactional storage on the consumer side.

## Consequences

- Positive: log-based capture is complete (captures all DML including deletes) and has minimal source-side overhead
- Positive: per-table topics make streams independently replayable and scalable
- Negative: log-based capture requires database-level privileges (replication role) and connector infrastructure
- Negative: replication slot management adds an operational responsibility
- Neutral: timestamp-column polling and CDC as a synchronous API are forbidden as primary patterns
