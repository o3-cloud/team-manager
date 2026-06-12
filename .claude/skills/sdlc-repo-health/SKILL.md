---
name: sdlc:repo-health
description: Run a multi-tool repository quality assessment — git object health, contributor analytics, commit hygiene, hook configuration, secret scanning, module dependency architecture, and changed-code quality — and consolidate findings into a single report. Trigger when the user asks for a repo health scan, git history audit, secret scan, dependency graph check, commit message quality review, bus factor analysis, or wants to know the overall structural health of the repository.
when_to_use: Use to produce a standalone repository quality posture report, or as a complement to sdlc:code-health and sdlc:test-health. Focuses on the repository itself — git object history, size, contributors, hook hygiene, secrets, and module coupling — rather than source code complexity or test suite effectiveness. Do not use as a substitute for sdlc:secops (SAST, SCA, container, IaC) or sdlc:code-health (cyclomatic complexity, maintainability index).
argument-hint: "<target-path> [--focus size|history|hooks|secrets|deps|diff|all] [--diff]"
arguments:
  - target
  - focus
  - diff
disable-model-invocation: false
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - Glob
  - Grep
---

# AI-SDLC Repository Quality Assessment

**Artifact:** Repository Quality Report → `repo-quality-report.md` in the target directory
**Gate question:** Is the repository itself — its history, hygiene, and module structure — healthy enough to sustain safe delivery?

Code and test quality describe what is in the files. Repository quality describes the structural health surrounding those files: how large the git history has grown, whether secrets have leaked into it, who owns what and whether a single person's departure would be catastrophic, whether commit standards are enforced, and whether module boundaries are respected. These signals are invisible to file-level scanners.

## Inputs

- `target`: Path to the directory to analyze. Must be inside a git repository. Default: current working directory.
- `focus`: Optional filter — `size`, `history`, `hooks`, `secrets`, `deps`, `diff`, or `all` (default: `all`). Maps to groups:
  - `size` → Group 1
  - `history` → Groups 2, 3
  - `hooks` → Group 4
  - `secrets` → Group 5
  - `deps` → Group 6
  - `diff` → Group 7
  - `all` → all applicable groups
- `--diff`: If passed, and a previous `repo-quality-report.md` exists in the target, load it and emit a "Changes Since Last Scan" section comparing current findings against previous ones (New / Resolved / Persisting / Regressed).
- All raw arguments: $ARGUMENTS

If `target` is omitted, use the current working directory. If it is not inside a git repository, stop and report the error — all groups require `git`.

## Advisory Thresholds

These thresholds drive the "hot-spot" lists in the report. They are **advisory only** — the skill does not fail or block on violations.

| Metric | Threshold | Source |
|---|---|---|
| Packed repo size | > 500 MB warn, > 1 GB hot | git-sizer |
| Largest blob in history | > 10 MB warn, > 100 MB hot | git-sizer, git-filter-repo |
| Total object count | > 100 k warn, > 500 k hot | git-sizer |
| Max tree depth | > 10 warn, > 20 hot | git-sizer |
| Non-conforming commit messages (last 500) | > 5% warn, > 20% hot | commitlint, gitlint |
| No commit-lint tool configured | — warn | config file detection |
| No pre-commit / lefthook configured | — warn | config file detection |
| Secrets found in current working tree | ≥ 1 hot | gitleaks, detect-secrets |
| Secrets found in git history | ≥ 1 hot | gitleaks |
| Bus factor (contributors owning > 50% LOC) | = 1 hot, = 2 warn | git fame |
| Circular module dependencies | ≥ 1 warn, ≥ 5 hot | dependency-cruiser, madge |
| Import architecture rule violations | > 10 warn, > 50 hot | import-linter, dependency-cruiser |
| diff-cover — coverage on changed lines | < 80% warn, < 50% hot | diff-cover |
| diff-quality — violations on changed lines | > 10 warn, > 25 hot | diff-quality |

A finding is **hot** when it crosses the second threshold (these go in the executive summary). A finding is **warn** when it crosses the first but not the second.

## Workflow

1. **Detect repository profile** — confirm the target is inside a git repository and detect which languages and tooling configs are present (see Detection Logic below). This drives which tool groups to activate.

2. **Check for existing report (delta mode)** — if `--diff` was passed and `<target>/repo-quality-report.md` exists, read it and store its hot-spot list for comparison in step 5.

3. **Launch parallel analysis subagents** — spawn one Agent per active tool group. Each agent runs its tools, captures output (truncated to top N findings ordered by severity), and returns a structured findings block. Run all applicable groups concurrently.

4. **Consolidate findings** — collect all agent results and apply these deduplication rules:
   - If git-sizer and git-filter-repo both flag the same large blob, keep one row and merge the tool list.
   - If gitleaks and detect-secrets both flag the same file:line, keep one row and merge the source column.
   - If dependency-cruiser and madge both report the same circular-dependency chain, keep one row and note both tools agreed.
   - Sort each section by severity (hot → warn → ok) then by metric value descending.

5. **Delta comparison (if --diff)** — compare current hot-spots against the previous report. Classify each as: New (not previously flagged), Resolved (previously flagged, no longer hot), Persisting (still hot), Regressed (was warn, now hot OR metric worsened by ≥ 25%). Add a "Changes Since Last Scan" section.

6. **Write the report** — produce `repo-quality-report.md` in the target directory using the artifact structure below.

7. **Emit the result summary** inline.

## Detection Logic

