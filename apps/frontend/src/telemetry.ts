import { openobserveLogs } from '@openobserve/browser-logs';
import { openobserveRum } from '@openobserve/browser-rum';

// All values are configurable via Vite env (define `VITE_OO_*` in `.env.local` or the
// k8s frontend ConfigMap). Defaults below let `pnpm dev` work against the in-cluster
// OpenObserve reached through the nginx `/rum/` proxy in production builds.
const clientToken = import.meta.env.VITE_OO_CLIENT_TOKEN ?? 'CHANGE_ME_RUM_CLIENT_TOKEN';
const site = import.meta.env.VITE_OO_SITE ?? window.location.host;
const organizationIdentifier = import.meta.env.VITE_OO_ORG ?? 'default';
const service = import.meta.env.VITE_OO_SERVICE ?? 'team-manager-frontend';
const env = import.meta.env.VITE_DEPLOYMENT_ENV ?? import.meta.env.MODE ?? 'development';
const version = import.meta.env.VITE_APP_VERSION ?? '0.0.1';
const insecureHTTP = (import.meta.env.VITE_OO_INSECURE_HTTP ?? 'true') === 'true';

openobserveRum.init({
  applicationId: 'team-manager-app',
  clientToken,
  site,
  organizationIdentifier,
  service,
  env,
  version,
  apiVersion: 'v1',
  insecureHTTP,
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,
  defaultPrivacyLevel: 'mask-user-input',
});

openobserveRum.startSessionReplayRecording();

openobserveLogs.init({
  clientToken,
  site,
  organizationIdentifier,
  service,
  env,
  version,
  apiVersion: 'v1',
  insecureHTTP,
  forwardErrorsToLogs: true,
});
