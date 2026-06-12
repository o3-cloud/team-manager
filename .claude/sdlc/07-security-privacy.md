# Context Pack 07 — Security & Privacy

> Layer 2 (Organization). Security must not depend on the human remembering to ask.

## Security defaults

- Never log secrets, tokens, credentials, or sensitive PII.
- Validate all external inputs (class-validator DTOs + ValidationPipe globally).
- Enforce authorization server-side — never trust client-supplied roles.
- Use least privilege (role-based guards per team membership).
- Do not expose internal errors to users (HttpExceptionFilter wired globally).
- Do not introduce cryptography, authentication, or authorization logic without escalation.
- Classify data before storing, transmitting, or logging it.
- Encode output to prevent injection.

## Privacy obligations

- Handle PII (email, display name) per data classification.
- Never log PII or tokens.
- Collect minimum data necessary.
- Keep sensitive actions auditable.

## Threat-modeling triggers

Produce a threat model when the change touches authentication, authorization, invitation flows,
sensitive data (PII), the public attack surface, or a new external integration.

## Escalation

Security-sensitive changes require explicit human approval before deployment.

---

## Learned patterns

### NestJS rate limiting — single default throttler

Register one `default` throttler in `ThrottlerModule.forRoot`. Override per endpoint with
`@Throttle({ default: { limit: N, ttl: T_ms } })`. Never register a second named throttler
— it bleeds onto all routes, causing unexpected 429s on unrelated endpoints.

### nginx `add_header` inheritance

Server-level `add_header` directives are NOT inherited by `location {}` blocks that define
their own `add_header`. Place ALL security headers at the `server {}` level with `always`.
Never add `add_header` inside `location {}` blocks that proxy upstream traffic.

### React auth — lazy `useState` init

Read `sessionStorage` in the `useState` lazy initializer (not `useEffect`) to synchronize
the API client token before children mount. `useEffect` fires after children, causing a 401
race condition on page reload.

```typescript
const [token, setLocalToken] = useState<string | null>(() => {
  const t = sessionStorage.getItem('access_token');
  setToken(t); // updates module-level singleton before children mount
  return t;
});
```

### OTel exporter — conditional auth header (no hardcoded fallbacks)

```typescript
const otlpUser = process.env.OTEL_EXPORTER_OTLP_USER;
const otlpPass = process.env.OTEL_EXPORTER_OTLP_PASSWORD;
const otlpHeaders: Record<string, string> =
  otlpUser && otlpPass
    ? { Authorization: `Basic ${Buffer.from(`${otlpUser}:${otlpPass}`).toString('base64')}` }
    : {};
```
Never use `process.env.SECRET ?? 'hardcoded-fallback'` for credentials.

### API resource guard ordering — 404 before 403

Always: `findOne(id)` → NotFoundException if null → check membership → ForbiddenException if not member.
Never apply membership guard before confirming the resource exists.

### Input sanitization for stored text fields

Add `@Matches(/^[^<>'";&]+$/)` to every DTO field that is stored and redisplayed as
user-controlled content. Defense-in-depth against stored XSS — does not replace output encoding.

### `useLayoutEffect` for DOM focus after edit-mode transitions

Use `useLayoutEffect` (not `useEffect`, not `setTimeout`) when focusing an input after
`setEditing(true)`. Fires synchronously after DOM mutations, before paint.

### Timing-safe auth — dummy bcrypt pattern

On `OnModuleInit`, pre-compute `dummyHash = await bcrypt.hash('__DUMMY__', cost)`.
On "user not found" path, run `await bcrypt.compare(password, dummyHash)` before throwing
to equalize response timing and prevent email enumeration via timing.

### Sensitive token exposure — mask after creation

Tokens that grant capabilities (invite tokens, API keys, one-time codes) must not be
returned in list or GET responses after their initial creation response. Anti-pattern:
`InviteEntity.token` returned on every `GET /invites` and `GET /invites/:id` — any
team member who can list invites gains the ability to accept on behalf of another user.

Correct pattern:
1. Hash the token at rest; store only the hash.
2. Return the plaintext token **once** in the creation (`POST`) response.
3. In list/GET responses, return a masked indicator (e.g. `"token": null`) or omit the field.

> Added: team-core run, 2026-05-27.

### NestJS pipeline order — UUID validation placement for sub-routes

NestJS executes in this order: Middleware → Guards → Interceptors → Pipes → Handler.
`ParseUUIDPipe` in a method signature only runs after all guards have passed.

For sub-route params that a guard reads directly from `req.params` (e.g., `teamId` in
`TeamMemberGuard.canActivate()`), pipe-level UUID validation never fires before the guard
queries the database. UUID format validation for those params MUST live inside `canActivate()`:

```typescript
import { isUUID } from 'class-validator';

// Inside TeamMemberGuard.canActivate():
const teamId = request.params.teamId;
if (!isUUID(teamId, '4')) {
  throw new BadRequestException('Validation failed (uuid v4 is expected)');
}
```

For params NOT read by a guard, use `ParseUUIDPipe({ version: '4' })` in the method
signature as normal. The two mechanisms are complementary, not interchangeable.

**Corollary:** a player receiving 403 (not 400) on a sub-route with a malformed param is
CORRECT behavior when the role guard fires before the pipe. Unauthorized callers learn
nothing about parameter format — this is more secure than returning 400.

> Added: security-hardening run, 2026-05-27.

### JWT fail-fast pattern — no secret fallbacks

Remove all `?? 'fallback-secret'` and `|| 'default-secret'` patterns from config factories
and strategy constructors. Hardcoded fallbacks create a "works silently wrong" failure mode
where the server starts with an insecure secret.

Two-layer defense:

```typescript
// Layer 1: configuration.ts — fails at config-load time (earliest possible)
jwt: {
  secret: (() => {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_SECRET environment variable is required');
    return s;
  })(),
}

// Layer 2: jwt.strategy.ts — defense-in-depth via getOrThrow
secretOrKey: configService.getOrThrow<string>('jwt.secret'),
```

`if (!s)` catches both `undefined` and empty string `''`. `getOrThrow` at strategy
construction time fires before any traffic is accepted, producing a clear config error.

> Added: security-hardening run, 2026-05-27.