Before spawning subagents, detect the repository profile by running these commands with the resolved `<target>` path:

```bash
TARGET="<resolved-absolute-target-path>"

echo "=== Git repository root ==="
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
echo "$GIT_ROOT"
[ -z "$GIT_ROOT" ] && echo "ERROR: not a git repository" && exit 1

echo "=== Languages present ==="
find "$GIT_ROOT" -maxdepth 6 \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | head -1
find "$GIT_ROOT" -maxdepth 6 -name "*.py" \
  -not -path "*/.venv/*" -not -path "*/venv/*" -not -path "*/node_modules/*" | head -1
find "$GIT_ROOT" -maxdepth 6 -name "*.go" -not -path "*/vendor/*" | head -1
find "$GIT_ROOT" -maxdepth 6 -name "*.java" -not -path "*/target/*" | head -1
find "$GIT_ROOT" -maxdepth 6 -name "*.rs" -not -path "*/target/*" | head -1

echo "=== Commit-lint tooling present ==="
find "$GIT_ROOT" -maxdepth 3 \( -name "commitlint.config.*" -o -name ".commitlintrc" -o -name ".commitlintrc.*" \) \
  -not -path "*/node_modules/*" 2>/dev/null | head -3
find "$GIT_ROOT" -maxdepth 3 -name ".gitlint" 2>/dev/null | head -3

echo "=== Hook managers present ==="
find "$GIT_ROOT" -maxdepth 3 -name ".pre-commit-config.yaml" 2>/dev/null | head -3
find "$GIT_ROOT" -maxdepth 3 \( -name "lefthook.yml" -o -name "lefthook.yaml" \) 2>/dev/null | head -3

echo "=== Module dep tooling present ==="
find "$GIT_ROOT" -maxdepth 3 -name ".dependency-cruiser.*" -not -path "*/node_modules/*" 2>/dev/null | head -3
find "$GIT_ROOT" -maxdepth 3 -name ".importlinter" -o -name "setup.cfg" 2>/dev/null | head -3

echo "=== Coverage artifacts present ==="
find "$GIT_ROOT" \( -name "coverage.xml" -o -name "lcov.info" -o -name "coverage-final.json" \) \
  -not -path "*/node_modules/*" 2>/dev/null | head -5

echo "=== Commit count ==="
git -C "$GIT_ROOT" rev-list --count HEAD 2>/dev/null

echo "=== git-sizer available ==="
command -v git-sizer && git-sizer --version || echo "not installed"

echo "=== git-filter-repo available ==="
command -v git-filter-repo && git-filter-repo --version || echo "not installed"
```

Activate groups based on findings:

- **Group 1 (repository size & object health)** — always; requires git-sizer or git-filter-repo (skip gracefully if neither installed)
- **Group 2 (history & contributor analytics)** — always; requires git fame, git-quick-stats, or git-of-theseus
- **Group 3 (commit message quality)** — always; requires commitlint or gitlint (reports "not configured" if neither found)
- **Group 4 (hook & hygiene configuration)** — always; detects pre-commit, lefthook, and bare `.git/hooks/`
- **Group 5 (secrets & credential scan)** — always; requires gitleaks or detect-secrets (reports "not installed" if neither found; this is a high-value group)
- **Group 6 (module dependency architecture)** — JS/TS found → dependency-cruiser, madge; Python found → import-linter; skip if no JS/TS/Python source detected
- **Group 7 (changed-code quality)** — always when a coverage artifact is found OR `--focus diff` is set; requires diff-cover or diff-quality

If `--focus` is set, activate only the groups mapped to that focus value (see Inputs). Group 1 always runs because the report header needs the baseline git metrics.

---

## Subagent Tool Groups

### Group 1 — Repository Size & Object Health
**Run when:** always
**Tools:** `git-sizer`, `git-filter-repo` (`--analyze` mode only — read-only, no rewrite)

> **Safety:** `git filter-repo --analyze` writes analysis files to `.git/filter-repo/analysis/` and does not modify the working tree or history. `git-sizer` is fully read-only. BFG is detected but never invoked — it has no safe read-only analysis mode.

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

echo "=== git baseline ==="
git log --oneline | wc -l | xargs -I{} echo "total commits: {}"
git log --format="%ai" | tail -1 | xargs -I{} echo "first commit: {}"
git log --format="%ai" | head -1 | xargs -I{} echo "latest commit: {}"

echo ""
echo "=== git-sizer ==="
if command -v git-sizer >/dev/null; then
  git-sizer --verbose 2>/dev/null
else
  echo "git-sizer: not installed"
fi

echo ""
echo "=== git-filter-repo analyze ==="
if command -v git-filter-repo >/dev/null; then
  git filter-repo --analyze --force 2>/dev/null || git filter-repo --analyze 2>/dev/null || true
  ANALYSIS_DIR="$GIT_ROOT/.git/filter-repo/analysis"
  if [ -d "$ANALYSIS_DIR" ]; then
    echo "--- largest blobs in history ---"
    head -30 "$ANALYSIS_DIR/blob-shas-and-paths.txt" 2>/dev/null || true
    echo "--- extensions by size ---"
    cat "$ANALYSIS_DIR/extensions.txt" 2>/dev/null | head -20 || true
    echo "--- renames ---"
    wc -l < "$ANALYSIS_DIR/renames.txt" 2>/dev/null | xargs -I{} echo "renamed paths: {}"
  fi
else
  echo "git-filter-repo: not installed"
fi

