---
name: sdlc:10-health
description: Run a project health check — orchestrates /sdlc:code-health, /sdlc:test-health, and /sdlc:repo-health in parallel, then synthesizes findings into a single health report at .sdlc/runs/<slug>/10-project-health.md. Trigger when the user wants a combined code + test + repo quality snapshot for a run, asks "how healthy is the project?", or wants a holistic view of maintainability, test effectiveness, and repository hygiene.
when_to_use: Use after any delivery gate to get a combined view of code maintainability, test effectiveness, and repository hygiene. Cross-references hot complexity files against test gaps and repository signals (secrets, circular deps, bus factor) to produce a unified health posture. Accepts a run slug to land the report inside the run directory and optionally update state.md; omit the slug to write health-report.md to the target directory instead.
argument-hint: "[run-slug] [--target <path>] [--diff] [--run-mutation]"
arguments:
  - run-slug
  - target
  - diff
  - run-mutation
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# AI-SDLC Gate 10 — Project Health

**Artifact:** Project Health Report → `10-project-health.md` in the run directory
**Gate question:** Is the project healthy enough to sustain the delivery pace?

## Inputs

- `run-slug`: Kebab-case slug of the SDLC run under `.sdlc/runs/`. If omitted, use the
  most recently modified run directory. If no runs exist, write the report to the target
  directory as `health-report.md` instead.
- `--target <path>`: Directory to scan. Defaults to the project root (the directory
  containing `.sdlc/`). All three sub-skills receive this path.
- `--diff`: Pass `--diff` to all three sub-skills so each report includes a "Changes Since
  Last Scan" section. The health report then includes a merged delta summary.
- `--run-mutation`: Pass `--run-mutation` to `/sdlc:test-health` to opt into slow
  mutation testing. Not passed to `/sdlc:code-health` or `/sdlc:repo-health` (not applicable).
- All raw arguments: $ARGUMENTS

Parse `$ARGUMENTS` tolerantly:
- A word matching a directory under `.sdlc/runs/` → run slug.
- `--target <path>` → target directory.
- `--diff` → delta mode flag.
- `--run-mutation` → mutation opt-in flag.

## Workflow

1. **Resolve inputs.**
   - Resolve the run slug: use the argument if given; else `ls -t .sdlc/runs/ | head -1`.
   - Resolve the target: use `--target` if given; else the directory containing `.sdlc/`
     (walk up from cwd until `.sdlc/` is found, or use cwd if not found).
   - Determine the output path:
     - Run slug found: `.sdlc/runs/<slug>/10-project-health.md`
     - No runs exist: `health-report.md` in the target directory.

2. **Run all three sub-skills in parallel.**
   Invoke `/sdlc:code-health`, `/sdlc:test-health`, and `/sdlc:repo-health` concurrently
   (single message, three Skill tool calls). Pass:
   - The resolved `<target>` path as the positional argument to each.
   - `--diff` if the flag was given.
   - `--run-mutation` to `/sdlc:test-health` only, if the flag was given.

   The skills write their reports to `<target>/code-quality-report.md`,
   `<target>/test-quality-report.md`, and `<target>/repo-quality-report.md` respectively.
   Wait for all three to complete.

3. **Read all three reports.**
   - Read `<target>/code-quality-report.md` — extract:
     - Overall posture (Critical weakness / High risk / Moderate / Healthy).
     - Top hot files with their metrics (file path, CCN, NLOC, minMI).
     - Duplication percentage.
     - Dead-code / unused-dependency signal (if present).
     - Delta summary (if `--diff`).
   - Read `<target>/test-quality-report.md` — extract:
     - Overall posture.
     - Test density weaknesses (source files with no tests, low ratio).
     - Test smells (no-assertion tests, disabled tests, hard-coded waits).
     - E2E coverage hint (routes vs spec files).
     - Mutation score (if `--run-mutation` was passed).
     - Delta summary (if `--diff`).
   - Read `<target>/repo-quality-report.md` — extract:
     - Overall posture.
     - Secrets findings count (gitleaks + detect-secrets).
     - Bus factor.
     - Circular dependency count and hot chains.
     - Commit message non-conformance percentage.
     - Hook manager configuration status.
     - Delta summary (if `--diff`).

