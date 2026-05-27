# Context Pack 07 — Security & Privacy

> Layer 2 (Organization). Reusable. Security must not depend on the human remembering
> to ask for it.

## Security defaults

- Never log secrets, tokens, credentials, or sensitive PII.
- Validate all external inputs.
- Enforce authorization server-side.
- Use least privilege.
- Do not expose internal errors to users.
- Do not introduce cryptography, authentication, or authorization logic without
  escalation.
- Classify data before storing, transmitting, or logging it.
- Encode output to prevent injection.

## Privacy obligations

- Handle PII per its data classification.
- Respect retention and consent requirements.
- Keep sensitive actions auditable.
- Collect the minimum data necessary.

## Threat-modeling triggers

Produce a threat model when the change touches authentication, authorization, payment,
sensitive data, the public attack surface, or a new external integration.

## Escalation

Security-sensitive changes follow `../autonomy/escalation-policy.md`. For each risk,
classify severity and recommend a mitigation.

---

## Learned patterns

### NestJS rate limiting with `@nestjs/throttler`

`ThrottlerModule.forRoot([...])` applies **all registered named throttlers to every
route globally** — there is no per-endpoint named throttler. The only correct pattern
for endpoint-specific limits is:

1. Register a single `default` throttler in `ThrottlerModule.forRoot` with a permissive
   default (e.g. 60 requests / 60 seconds).
2. Override the login (or any sensitive) endpoint with
   `@Throttle({ default: { limit: N, ttl: T_ms } })` — this overrides the `default`
   throttler for that route only.

**Anti-pattern:** registering a second named throttler (e.g. `login`) alongside
`default`. `@nestjs/throttler` v5+ applies both to every route; the stricter throttler
bleeds onto unrelated endpoints, causing unexpected 429s (e.g. CRUD routes).

### nginx `add_header` inheritance

Server-level `add_header` directives are **not inherited** by any `location {}` block
that defines its own `add_header`. To apply security headers (CSP, X-Frame-Options,
etc.) to all responses including proxied locations:

- Place all `add_header` directives at the `server {}` block level with the `always`
  flag.
- Do **not** add any `add_header` inside `location {}` blocks that proxy upstream
  traffic — nginx will silently stop applying server-level headers to those locations
  the moment a location-level header appears.

### React auth: lazy `useState` init for module-level token synchronization

When a React component must synchronize a module-level singleton (e.g., an API client's
`_token` field) with React state on mount, use the `useState` lazy initializer —
**not `useEffect`**. The lazy initializer fires synchronously before any child renders;
`useEffect` fires *after* children mount, so child `useEffect`s (e.g., `fetchTodos`)
can fire before the parent's `useEffect` sets the token. This creates an auth race
condition: the first API call has no Authorization header → 401 → forced logout.

```typescript
// Correct: lazy init fires synchronously before any child renders
const [token, setLocalToken] = useState<string | null>(() => {
  const t = sessionStorage.getItem('access_token');
  setToken(t); // updates module-level singleton before children mount
  return t;
});

// Anti-pattern: useEffect fires after children, causing a race condition
// useEffect(() => { setToken(sessionStorage.getItem('access_token')); }, []);
```

**Security implication:** the anti-pattern is exploitable as a denial-of-session —
any authenticated user who reloads the page is immediately logged out by a 401 from
their own app.

> Added: todo-ux-bugfixes run, 2026-05-26.

---

### OTel exporter — conditional auth header (no hardcoded credential fallbacks)

Never use `process.env.SECRET ?? 'hardcoded-fallback'` for credentials passed to
telemetry exporters. The fallback value ends up in source, image layers, and git history.

Pattern — construct the headers object only when both env vars are present:

```typescript
const otlpUser = process.env.OTEL_EXPORTER_OTLP_USER;
const otlpPass = process.env.OTEL_EXPORTER_OTLP_PASSWORD;
const otlpHeaders: Record<string, string> =
  otlpUser && otlpPass
    ? { Authorization: `Basic ${Buffer.from(`${otlpUser}:${otlpPass}`).toString('base64')}` }
    : {};
```

If neither env var is set, the exporter connects unauthenticated (correct for local dev
where OpenObserve has no auth). Explicit `Record<string, string>` type annotation is
required — TypeScript cannot narrow the conditional to `Record<string, string>` otherwise.

> Added: team-core run, 2026-05-27.

---

### API resource guard ordering — 404 before 403

When a route enforces team-membership access control, always resolve the entity first:

```
1. findOne(id)  → throw NotFoundException("Team not found") if null
2. check membership  → throw ForbiddenException("Not a member") if not member
```

**Never** apply the membership guard before confirming the resource exists. Conflating
"resource not found" with "access denied" (both 403) makes the API contract ambiguous:
clients cannot distinguish the two cases, and debugging friction accumulates.

The guard implementation must accept a pre-loaded entity or call `findOne` before the
membership check. In NestJS `TeamMemberGuard`, retrieve the team entity and return
`NotFoundException` when `findOne` returns `null`.

> Added: team-core run, 2026-05-27. Finding M-2 in gate 8 simulation.

---

### Input sanitization for stored text fields

Text that flows **user input → database → client display** is a stored XSS surface even
when the current frontend auto-escapes. TypeORM parameterized queries prevent SQL
execution, but do not prevent storing payloads that could execute in future template
engines, admin UIs, or downstream services.

Add a `@Matches()` constraint to every DTO field that is stored and redisplayed as
user-controlled content:

```typescript
@Matches(/^[^<>'";&]+$/, { message: 'Name contains invalid characters' })
name: string;
```

This is a defense-in-depth measure — it does not replace output encoding, but it prevents
obviously dangerous payloads from entering the database in the first place.

> Added: team-core run, 2026-05-27. Finding M-3 in gate 8 simulation.

---

### `useLayoutEffect` for DOM focus after edit-mode transitions

When a component transitions from view-mode to edit-mode by setting state (e.g.,
`setEditing(true)`) and the edit input must be focused immediately, use
`useLayoutEffect` — **not `useEffect`** and not `setTimeout(fn, 0)`.
`useLayoutEffect` fires synchronously after DOM mutations but before the browser
paints. `useEffect` fires asynchronously and can miss the focus if the browser
dispatches a blur event from the triggering click before the effect runs.

```typescript
// Correct
useLayoutEffect(() => {
  if (editing && editRef.current) {
    editRef.current.focus();
    editRef.current.select();
  }
}, [editing]);
```

> Added: todo-ux-bugfixes run, 2026-05-26.

---

### Timing-safe auth: dummy bcrypt pattern

When a login path has a "user not found" fast-exit, an attacker can enumerate valid
email addresses via response timing. Mitigation:

1. On `OnModuleInit`, pre-compute `dummyHash = await bcrypt.hash('__DUMMY__', cost)`.
2. On the "user not found" path, run `await bcrypt.compare(password, dummyHash)` before
   throwing — this equalizes timing with the real-user path.
3. Use the same cost factor as production password hashing.
4. Store `dummyHash` as a private field (never returned, never compared against real
   credentials). Knowledge of the hash provides no advantage — it is a hash of a public
   constant.
