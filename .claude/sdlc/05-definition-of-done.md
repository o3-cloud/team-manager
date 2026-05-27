# Context Pack 05 — Definition of Done

> A change is **not complete** unless all boxes are checked.

- [ ] Requirements traceable to implementation (BDR reference where applicable).
- [ ] Acceptance criteria satisfied.
- [ ] Relevant unit and integration tests included (`*.spec.ts` co-located).
- [ ] Edge cases and failure modes handled (bad input, auth failure, not-found, version conflict).
- [ ] Security and privacy risks reviewed (see `07-security-privacy.md`).
- [ ] Observability updated: structured logs for meaningful transitions; OTel spans/metrics where relevant.
- [ ] Deployment and rollback understood; k8s manifests updated if needed.
- [ ] Documentation updated if behavior changes (BDR, domain docs, ADR, CLAUDE.md).
- [ ] Change is minimal in scope — no unrelated refactors.
- [ ] CI passes: Biome lint/format → TypeScript typecheck → unit → integration → Docker build → Trivy → SBOM → Playwright E2E.
- [ ] Domain invariants preserved (version check, gate policies, season uniqueness, etc.).
