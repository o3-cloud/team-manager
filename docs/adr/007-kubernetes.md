# ADR-007: Kubernetes

## Status

Accepted

## Context and Problem Statement

The team needs a container orchestration platform for running production workloads. Kubernetes defaults optimize for "this YAML is valid" rather than "this workload will survive a node drain." Naked Pods do not restart when a node dies, containers without resource requests are evicted first, containers without memory limits can OOM-kill neighbors, the `default` namespace and `default` ServiceAccount with automatic token mounting are security liabilities, `:latest` image tags make deployments non-reproducible, and missing probes tell the kubelet a pod is ready before it actually is. We need a cross-workload baseline that covers declarative state, image pinning, controllers, namespaces, resource limits, probes, security contexts, RBAC, and NetworkPolicy.

## Decision Drivers

- Availability: Pod controllers, PodDisruptionBudgets, and topology spread prevent single-node failures from causing outages
- Security: `restricted` Pod Security profile, non-root users, read-only root filesystems, least-privilege ServiceAccounts, external-secret-manager-backed Secrets
- Reproducibility: digest-pinned images and GitOps-managed manifests eliminate "works on my machine" deployments
- Compliance: etcd encryption-at-rest, default-deny NetworkPolicy, and no direct-to-production interactive changes

## Considered Options

- Kubernetes with the `restricted` Pod Security baseline, GitOps, digest pinning, and External Secrets Operator
- Kubernetes with ad-hoc `kubectl edit`, `default` namespace, `latest` tags, and no security context
- Docker Compose / Docker Swarm (no autoscaling, no node-level HA)
- Serverless / managed container platforms (AWS ECS, Cloud Run) — rejected for portability reasons

## Decision Outcome

We will run all production workloads on Kubernetes. State is managed declaratively via GitOps. Images are pinned by digest or immutable version tag with `imagePullPolicy: IfNotPresent`. Workloads use Deployment, StatefulSet, Job, CronJob, or DaemonSet — never naked Pods. Every workload lives in a non-`default` namespace, carries recommended Kubernetes labels, sets `resources.requests` and `resources.limits.memory`, defines liveness and readiness probes, configures `terminationGracePeriodSeconds` with drain logic, has a PodDisruptionBudget, and uses topology spread constraints across zones. Every namespace enforces the `restricted` Pod Security profile. Every container sets `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, `capabilities.drop: ["ALL"]`, and `seccompProfile.type: RuntimeDefault`. Secrets come from an external secret manager via External Secrets Operator. Etcd encryption-at-rest is enabled. A default-deny NetworkPolicy is enforced per namespace.

## Consequences

- Positive: workloads survive node drains; security posture is enforced at the platform layer rather than per-service
- Positive: GitOps management makes cluster state auditable and reproducible
- Negative: the baseline requires more YAML authoring effort per workload
- Negative: external secret manager integration adds infrastructure dependencies
- Neutral: interactive `kubectl edit` of production resources is forbidden