echo ""
echo "=== BFG status ==="
command -v bfg >/dev/null && echo "bfg: available (remediation tool — not run during scan)" || \
  command -v java >/dev/null && find ~ -name "bfg*.jar" 2>/dev/null | head -2 || \
  echo "bfg: not found"

echo ""
echo "=== large files in current working tree ==="
find "$GIT_ROOT" -type f -not -path "*/.git/*" -not -path "*/node_modules/*" \
  -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/target/*" \
  -size +5M 2>/dev/null | xargs -I{} du -sh {} 2>/dev/null | sort -rh | head -20
```
**Returns:** packed repo size, object counts (commits, trees, blobs, tags), largest blobs in history with paths (whether still present in HEAD), extensions ranked by cumulative size, and large files in the current working tree. Flag blobs > 10 MB as warn, > 100 MB as hot. Flag packed repo size > 500 MB as warn, > 1 GB as hot.

---

### Group 2 — History & Contributor Analytics
**Run when:** always
**Tools:** `git fame`, `git-quick-stats`, `git-of-theseus`

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

echo "=== git fame (contributor breakdown) ==="
if command -v git-fame >/dev/null; then
  git fame --timeout=120 . 2>/dev/null | head -40 || true
elif python3 -c "import git_fame" 2>/dev/null; then
  python3 -m git_fame --timeout=120 . 2>/dev/null | head -40 || true
else
  echo "git-fame: not installed"
  # Fallback: git shortlog for basic contributor stats
  echo "=== git shortlog (fallback) ==="
  git shortlog -sn --no-merges | head -20
fi

echo ""
echo "=== bus factor estimate ==="
# Use git log blame-like per-author line ownership
git log --no-merges --pretty=format:"%an" | sort | uniq -c | sort -rn | head -20 | \
  python3 -c "
import sys
lines = []
for l in sys.stdin:
    parts = l.strip().split(None, 1)
    if len(parts) == 2:
        lines.append((int(parts[0]), parts[1]))
total = sum(c for c,_ in lines)
running = 0
bf = 0
print(f'Total commits (sample): {total}')
for count, author in lines:
    running += count
    bf += 1
    pct = running / total * 100
    print(f'  {pct:5.1f}%  {count:5d} commits  {author}')
    if running / total >= 0.5:
        print(f'Bus factor (commit-based): {bf}')
        break
" 2>/dev/null || true

echo ""
echo "=== git-quick-stats ==="
if command -v git-quick-stats >/dev/null; then
  # -T = contribution stats table
  git-quick-stats -T 2>/dev/null | head -80 || true
else
  echo "git-quick-stats: not installed"
  echo "=== git log summary (fallback) ==="
  echo "Commits per month (last 12 months):"
  git log --no-merges --format="%ai" --since="12 months ago" | \
    awk '{print substr($1,1,7)}' | sort | uniq -c | sort -k2
  echo "Top active files (last 90 days):"
  git log --no-merges --since="90 days ago" --name-only --format="" | \
    grep -v "^$" | sort | uniq -c | sort -rn | head -20
fi

echo ""
echo "=== git-of-theseus (code survival) ==="
if command -v git-of-theseus-analyze >/dev/null; then
  THESEUS_OUT=$(mktemp -d)
  git-of-theseus-analyze "$GIT_ROOT" --outdir "$THESEUS_OUT" 2>/dev/null || true
  if ls "$THESEUS_OUT"/*.json >/dev/null 2>&1; then
    python3 -c "
import json, os, glob
files = glob.glob('$THESEUS_OUT/*.json')
for f in files[:3]:
    try:
        data = json.load(open(f))
        print(f'--- {os.path.basename(f)} ---')
        # Print summary of survival data
        if isinstance(data, dict):
            for k in list(data.keys())[:5]:
                print(f'  {k}: {data[k]}')
    except Exception as e:
        print(f'  parse error: {e}')
" 2>/dev/null || true
  fi
  rm -rf "$THESEUS_OUT" 2>/dev/null || true
else
  echo "git-of-theseus: not installed"
fi
```
**Returns:** per-author breakdown (LOC %, commit %, file %); bus factor estimate (how many contributors account for > 50% of commits); commit velocity by month; top churned files; code survival curve summary (if git-of-theseus is installed). Flag bus factor = 1 as hot, = 2 as warn.

---

### Group 3 — Commit Message Quality
**Run when:** always
**Tools:** `commitlint`, `gitlint`

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

SAMPLE=500
TOTAL=$(git log --oneline | wc -l | tr -d ' ')
SAMPLE=$(( TOTAL < SAMPLE ? TOTAL : SAMPLE ))

echo "=== commit lint configuration ==="
COMMITLINT_CFG=$(find "$GIT_ROOT" -maxdepth 3 \
  \( -name "commitlint.config.*" -o -name ".commitlintrc" -o -name ".commitlintrc.*" \) \
  -not -path "*/node_modules/*" 2>/dev/null | head -3)
echo "${COMMITLINT_CFG:-none found}"

GITLINT_CFG=$(find "$GIT_ROOT" -maxdepth 3 -name ".gitlint" 2>/dev/null | head -3)
echo "gitlint config: ${GITLINT_CFG:-none found}"

echo ""
echo "=== commitlint (last $SAMPLE commits) ==="
if command -v commitlint >/dev/null && [ -n "$COMMITLINT_CFG" ]; then
  git log --format="%s" -"$SAMPLE" | \
    commitlint --stdin --verbose 2>&1 | head -100 || true
  echo "=== commitlint violation count ==="
  git log --format="%s" -"$SAMPLE" | \
    commitlint --stdin 2>&1 | grep -c "✖\|error" || echo "0"
elif command -v commitlint >/dev/null && [ -z "$COMMITLINT_CFG" ]; then
  # Try with default conventional-commits preset
  git log --format="%s" -"$SAMPLE" | \
    commitlint --stdin --extends @commitlint/config-conventional 2>&1 | \
    grep -E "✖|✔|error|warning" | head -60 || true
else
  echo "commitlint: not installed"
fi

echo ""
echo "=== gitlint (last $SAMPLE commits) ==="
if command -v gitlint >/dev/null; then
  git log --format="%B--end-commit--%n" -"$SAMPLE" | \
    gitlint --msg-filename /dev/stdin 2>&1 | head -80 || \
  gitlint --commits "HEAD~${SAMPLE}..HEAD" 2>&1 | head -80 || true
else
  echo "gitlint: not installed"
fi

echo ""
echo "=== conventional commit format check (heuristic) ==="
# Even without a linter, check for common format patterns
git log --format="%s" -"$SAMPLE" 2>/dev/null | python3 -c "
import sys, re
msgs = [l.strip() for l in sys.stdin if l.strip()]
TYPES = r'^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([\w/-]+\))?(!)?:'
conventional = sum(1 for m in msgs if re.match(TYPES, m))
merge = sum(1 for m in msgs if m.lower().startswith('merge'))
wip = sum(1 for m in msgs if re.match(r'^wip\b', m, re.I))
total = len(msgs)
print(f'Sample: {total} messages')
print(f'  Conventional format: {conventional} ({conventional/total*100:.1f}%)')
print(f'  Merge commits:       {merge}  ({merge/total*100:.1f}%)')
print(f'  WIP commits:         {wip}  ({wip/total*100:.1f}%)')
print(f'  Other:               {total-conventional-merge-wip}')
if wip > 0:
    print('WIP examples:')
    for m in msgs:
        if re.match(r\"^wip\b\", m, re.I):
            print(f\"  {m[:80]}\")
" 2>/dev/null || true
```
**Returns:** commitlint/gitlint configuration status; violation count and examples for last N commits; heuristic breakdown of conventional commit format compliance, merge commits, and WIP commits. Flag non-conformance > 5% as warn, > 20% as hot.

---

### Group 4 — Hook & Hygiene Configuration
**Run when:** always
**Tools:** `pre-commit`, `lefthook`

> **Safety:** This group only reads config files and lists hooks. It does not run `pre-commit run` or `lefthook run`. Running hooks has side effects and may modify files.

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

echo "=== pre-commit ==="
PRE_COMMIT_CFG=$(find "$GIT_ROOT" -maxdepth 2 -name ".pre-commit-config.yaml" 2>/dev/null | head -1)
if [ -n "$PRE_COMMIT_CFG" ]; then
  echo "Config: $PRE_COMMIT_CFG"
  if command -v pre-commit >/dev/null; then
    pre-commit validate-config "$PRE_COMMIT_CFG" 2>&1 | head -10 || true
  fi
  # List hooks from config
  python3 -c "
import yaml
with open('$PRE_COMMIT_CFG') as f:
    cfg = yaml.safe_load(f)
repos = cfg.get('repos', []) if cfg else []
print(f'repos: {len(repos)}')
for repo in repos:
    url = repo.get('repo','?').split('/')[-1]
    hooks = repo.get('hooks', [])
    for h in hooks:
        stages = ','.join(h.get('stages', ['(default)']))
        print(f\"  {h['id']}  ({url})  stages: {stages}\")
" 2>/dev/null || cat "$PRE_COMMIT_CFG" | head -40 || true
else
  echo "pre-commit: no .pre-commit-config.yaml found"
fi

echo ""
echo "=== lefthook ==="
LEFTHOOK_CFG=$(find "$GIT_ROOT" -maxdepth 2 \
  \( -name "lefthook.yml" -o -name "lefthook.yaml" \) 2>/dev/null | head -1)
if [ -n "$LEFTHOOK_CFG" ]; then
  echo "Config: $LEFTHOOK_CFG"
  if command -v lefthook >/dev/null; then
    lefthook version 2>/dev/null || true
  fi
  python3 -c "
import yaml
with open('$LEFTHOOK_CFG') as f:
    cfg = yaml.safe_load(f)
if cfg:
    for event, spec in cfg.items():
        if isinstance(spec, dict) and 'commands' in spec:
            cmds = spec['commands']
            print(f'{event}: {len(cmds)} command(s)')
            for name in list(cmds.keys())[:5]:
                print(f\"  {name}\")
        elif isinstance(spec, dict) and 'scripts' in spec:
            print(f'{event}: scripts configured')
" 2>/dev/null || cat "$LEFTHOOK_CFG" | head -30 || true
else
  echo "lefthook: no lefthook.yml / lefthook.yaml found"
fi

echo ""
echo "=== bare git hooks (non-sample) ==="
HOOKS_DIR="$GIT_ROOT/.git/hooks"
if [ -d "$HOOKS_DIR" ]; then
  ACTIVE_HOOKS=$(ls "$HOOKS_DIR" 2>/dev/null | grep -v "\.sample$")
  if [ -n "$ACTIVE_HOOKS" ]; then
    echo "Active git hooks:"
    echo "$ACTIVE_HOOKS" | while IFS= read -r h; do
      SZ=$(wc -c < "$HOOKS_DIR/$h" 2>/dev/null | tr -d ' ')
      echo "  $h  (${SZ}B)"
    done
  else
    echo "No active git hooks (only .sample files present)"
  fi
fi

echo ""
echo "=== hook hygiene summary ==="
HAVE_PRE_COMMIT=$( [ -n "$PRE_COMMIT_CFG" ] && echo "yes" || echo "no" )
HAVE_LEFTHOOK=$( [ -n "$LEFTHOOK_CFG" ] && echo "yes" || echo "no" )
echo "pre-commit configured: $HAVE_PRE_COMMIT"
echo "lefthook configured:   $HAVE_LEFTHOOK"
[ "$HAVE_PRE_COMMIT" = "no" ] && [ "$HAVE_LEFTHOOK" = "no" ] && \
  echo "WARN: no hook manager configured — commits are not validated pre-push"
```
**Returns:** pre-commit config validation status and hook list (repo, hook-id, stages); lefthook config hook list (event, command names); active bare `.git/hooks/` entries with sizes. Flag "no hook manager configured" as warn.

---

### Group 5 — Secrets & Credential Scan
**Run when:** always (this is a high-value security group)
**Tools:** `gitleaks`, `detect-secrets`

> **Safety:** All commands below are read-only. `gitleaks detect` and `detect-secrets scan` never write to the repository. Any secret finding should be treated as **hot** and addressed before the next push.

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

echo "=== gitleaks ==="
if command -v gitleaks >/dev/null; then
  gitleaks version 2>/dev/null || true

  echo "--- current working tree (no-git mode) ---"
  gitleaks detect --source "$GIT_ROOT" --no-git \
    --no-banner --exit-code 0 2>&1 | head -60 || true

  echo ""
  echo "--- git history (last 500 commits) ---"
  gitleaks detect --source "$GIT_ROOT" \
    --log-opts "HEAD~500..HEAD" \
    --no-banner --exit-code 0 2>&1 | head -80 || \
  gitleaks detect --source "$GIT_ROOT" \
    --no-banner --exit-code 0 2>&1 | head -80 || true

  echo ""
  echo "--- gitleaks config ---"
  find "$GIT_ROOT" -maxdepth 2 -name ".gitleaks.toml" -o -name "gitleaks.toml" 2>/dev/null | head -3
  [ -z "$(find $GIT_ROOT -maxdepth 2 -name '.gitleaks.toml' -o -name 'gitleaks.toml' 2>/dev/null)" ] && \
    echo "No custom .gitleaks.toml — using built-in ruleset"
else
  echo "gitleaks: not installed — RECOMMEND installation: brew install gitleaks"
fi

echo ""
echo "=== detect-secrets ==="
if command -v detect-secrets >/dev/null; then
  detect-secrets --version 2>/dev/null || true

  echo "--- scan current tree ---"
  detect-secrets scan "$GIT_ROOT" \
    --exclude-files ".git|node_modules|dist|build|\.lock$|\.sum$|pnpm-lock\.yaml" \
    2>/dev/null | python3 -c "
import json, sys
try:
    r = json.load(sys.stdin)
    results = r.get('results', {})
    total = sum(len(v) for v in results.values())
    print(f'detect-secrets: {total} potential secrets in {len(results)} files')
    for fpath, findings in sorted(results.items())[:20]:
        for f in findings:
            print(f\"  {fpath}:{f.get('line_number','?')}  type={f.get('type','?')}  hashed={f.get('hashed_secret','?')[:12]}\")
    if total == 0:
        print('No secrets detected')
except Exception as e:
    print(f'parse error: {e}')
" 2>/dev/null || true

  echo "--- .secrets.baseline status ---"
  if [ -f "$GIT_ROOT/.secrets.baseline" ]; then
    python3 -c "
import json
b = json.load(open('$GIT_ROOT/.secrets.baseline'))
results = b.get('results', {})
total = sum(len(v) for v in results.values())
print(f'baseline: {total} accepted secrets in {len(results)} files (review these)')
" 2>/dev/null || true
  else
    echo "No .secrets.baseline — run 'detect-secrets scan > .secrets.baseline' to accept known findings"
  fi
else
  echo "detect-secrets: not installed — RECOMMEND: pip install detect-secrets"
fi
```
**Returns:** gitleaks findings (file, line, rule, commit) for current tree and last 500 commits of history; detect-secrets findings (file, line, secret type); baseline status. Any finding with `count ≥ 1` is **hot** — secrets must be rotated and optionally purged from history via BFG or git-filter-repo.

---

### Group 6 — Module Dependency Architecture
**Run when:** JS/TS source files detected → dependency-cruiser, madge; Python source files detected → import-linter
**Tools:** `dependency-cruiser` (`depcruise`), `madge`, `import-linter` (`lint-imports`)

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

# --- dependency-cruiser (JS/TS) ---
HAS_TS_JS=$(find "$GIT_ROOT" \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" \
  2>/dev/null | head -1)

if [ -n "$HAS_TS_JS" ]; then
  echo "=== dependency-cruiser ==="
  DEPCRUISE=$(command -v depcruise 2>/dev/null || \
    (cd "$GIT_ROOT" && npx --no-install depcruise --version >/dev/null 2>&1 && echo "npx --no-install depcruise"))

  if [ -n "$DEPCRUISE" ]; then
    # Detect source roots
    SRCROOTS=""
    for D in src apps packages lib; do
      [ -d "$GIT_ROOT/$D" ] && SRCROOTS="$SRCROOTS $D"
    done
    SRCROOTS="${SRCROOTS:-src}"

    # Config detection
    DEPCRUISE_CFG=$(find "$GIT_ROOT" -maxdepth 2 \
      \( -name ".dependency-cruiser.js" -o -name ".dependency-cruiser.cjs" \
         -o -name ".dependency-cruiser.json" -o -name "dependency-cruiser.config.*" \) \
      -not -path "*/node_modules/*" 2>/dev/null | head -1)
    [ -n "$DEPCRUISE_CFG" ] && echo "Config: $DEPCRUISE_CFG" || echo "No config found — using defaults"

    echo "--- circular deps ---"
    (cd "$GIT_ROOT" && $DEPCRUISE $SRCROOTS \
      --include-only "^(src|apps|packages|lib)" \
      --output-type json \
      --no-config 2>/dev/null) | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    summary = data.get('summary', {})
    violations = summary.get('violations', [])
    circs = [v for v in violations if 'circular' in v.get('rule',{}).get('name','').lower()]
    errors = [v for v in violations if v.get('severity') == 'error']
    warns = [v for v in violations if v.get('severity') == 'warn']
    mods = data.get('modules', [])
    print(f'modules scanned: {len(mods)}')
    print(f'violations: {len(violations)}  (circular: {len(circs)}, errors: {len(errors)}, warns: {len(warns)})')
    print()
    if circs:
        print('Circular dependency chains:')
        for v in circs[:20]:
            print(f\"  {v.get('from','?')} ↔ {v.get('to','?')}\")
    if errors:
        print('Rule errors:')
        for v in errors[:20]:
            rule = v.get('rule',{}).get('name','?')
            print(f\"  [{rule}] {v.get('from','?')} → {v.get('to','?')}\")
except Exception as e:
    print(f'parse error: {e}')
" 2>/dev/null || true

    echo ""
    echo "--- orphan / unreachable modules ---"
    (cd "$GIT_ROOT" && $DEPCRUISE $SRCROOTS \
      --include-only "^(src|apps|packages|lib)" \
      --output-type json \
      --no-config 2>/dev/null) | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    mods = data.get('modules', [])
    orphans = [m['source'] for m in mods if not m.get('dependents') and not m.get('source','').endswith('index.ts')]
    print(f'Potentially orphaned modules (no dependents): {len(orphans)}')
    for o in orphans[:15]:
        print(f'  {o}')
except Exception as e:
    print(f'parse error: {e}')
" 2>/dev/null || true
  else
    echo "dependency-cruiser: not installed — npm install -g dependency-cruiser"
  fi

  echo ""
  echo "=== madge ==="
  if command -v madge >/dev/null; then
    for SRCDIR in "$GIT_ROOT/src" "$GIT_ROOT/apps/backend/src" "$GIT_ROOT/apps/frontend/src"; do
      [ -d "$SRCDIR" ] || continue
      LABEL=$(echo "$SRCDIR" | sed "s|$GIT_ROOT/||")
      echo "--- $LABEL ---"
      madge --circular "$SRCDIR" 2>/dev/null | head -20 || true
      echo "Orphan modules:"
      madge --orphans "$SRCDIR" 2>/dev/null | head -20 || true
    done
  else
    echo "madge: not installed — npm install -g madge"
  fi
fi

# --- import-linter (Python) ---
HAS_PY=$(find "$GIT_ROOT" -maxdepth 6 -name "*.py" \
  -not -path "*/.venv/*" -not -path "*/venv/*" 2>/dev/null | head -1)

if [ -n "$HAS_PY" ]; then
  echo ""
  echo "=== import-linter ==="
  IMPORTLINTER_CFG=$(find "$GIT_ROOT" -maxdepth 3 -name ".importlinter" 2>/dev/null | head -1)
  if [ -n "$IMPORTLINTER_CFG" ]; then
    echo "Config: $IMPORTLINTER_CFG"
    if command -v lint-imports >/dev/null; then
      (cd "$GIT_ROOT" && lint-imports 2>&1 | head -60) || true
    else
      echo "lint-imports: not installed — pip install import-linter"
    fi
  else
    # Check setup.cfg for [importlinter] section
    SETUP_CFG=$(find "$GIT_ROOT" -maxdepth 2 -name "setup.cfg" 2>/dev/null | head -1)
    if [ -n "$SETUP_CFG" ] && grep -q "\[importlinter\]" "$SETUP_CFG" 2>/dev/null; then
      echo "Config: $SETUP_CFG ([importlinter] section)"
      command -v lint-imports >/dev/null && (cd "$GIT_ROOT" && lint-imports 2>&1 | head -60) || \
        echo "lint-imports: not installed"
    else
      echo "import-linter: no .importlinter or [importlinter] in setup.cfg"
    fi
  fi
fi
```
**Returns:** dependency-cruiser — module count, violation breakdown (circular / error / warn), circular chain list, orphaned modules; madge — circular dep chains per source root; import-linter — contract names and violation counts. Flag circular deps ≥ 1 as warn, ≥ 5 as hot. Flag import violations > 10 as warn, > 50 as hot.

---

### Group 7 — Changed-Code Quality
**Run when:** a coverage artifact is found OR `--focus diff` is explicitly set
**Tools:** `diff-cover`, `diff-quality`

**Commands:**
```bash
TARGET="<resolved-absolute-target-path>"
GIT_ROOT=$(git -C "$TARGET" rev-parse --show-toplevel 2>/dev/null)
cd "$GIT_ROOT"

# Determine base branch
BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|.*/||' || \
       git for-each-ref --format='%(refname:short)' refs/remotes/origin/HEAD 2>/dev/null | sed 's|origin/||' || \
       echo "main")