4. **Cross-reference findings.**
   Build a "joint risk" table by matching file paths across all three reports. The
   highest-priority targets are files that are risky in multiple dimensions simultaneously.

   Cross-reference algorithm:
   - For each hot/warn code-quality file, derive the expected test file path(s):
     - `src/foo/bar.ts` → look for `src/foo/bar.spec.ts`, `src/foo/bar.test.ts`,
       `src/foo/__tests__/bar.ts`, `tests/foo/bar.spec.ts`.
   - If no matching test file exists → flag as **untested hot file** (joint severity: hot).
   - If a matching test file exists but it appears in the test-quality smell table
     (zero assertions, disabled, hard-coded waits) → flag as **weakly tested hot file**
     (joint severity: warn).
   - If a matching test file exists with no smells → no joint finding for this file.
   - Additionally, for any file appearing in the code-quality hot list that is also
     part of a circular dependency chain in the repo-quality report → elevate its joint
     severity to hot and note "complex + circular" in the joint risk table.
   - Secrets findings from repo-quality are always elevated to joint severity: **critical**
     regardless of what code-quality or test-quality report for the same file.

5. **Compute the combined health posture.**
   The combined posture is the worst of the three sub-report postured — any dimension
   at Critical pulls the combined score to Critical; any dimension at High risk (with
   none Critical) pulls it to High risk; etc.:

   | Rule | Combined posture |
   |---|---|
   | Any dimension = Critical weakness, OR secrets found (repo) | Critical |
   | Any dimension = High risk (none Critical) | High risk |
   | All dimensions = Moderate or better (none High/Critical) | Moderate |
   | All dimensions = Healthy | Healthy |

   Also compute:
   - **Code health score (0–100):** derived from the code-quality report's hot/warn
     counts; start at 100, subtract 10 per hot file, 3 per warn file, cap at 0.
   - **Test health score (0–100):** derived from test-quality hot/warn counts; same
     formula.
   - **Repo health score (0–100):** derived from repo-quality hot/warn counts; same
     formula. Secrets findings each subtract 20 (they are critical).
   - **Joint health score:** `round((code_score + test_score + repo_score) / 3)`.

6. **Write `10-project-health.md`** using the artifact structure below. Do not modify
   `code-quality-report.md`, `test-quality-report.md`, or `repo-quality-report.md` — they are inputs.

7. **Update `state.md`** (only if a run slug was resolved and `.sdlc/runs/<slug>/state.md`
   exists). Append or update the gate-10 ledger row:
   ```
   | 10 | Health | yes | passed | - | 10-project-health.md |
   ```
   If the gate-10 row does not exist in the ledger, append it. Set the risk score column
   to `-` (this gate does not score risk; it observes health).

## Artifact Structure

