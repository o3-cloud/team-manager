# ADR-005: OpenObserve

## Status

Accepted

## Context and Problem Statement

The team needs an observability backend to store and query logs, metrics, and traces. Correlation across signal types only works when every service emits well-structured OpenTelemetry data with standard resource attributes and consistent stream naming — the moment a service writes bespoke HTTP payloads, hardcodes credentials, drops `service.name`, or lets metric cardinality explode, dashboards break, alerts go silent, and multi-tenant separation leaks. We need rules governing how applications produce telemetry and how OpenObserve state is managed so the store remains a single coherent query surface.

## Decision Drivers

- OTLP-native: accepts traces, metrics, and logs over the standard OTLP protocol without vendor lock-in
- SQL and PromQL query surface: correlates signal types via trace ID using a single query language
- Self-hostable: can run on-premise or cloud without a SaaS contract
- Alignment with OpenTelemetry ([ADR-006](006-opentelemetry.md)): the team already instruments with OTel SDK

## Considered Options

- OpenObserve (OTLP-native, SQL/PromQL, self-hostable)
- Grafana stack (Loki + Tempo + Mimir) with OTLP ingestion
- Datadog or New Relic (SaaS, high cost, vendor lock-in)
- Elasticsearch / OpenSearch with custom ingestion pipelines

## Decision Outcome

We will use OpenObserve as the observability backend. Telemetry is emitted exclusively via the OpenTelemetry SDK (never bespoke HTTP payloads), the OTLP endpoint is configured via `OTEL_EXPORTER_OTLP_ENDPOINT`, credentials are injected through `OTEL_EXPORTER_OTLP_HEADERS` (never hardcoded), every service declares `service.name`, `service.version`, and `deployment.environment` resource attributes, logs are structured records with trace/span ID correlation, dashboards and alerts are defined as API payloads in version control, and stream retention policies are set explicitly.

## Consequences

- Positive: single query surface for logs, metrics, and traces correlated by trace ID
- Positive: no SaaS dependency or per-seat/per-GB pricing at scale
- Positive: VRL pipelines enable ingest-time enrichment without application-side reformatting
- Negative: self-hosting requires operational investment (upgrades, storage, availability)
- Negative: OpenObserve SQL query syntax has a learning curve compared to Grafana's visual builder
- Neutral: bespoke HTTP payloads, hardcoded credentials, and high-cardinality metric labels are forbidden