echo "Base branch: $BASE"
echo "Changed files vs origin/$BASE:"
git diff "origin/$BASE"...HEAD --name-only 2>/dev/null | head -30 || \
  git diff HEAD~5...HEAD --name-only 2>/dev/null | head -30 || true

# Find coverage artifact
COVERAGE_XML=$(find "$GIT_ROOT" \
  \( -name "coverage.xml" -o -name "coverage-report.xml" -o -name "clover.xml" \) \
  -not -path "*/node_modules/*" 2>/dev/null | head -1)
LCOV_INFO=$(find "$GIT_ROOT" \( -name "lcov.info" -o -name "lcov.dat" \) \
  -not -path "*/node_modules/*" 2>/dev/null | head -1)
echo "Coverage artifact: ${COVERAGE_XML:-${LCOV_INFO:-none found}}"

echo ""
echo "=== diff-cover ==="
if command -v diff-cover >/dev/null; then
  if [ -n "$COVERAGE_XML" ]; then
    diff-cover "$COVERAGE_XML" \
      --compare-branch "origin/$BASE" \
      --fail-under 0 2>&1 | tail -40 || true
  elif [ -n "$LCOV_INFO" ]; then
    echo "diff-cover: lcov.info found but diff-cover requires XML format (Cobertura/Clover)"
    echo "  Convert with: genhtml $LCOV_INFO --output-directory coverage && python-lcov-cobertura..."
  else
    echo "diff-cover: no coverage XML found — run tests with coverage first, then re-scan"
  fi
