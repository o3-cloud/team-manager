import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { AppModule } from '../../src/app.module';

let container: StartedPostgreSqlContainer;
let app: INestApplication;

export async function createTestApp(): Promise<{ app: INestApplication; dbUrl: string }> {
  container = await new PostgreSqlContainer('postgres:18-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .start();

  const dbUrl = container.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-integration-tests';

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  return { app, dbUrl };
}

export async function teardownTestApp(): Promise<void> {
  await app?.close();
  await container?.stop();
}
