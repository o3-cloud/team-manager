import { openobserveRum } from '@openobserve/browser-rum';
import { describe, expect, it, vi } from 'vitest';
import './telemetry';

vi.mock('@openobserve/browser-rum', () => ({
  openobserveRum: {
    init: vi.fn(),
    startSessionReplayRecording: vi.fn(),
  },
}));

vi.mock('@openobserve/browser-logs', () => ({
  openobserveLogs: {
    init: vi.fn(),
  },
}));

describe('telemetry initialisation', () => {
  it('calls startSessionReplayRecording after init (AC-1)', () => {
    expect(openobserveRum.init).toHaveBeenCalledOnce();
    expect(openobserveRum.startSessionReplayRecording).toHaveBeenCalledOnce();

    const initOrder = vi.mocked(openobserveRum.init).mock.invocationCallOrder[0];
    const replayOrder = vi.mocked(openobserveRum.startSessionReplayRecording).mock
      .invocationCallOrder[0];
    expect(initOrder).toBeLessThan(replayOrder);
  });

  it('configures mask-user-input privacy level (AC-2 / NFR-01)', () => {
    expect(openobserveRum.init).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPrivacyLevel: 'mask-user-input' }),
    );
  });
});
