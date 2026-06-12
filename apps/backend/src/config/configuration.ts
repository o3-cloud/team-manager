export const configuration = () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  database: {
    url:
      process.env['DATABASE_URL'] ?? 'postgres://team-manager:password@localhost:5432/team-manager',
  },
  jwt: {
    secret: (() => {
      const s = process.env.JWT_SECRET;
      if (!s) throw new Error('JWT_SECRET environment variable is required');
      return s;
    })(),
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  },
  otel: {
    endpoint: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:15080/api/default',
  },
});