else
  echo "diff-cover: not installed — pip install diff-cover"
fi

echo ""
echo "=== diff-quality ==="
if command -v diff-quality >/dev/null; then
  # Try each available quality tool
  for TOOL in pyflakes pylint flake8 pep8 pycodestyle; do
    command -v "$TOOL" >/dev/null || continue
    echo "--- diff-quality ($TOOL) ---"
    diff-quality --violations="$TOOL" \
      --compare-branch "origin/$BASE" \
      --fail-under 0 2>&1 | tail -30 || true
    break
  done
  # ESLint for JS/TS if available
  if command -v eslint >/dev/null; then
    echo "--- diff-quality (eslint) ---"
    diff-quality --violations=eslint \
      --compare-branch "origin/$BASE" \
      --fail-under 0 2>&1 | tail -30 || true
  fi
else
  echo "diff-quality: not installed — pip install diff-quality"
fi
```
**Returns:** base branch, list of changed files, diff-cover report (coverage % on changed lines, lines missing coverage), diff-quality violations scoped to changed lines. Flag diff-cover < 80% as warn, < 50% as hot. Flag diff-quality violations > 10 as warn, > 25 as hot.

---

## Consolidation Instructions

- Replace `<target>` / `<resolved-absolute-target-path>` with the actual absolute path in every command before running.
- Each subagent runs independently — do not wait for other agents.
- **Deduplication priority:**
  - Same large blob flagged by git-sizer and git-filter-repo → one row, merge tool column.
  - Same secret flagged by gitleaks and detect-secrets → one row, severity stays hot, merge tool column.
  - Same circular dependency reported by dependency-cruiser and madge → one row, note both agreed.
  - One row per module in the orphan list regardless of how many tools detected it.
- If a tool is not installed, skip it and record it in the "Tools skipped" table with the install command.
- If a tool errors or times out, capture the first error line, skip, and note it.
- **Never modify the repository** — not history, not working tree files, not `.git/` except `.git/filter-repo/analysis/` written by `git filter-repo --analyze`. Write only `repo-quality-report.md`.
- Secrets findings are always **hot** — do not downgrade them regardless of `--focus` setting.
- BFG appears in the Tool Inventory as `detected / not detected` but is never invoked during the scan; it is a remediation tool.

---

## Artifact Structure

```markdown
# Repository Quality Report

