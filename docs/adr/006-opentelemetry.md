# ADR-006: OpenTelemetry

## Status

Accepted

## Context and Problem Statement

The team needs a standard for producing and shipping observability data (traces, metrics, logs). OpenTelemetry's value depends on every service emitting data the same way: standard SDKs, standard resource attributes, standard semantic conventions, and W3C trace context across process boundaries. When a service writes a custom exporter, hardcodes endpoints, invents its own attribute names, or drops trace context at an RPC boundary, data stops correlating and any backend becomes a pile of differently-shaped event streams. We need to pin how applications instrument themselves so traces stitch together, metrics aggregate cleanly, and logs join back to the spans that produced them.

## Decision Drivers

- Vendor neutrality: OTel is backend-agnostic; changing the backend requires only reconfiguring the OTLP endpoint
- Standardization: semantic conventions ensure consistent attribute names across services and languages
- Correlation: W3C Trace Context propagation enables distributed trace stitching
- Ecosystem: official instrumentation libraries exist for all major Node.js frameworks, databases, and brokers

## Considered Options

- OpenTelemetry SDK (official, vendor-neutral, OTLP)
- Vendor-specific SDKs (Datadog agent, New Relic agent, Dynatrace OneAgent)
- Custom in-house telemetry libraries
- No shared instrumentation standard (each service chooses its own approach)

## Decision Outcome

We will use the official OpenTelemetry SDK for instrumentation in all services. Configuration is via `OTEL_*` environment variables exclusively; endpoints, service names, and credentials are never hardcoded. `OTEL_EXPORTER_OTLP_PROTOCOL` is set explicitly. `service.name`, `service.version`, and `deployment.environment` are declared as resource attributes. W3C Trace Context is the propagation format. Official OTel instrumentation libraries cover inbound/outbound HTTP, gRPC, databases, and brokers. The `TracerProvider`, `MeterProvider`, and `LoggerProvider` are initialized once at process startup. Batching processors are used in production. Sampling is configured explicitly via `ParentBased(TraceIdRatioBased(...))`. Metric instruments match their semantic (Counter, Histogram, etc.). Exporters fail gracefully without crashing the application.

## Consequences

- Positive: switching observability backends requires only an environment variable change, no code changes
- Positive: consistent semantic conventions enable cross-service dashboards and alerts without per-service customization
- Positive: W3C Trace Context enables distributed tracing across services regardless of language
- Negative: OTel SDK initialization adds startup boilerplate and a few milliseconds of overhead
- Negative: the SDK's async batching means telemetry must be explicitly flushed on process shutdown
- Neutral: vendor-specific SDKs and custom exporters are forbidden
