# ADR-001: Docker

## Status

Accepted

## Context and Problem Statement

Container images are the unit of delivery — every byte of software the runtime executes lives inside them. Without disciplined image construction, security controls set elsewhere in the stack silently erode: a `FROM ubuntu:latest` makes builds non-reproducible, a missing `USER` directive ships workloads as root, installing packages without version pins causes drift between rebuilds, secrets baked into `ENV` or `ARG` leak into image history, and single-stage builds ship compilers and test frameworks into production. We need a standardized way to build, tag, sign, and publish container images so every artifact in a registry is minimal, reproducible, attested, and free of credentials.

## Decision Drivers

- Reproducibility: identical inputs must produce identical images across CI runs and developer machines
- Security: non-root execution, no credentials in layers, signed artifacts, vulnerability-scanned before publication
- Supply-chain integrity: images must be attested (SBOM, cosign signature) and traceable back to a specific CI run
- Operational safety: production deployments must never pull from a mutable tag

## Considered Options

- Multi-stage Docker with BuildKit, digest pinning, cosign signing, SBOM generation, and Trivy scanning
- Single-stage Dockerfiles with mutable tags (status quo / no convention)
- Buildah or Kaniko for rootless builds without multi-stage discipline
- Ad-hoc shell scripts wrapping `docker commit`

## Decision Outcome

We will use multi-stage Dockerfiles checked into the repo, with every base image referenced by immutable digest, final stages based on minimal/distroless images, a non-root `USER` directive, package-version pinning, secrets injected via BuildKit `--mount=type=secret`, exec-form `ENTRYPOINT`, `HEALTHCHECK` for service images, BuildKit (`docker buildx build`), immutable build-identifier tags, cosign image signing, SBOM generation per [ADR-036](036-sbom.md), and Trivy scanning in CI.

## Decision Drivers

- Digest pinning eliminates tag-rewrite attacks and build non-reproducibility
- Multi-stage builds prevent compiler/test-toolchain leak into production images
- Non-root users and read-only root filesystems shrink the exploit surface
- Cosign signatures and SBOMs provide supply-chain attestation

## Consequences

- Positive: images are reproducible, minimal, signed, and scanned; production manifests reference digests so deployments are deterministic
- Negative: multi-stage Dockerfiles require more authoring discipline; BuildKit and cosign add CI toolchain dependencies
- Negative: digest pinning requires deliberate upgrades via Renovate ([ADR-035](035-renovate.md)) rather than implicit tag pulls
- Neutral: `ad-hoc docker commit` and single-stage workflows are forbidden by this decision