```markdown
# Project Health Report

**Run:** <slug>  **Date:** <ISO date>
**Target:** <resolved target path>
**Code quality report:** <relative path to code-quality-report.md>
**Test quality report:** <relative path to test-quality-report.md>
**Repo quality report:** <relative path to repo-quality-report.md>

---

## Executive Summary

| Dimension | Posture | Hot | Warn | Score |
|---|---|---|---|---|
| Code quality | <posture> | <n> | <n> | <0–100> |
| Test quality | <posture> | <n> | <n> | <0–100> |
| Repository health | <posture> | <n> | <n> | <0–100> |
| **Combined** | **<posture>** | — | — | **<0–100>** |

**Combined posture:** <Critical / High risk / Moderate / Healthy>

**Top risks at a glance:**
1. <file:metric — one-line description>
2. ...

---

## Changes Since Last Scan
*(only present when --diff is passed and both previous reports exist)*

| Report | Status | Finding | Was | Now |
|---|---|---|---|---|
| code | New / Resolved / Persisting / Regressed | <file — metric> | <was> | <now> |
| test | ... | ... | ... | ... |
| repo | ... | ... | ... | ... |

---

## Code Quality Hot Spots

*(Sourced from `code-quality-report.md` — top hot and warn files.)*

| File | CCN | NLOC | minMI | LOC | Status |
|---|---|---|---|---|---|
| `<path>` | <n> | <n> | <n.n> | <n> | HOT / WARN |

**Duplication:** <n>%  (<ok / warn / hot>)
**Dead code signal:** <n unused exports — ok / warn / hot>  *(or: no signal — knip not installed)*

---

## Test Quality Weaknesses

*(Sourced from `test-quality-report.md` — top hot and warn findings.)*

### Test Density

| Language | Source files | Test files | Ratio | Status |
|---|---|---|---|---|

### Test Smells

| File | Test | Issue | Severity |
|---|---|---|---|

### E2E Coverage

| Framework | Spec files | Route references | Status |
|---|---|---|---|

**Mutation score:** <n% — ok / warn / hot>  *(or: not run — pass --run-mutation to enable)*

---

## Repository Health

*(Sourced from `repo-quality-report.md` — top hot and warn findings.)*

| Dimension | Value | Status |
|---|---|---|
| Packed repo size | <n MB> | OK / WARN / HOT |
| Bus factor | <n> | OK / WARN / HOT |
| Secrets (current tree) | <n findings> | OK / HOT |
| Secrets (git history) | <n findings> | OK / HOT |
| Circular dependencies | <n> | OK / WARN / HOT |
| Non-conforming commits | <n>% | OK / WARN / HOT |
| Hook manager configured | yes / no | OK / WARN |

### Critical secrets findings
*(Empty when no secrets detected)*

| File | Line | Type | Tool | In history? |
|---|---|---|---|---|

---

## Joint Risk: Complex + Poorly Tested

*Files that are hot on code complexity AND have no tests or have test smells — highest-priority refactoring targets.*

| File | Code issue | Test issue | Repo issue | Joint severity |
|---|---|---|---|---|
| `<path>` | CCN=<n>, minMI=<n> | no test file found | circular dep | CRITICAL |
| `<path>` | CCN=<n>, minMI=<n> | no test file found | — | HOT |
| `<path>` | CCN=<n>, minMI=<n> | zero-assertion test | — | WARN |

*(Empty when all hot/warn files have healthy test coverage.)*

---

## Recommended Actions

**Priority 1 — Address immediately (joint hot):**
1. `<file>` — <code issue> + <test issue> — add tests first, then refactor.
   Suggested split: <e.g. extract hook + add spec covering the happy path>.

**Priority 2 — Address this sprint (hot in one dimension):**
1. `<file>` — <issue> — <action>.

**Priority 3 — Backlog (warn):**
1. `<file>` — <issue>.

---

## Linked Reports

- [Code Quality Report](<relative path to code-quality-report.md>)
- [Test Quality Report](<relative path to test-quality-report.md>)
- [Repository Quality Report](<relative path to repo-quality-report.md>)
```

## Instructions

- Do not fabricate findings. Extract data verbatim from the sub-reports; only the
  synthesis (cross-reference, posture label, scores, priorities) is your output.
- If any sub-skill fails or its report is missing, note the failure in the Executive
  Summary and produce the report with the available dimensions only.
- The cross-reference step requires file-system lookups to confirm whether test files
  exist. Use `Glob` or `Bash find` to check each hot/warn file's expected test path(s).
- If `--diff` is passed but no previous reports exist, run without delta and note it.
- Keep the report concise: at most 10 rows per table; link to the sub-reports for full
  detail.
- Never run tests, mutate code, or modify application source files.

## Output Format

Respond with:

1. **Path** to `10-project-health.md`
2. **Combined posture** — one line: `Code: <posture>  Test: <posture>  Repo: <posture>  Combined: <posture>  Score: <n>/100`
3. **Joint risk files** — list of files appearing in multiple hot lists (or "none")
4. **Top recommended action** — the single highest-priority item
5. **Sub-report paths** — where `code-quality-report.md`, `test-quality-report.md`, and `repo-quality-report.md` were written

### sdlc-result
```
gate: 10-health
status: passed
code-posture: <Critical / High risk / Moderate / Healthy>
test-posture: <Critical / High risk / Moderate / Healthy>
repo-posture: <Critical / High risk / Moderate / Healthy>
combined-posture: <Critical / High risk / Moderate / Healthy>
joint-risk-files: <n>
artifact: .sdlc/runs/<slug>/10-project-health.md
note: <one line>
```
