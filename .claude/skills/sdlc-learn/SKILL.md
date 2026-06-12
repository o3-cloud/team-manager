---
name: sdlc:learn
description: Extract learnings from a completed SDLC run's post-implementation review and apply them to the project's .claude/sdlc context packs. Trigger when the user asks to apply learnings from a run, update context packs from a PIR, or run "sdlc learn <slug>". Takes a run slug as its argument.
argument-hint: "<run-slug>"
user-invocable: true
allowed-tools:
  - Read
  - Edit
  - Bash
---

# sdlc:learn — Apply PIR Learnings to Context Packs

Read the post-implementation review for `$ARGUMENTS` and update `.claude/sdlc/` context packs.

## Inputs

- **Run slug:** from `$ARGUMENTS`. If empty, find the most recent run with a `09-post-implementation-review.md`.
- **PIR location:** `.sdlc/runs/<slug>/09-post-implementation-review.md`

## Workflow

1. **Locate and read the PIR.**

2. **Extract learnings from three sections** (in priority order):
   - `## Learning-Loop Framework Updates` — explicit patterns authored at gate 9; primary source.
   - `## Defects Discovered` — extract one pattern per resolved defect whose root cause reveals a class of mistake worth preventing.
   - `## What Did Not Go Well` — secondary source; use only when not already covered by the defects section.

3. **Map each learning to the correct context pack.** See `references/pack-map.md`.

4. **Update each affected pack** in `.claude/sdlc/`:
   - If a `## Learned patterns` section exists, append under it.
   - If not, append a `## Learned patterns` section at the end of the file.
   - Format each entry:
     ```
     ### <Title>
     <Concise description. Include the anti-pattern, the correct pattern, and when it applies.>
     > Added: <slug> run, <date from PIR header>.
     ```
   - Before adding, check whether the pattern (by title or key phrase) already exists — skip duplicates.

5. **Update open technical debt in `03-system-context.md`.** For each open TD-x item in the PIR that describes an ongoing system constraint (not just a task to complete), add or update a bullet under `## Known technical debt`.

6. **Output a summary** — one line per update: file changed, pattern title, source row.

## Constraints

- Edit only files under `.claude/sdlc/`. Never touch `.claude/skills/`.
- Every new pattern must be actionable: it must prevent a future agent from making the same mistake.
- Do not add patterns already encoded in the pack or obvious from the framework.
- Append only — do not rewrite existing content (except tech debt bullets in `03-system-context.md`).
- Always include the `> Added:` attribution line for traceability.

## References

- Pack-to-file mapping: `references/pack-map.md` — read this before mapping learnings to files.