**Target:** <git root path>
**Branch:** <current branch>
**Date:** <ISO date>
**Commits sampled:** <n>
**Tools run:** <comma-separated list with versions>
**Tools skipped:** <list with reason (not installed / not applicable / no artifact)>

---

## Executive Summary

| Dimension | Hot | Warn | OK |
|---|---|---|---|
| Repository size & object health | n | n | n |
| Commit message quality | n | n | n |
| Hook & hygiene configuration | n | n | n |
| Secrets & credentials | n | n | n |
| Module dependency architecture | n | n | n |
| Changed-code quality | n | n | n |

**Overall posture:** [Critical / High risk / Moderate / Healthy]

**Top findings:**
1. <finding — metric — severity>
2. ...

---

## Changes Since Last Scan
*(only present when --diff is passed and a previous report exists)*

| Dimension | Status | Finding | Was | Now |
|---|---|---|---|---|
| size | New / Resolved / Persisting / Regressed | <metric> | <was> | <now> |

---

## Repository Size & Object Health

| Metric | Value | Status |
|---|---|---|
| Packed size | <n MB / GB> | OK / WARN / HOT |
| Object count | <n> | ... |
| Largest blob in history | <n MB> (`<path>`) — in HEAD: yes/no | ... |
| Max tree depth | <n> | ... |

