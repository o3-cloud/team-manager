.PHONY: help dev build test test-integration test-e2e clean secrets doctor

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

secrets: ## Generate k8s/secrets.yaml from secrets.example.yaml with random values
	@if [ -f k8s/secrets.yaml ]; then \
		echo "k8s/secrets.yaml already exists. Delete it first to regenerate."; \
	else \
		echo "Generating k8s/secrets.yaml with random secrets..."; \
		POSTGRES_PASSWORD=$$(openssl rand -base64 24 | tr -d '=/+' | head -c 24); \
		JWT_SECRET=$$(openssl rand -base64 32 | tr -d '=/+' | head -c 32); \
		OO_PASSWORD=$$(openssl rand -base64 16 | tr -d '=/+' | head -c 16); \
		sed \
			-e "s|CHANGE_ME_POSTGRES_PASSWORD|$$POSTGRES_PASSWORD|g" \
			-e "s|CHANGE_ME_JWT_SECRET|$$JWT_SECRET|g" \
			-e "s|CHANGE_ME_OO_PASSWORD|$$OO_PASSWORD|g" \
			k8s/secrets.example.yaml > k8s/secrets.yaml; \
		echo "Done. k8s/secrets.yaml created (gitignored)."; \
	fi

dev: secrets ## Start skaffold dev loop (requires Docker Desktop k8s + Skaffold >= 2)
	skaffold dev

build: ## Build backend + frontend images locally
	skaffold build

test: ## Run all tests (unit + integration — does NOT require a running cluster)
	pnpm --filter @team-manager/backend test
	pnpm --filter @team-manager/frontend test

test-integration: ## Run backend integration tests (requires Docker — uses Testcontainers)
	pnpm --filter @team-manager/backend test:integration

test-e2e: ## Run Playwright e2e (requires `skaffold dev` to be running)
	pnpm --filter @team-manager/frontend test:e2e

clean: ## Tear down the cluster namespace + PVC and remove generated secrets
	skaffold delete --namespace team-manager 2>/dev/null || true
	kubectl delete namespace team-manager 2>/dev/null || true
	rm -f k8s/secrets.yaml

doctor: ## Verify prerequisites are installed and Docker Desktop k8s is enabled
	@echo "Checking prerequisites..."
	@PNPM_VER=$$(pnpm --version 2>/dev/null || true); \
	if [ -z "$$PNPM_VER" ]; then echo "  ✗ pnpm not found" && exit 1; fi; \
	PNPM_MAJ=$$(echo "$$PNPM_VER" | cut -d. -f1); \
	if [ "$$PNPM_MAJ" -ge 9 ]; \
	  then echo "  ✓ pnpm $$PNPM_VER"; \
	  else echo "  ✗ pnpm >= 9 required (found $$PNPM_VER)" && exit 1; \
	fi
	@skaffold version > /dev/null 2>&1 && echo "  ✓ Skaffold $$(skaffold version 2>/dev/null | head -1)" || (echo "  ✗ Skaffold not found — install: https://skaffold.dev/docs/install/" && exit 1)
	@kubectl config get-contexts docker-desktop > /dev/null 2>&1 && echo "  ✓ docker-desktop k8s context found" || (echo "  ✗ docker-desktop context not found — enable Kubernetes in Docker Desktop Settings" && exit 1)
	@docker info > /dev/null 2>&1 && echo "  ✓ Docker daemon running" || (echo "  ✗ Docker daemon not running" && exit 1)
	@echo "All prerequisites met!"
