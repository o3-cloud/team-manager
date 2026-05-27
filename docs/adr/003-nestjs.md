# ADR-003: NestJS

## Status

Accepted

## Context and Problem Statement

The team needs an HTTP framework for TypeScript services. NestJS encodes an opinionated module/controller/provider architecture through decorators and dependency injection, offering testable handlers, uniform validation, consistent error envelopes, generated OpenAPI, and swappable implementations. These properties only hold when the framework primitives are used as intended: when controllers embed business logic, services are instantiated with `new`, auth checks live inside route handlers, DTOs become plain interfaces, or configuration is read directly from `process.env`, the framework's guarantees silently evaporate.

## Decision Drivers

- TypeScript-native: first-class decorator and metadata-reflection support
- Testability: DI container enables unit testing without spinning up the full HTTP stack
- Consistency: uniform validation pipeline, error envelopes, and OpenAPI generation reduce per-endpoint boilerplate
- Existing team familiarity and ecosystem maturity

## Considered Options

- NestJS with idiomatic module/controller/provider patterns
- Express or Fastify with hand-rolled architecture
- Hono or Elysia (lightweight alternatives)
- Koa with manual middleware composition

## Decision Outcome

We will use NestJS as the HTTP framework for all services. Code is organized into `@Module()` feature modules; business logic lives in `@Injectable()` services; controllers translate transport to service calls; all dependencies are injected via constructor DI; request validation uses class-validator DTOs with a global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`); errors are thrown as `HttpException` subclasses and shaped by a global `ExceptionFilter`; authorization decisions live in `Guards`; cross-cutting concerns live in `Interceptors`; configuration is read through `ConfigService`; OpenAPI is generated from `@nestjs/swagger` decorators; and operational output goes through the Nest `Logger`.

## Consequences

- Positive: consistent, testable architecture across all services; OpenAPI always reflects the real surface
- Positive: DI enables swapping implementations (e.g. repository in tests) without source changes
- Negative: NestJS decorator overhead and metadata-reflection compilation add build-time cost
- Negative: the opinionated structure is unfamiliar to developers accustomed to micro-frameworks
- Neutral: `process.env` reads, `new Service()`, and inline auth logic are forbidden by this decision