### Large files in history
| Size | Path | Still in HEAD? | Recommended action |
|---|---|---|---|
| <n MB> | `<path>` | yes / no | Remove via BFG / git-filter-repo |

### Large files in working tree (> 5 MB, untracked by .gitignore)
| Size | Path |
|---|---|

---

## History & Contributor Analytics

| Contributor | Commits | Commit % | LOC % (est.) |
|---|---|---|---|

**Bus factor:** <n> — <n contributor(s) account for > 50% of commits> — <OK / WARN: 2 / HOT: 1>
**Total commits:** <n>
**Repository age:** <n> months (<first commit date> → <latest>)
**Commit velocity (last 12 months):** <avg commits/month>

### Top churned files (last 90 days)
| File | Commits touching it |
|---|---|

---

## Commit Message Quality

**Lint tool configured:** <commitlint / gitlint / none — WARN if none>
**Commits sampled:** <n>
**Non-conforming:** <n> (<n>%) — <OK / WARN / HOT>
**WIP commits:** <n>

### Non-conforming examples
| Commit | Message (truncated) | Violation |
|---|---|---|

---

## Hook & Hygiene Configuration

| Tool | Config file | Status |
|---|---|---|
| pre-commit | `.pre-commit-config.yaml` | configured (<n> hooks) / missing — WARN |
| lefthook | `lefthook.yml` | configured / missing — WARN |
| bare `.git/hooks/` | — | <n> active / none |

