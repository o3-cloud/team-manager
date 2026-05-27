import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MemberRole } from './useTeamRole';
import { canWrite, useTeamRole } from './useTeamRole';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

describe('useTeamRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@test.com', displayName: 'Test' },
      token: 'tok',
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('returns PLAYER default while loading', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTeamRole('team-1'));
    expect(result.current).toBe('PLAYER');
  });

  it('returns the matched role after fetch resolves', async () => {
    vi.mocked(api.get).mockResolvedValue([
      { id: 'm-1', userId: 'user-123', role: 'COACH' as MemberRole },
      { id: 'm-2', userId: 'other-user', role: 'PLAYER' as MemberRole },
    ]);
    const { result } = renderHook(() => useTeamRole('team-1'));
    await waitFor(() => expect(result.current).toBe('COACH'));
  });

  it('returns PLAYER when user is not in members list', async () => {
    vi.mocked(api.get).mockResolvedValue([
      { id: 'm-1', userId: 'some-other-user', role: 'COACH' as MemberRole },
    ]);
    const { result } = renderHook(() => useTeamRole('team-1'));
    await waitFor(() => expect(result.current).toBe('PLAYER'));
  });

  it('returns PLAYER when API call fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useTeamRole('team-1'));
    await new Promise((r) => setTimeout(r, 20));
    expect(result.current).toBe('PLAYER');
  });

  it('does not call API when teamId is undefined', () => {
    vi.mocked(api.get).mockResolvedValue([]);
    const { result } = renderHook(() => useTeamRole(undefined));
    expect(result.current).toBe('PLAYER');
    expect(vi.mocked(api.get)).not.toHaveBeenCalled();
  });
});

describe('canWrite', () => {
  const cases: [MemberRole, boolean][] = [
    ['COACH', true],
    ['ASSISTANT_COACH', true],
    ['TEAM_MANAGER', true],
    ['SCOREKEEPER', false],
    ['PLAYER', false],
    ['PARENT', false],
  ];
  it.each(cases)('%s → %s', (role, expected) => {
    expect(canWrite(role)).toBe(expected);
  });
});
