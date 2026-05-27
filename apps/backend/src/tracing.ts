import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { metrics, NodeSDK } from '@opentelemetry/sdk-node';

const { PeriodicExportingMetricReader } = metrics;

const otlpBase = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:15080/api/default';
const otlpUser = process.env.OTEL_EXPORTER_OTLP_USER;
const otlpPass = process.env.OTEL_EXPORTER_OTLP_PASSWORD;
const otlpHeaders: Record<string, string> =
  otlpUser && otlpPass
    ? { Authorization: `Basic ${Buffer.from(`${otlpUser}:${otlpPass}`).toString('base64')}` }
    : {};
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'team-manager-backend';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: `${otlpBase}/v1/traces`,
    headers: otlpHeaders,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${otlpBase}/v1/metrics`,
      headers: otlpHeaders,
    }),
    exportIntervalMillis: 30000,
  }),
  logRecordProcessor: new BatchLogRecordProcessor(
    new OTLPLogExporter({
      url: `${otlpBase}/v1/logs`,
      headers: otlpHeaders,
    }),
  ),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
    }),
  ],
  serviceName,
});

try {
  sdk.start();
  logs.getLogger(serviceName).emit({
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: `OpenTelemetry SDK started — traces, metrics, logs exporting to ${otlpBase}`,
  });
} catch (err) {
  console.error('Failed to start OpenTelemetry SDK:', err);
}

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
