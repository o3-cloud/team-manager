# ADR-036: Software Bill of Materials (SBOM)

## Status

Accepted

## Context and Problem Statement

When a new CVE is disclosed in a transitive dependency, the team needs to know immediately which deployed artifacts are affected. Without an SBOM, answering that question requires a manual, error-prone hunt across repos and registries. With an SBOM, the same question is a query. The value collapses when SBOMs are generated inconsistently, omit transitive components, drift from what was actually built, use ad-hoc formats no scanner understands, or live in a wiki disconnected from the artifact they describe. We need a standard for SBOM format, scope, generation point, distribution, and retention so every released artifact carries a machine-readable, complete, and verifiable component inventory.

## Decision Drivers

- Completeness: transitive dependencies, not only direct ones, must be included
- Format standardization: SPDX or CycloneDX in machine-readable JSON enables scanner integration ([ADR-037](037-vulnerability-scanning.md))
- Co-location: SBOMs are attached to the artifact they describe (OCI referrer, release asset), not stored separately
- Continuous scanning: SBOMs feed recurring vulnerability scans, not only pre-release point-in-time scans
- Supply-chain attestation: signed SBOMs (or in-toto/SLSA attestations) provide verifiable provenance

## Considered Options

- SPDX or CycloneDX JSON generated during the build, signed, attached as OCI referrer for container images, validated in CI
- SBOM generated post-build by re-resolving manifests outside the build (drift risk)
- Human-readable component lists in a wiki (not machine-parseable)
- No SBOM requirement

## Decision Outcome

We will generate an SBOM for every released artifact (container image, binary, package). The SBOM format is either SPDX or CycloneDX in a machine-readable serialization (JSON). Every component includes all NTIA minimum fields: supplier name, component name, version, unique identifier (PURL/CPE/SWID), dependency relationship, SBOM author, and timestamp. Transitive dependencies are included. The SBOM is generated during the build from the resolved dependency graph — not post-build. Content hashes (SHA-256+) are recorded for every component the build can hash. The SBOM is signed or included in a signed in-toto/SLSA attestation. For container images, the SBOM is attached as an OCI referrer. SBOMs are regenerated on every build. The SBOM is retained for at least as long as the corresponding artifact is supported anywhere. SBOMs feed the vulnerability-scanning workflow ([ADR-037](037-vulnerability-scanning.md)) on a recurring schedule. The SBOM is validated against its format schema in CI before publication.

## Consequences

- Positive: vulnerability triage becomes a query against structured data rather than a manual search across repos
- Positive: SBOM-driven recurring scans surface CVEs disclosed after release, not only at build time
- Positive: signed SBOMs provide cryptographic evidence of what shipped in any given artifact
- Negative: generating and attaching SBOMs adds steps to the CI/CD pipeline and requires OCI referrer support in the registry
- Negative: SBOM retention for the lifetime of supported artifacts requires storage planning
- Neutral: post-build SBOM generation by re-resolving manifests, custom SBOM formats, and SBOMs stored only in wikis are all forbidden