### Configured hooks
| Manager | Hook name | Stage | Source repo |
|---|---|---|---|

---

## Secrets & Credential Scan

**gitleaks (working tree):** <n findings> — <OK / HOT>
**gitleaks (history):** <n findings> — <OK / HOT>
**detect-secrets:** <n findings in n files> — <OK / HOT>

### Findings
| File | Line | Type | Tool | In history? | Action |
|---|---|---|---|---|---|
| `<path>` | <n> | <type> | gitleaks | yes/no | Rotate credential + purge history |

*(Empty when no secrets detected)*

---

## Module Dependency Architecture

**Circular dependencies:** <n> — <OK / WARN / HOT>
**Import rule violations:** <n> — <OK / WARN / HOT>
**Orphaned modules (no dependents):** <n>

### Circular dependency chains
| Chain | Files involved | Length |
|---|---|---|

### Import violations
| From | To | Rule | Severity |
|---|---|---|---|

### Orphaned modules
| File | Last modified |
|---|---|

---

## Changed-Code Quality

**Base branch:** `<branch>`
**Changed files:** <n>
**diff-cover:** <n>% coverage on changed lines — <OK / WARN / HOT>
**diff-quality:** <n> violations on changed lines — <OK / WARN / HOT>

### Coverage gaps in changed lines
| File | Lines changed | Lines covered | % |
|---|---|---|---|

### Quality violations on changed lines
| File | Line | Rule | Severity |
|---|---|---|---|

---

## Recommended Actions

**Priority 1 — Fix immediately (secrets, circular hot):**
1. `<finding>` — <action e.g. "rotate token X, purge from history via BFG --replace-text">

**Priority 2 — Address this sprint (hot):**
1. `<finding>` — <action>

**Priority 3 — Backlog (warn):**
1. <finding> — <action>

---

## Tool Inventory

| Tool | Version | Group | Status |
|---|---|---|---|
| git-sizer | <version> | Size | run / not installed |
| git-filter-repo | <version> | Size | run / not installed |
| BFG | — | Size | detected (not run — remediation tool) / not found |
| git fame | <version> | History | run / not installed |
| git-quick-stats | <version> | History | run / not installed |
| git-of-theseus | <version> | History | run / not installed |
| commitlint | <version> | Commit quality | run / not installed |
| gitlint | <version> | Commit quality | run / not installed |
| pre-commit | <version> | Hooks | detected config / no config / not installed |
| lefthook | <version> | Hooks | detected config / no config / not installed |
| gitleaks | <version> | Secrets | run / not installed |
| detect-secrets | <version> | Secrets | run / not installed |
| dependency-cruiser | <version> | Deps | run / not installed / not applicable |
| madge | <version> | Deps | run / not installed / not applicable |
| import-linter | <version> | Deps | run / not installed / not applicable |
| diff-cover | <version> | Diff quality | run / no coverage artifact / not installed |
| diff-quality | <version> | Diff quality | run / no coverage artifact / not installed |
```

---

## Output Format

After writing the report, respond with:

1. **Path** to `repo-quality-report.md`
2. **Posture summary** — one line per dimension:
   ```
   Size:     <OK / WARN / HOT>   Packed: <n MB>  Largest blob: <n MB>
   History:  <OK / WARN / HOT>   Commits: <n>  Bus factor: <n>
   Commits:  <OK / WARN / HOT>   Non-conforming: <n>%  Lint: <configured / missing>
   Hooks:    <OK / WARN / HOT>   pre-commit: <yes/no>  lefthook: <yes/no>
   Secrets:  <OK / HOT>          gitleaks: <n>  detect-secrets: <n>
   Deps:     <OK / WARN / HOT>   Circular: <n>  Violations: <n>
   Diff:     <OK / WARN / HOT>   Coverage: <n>%  Quality violations: <n>
   ```
3. **Top 5 findings** — ordered by severity
4. **Skipped tools** — tool name and reason (not installed, not applicable, no artifact)
5. **Priority 1 action** — the single most important thing to fix
6. **Delta summary** — (only if `--diff`) New: n, Resolved: n, Persisting: n, Regressed: n
