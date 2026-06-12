import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MemberRole } from './useTeamRole';
import { canWrite, clearAllRoleCaches, useTeamRole } from './useTeamRole';

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

const TEAM_ID = 'team-1';
const USER_ID = 'user-123';
const roleKey = (tid: string) => `tm-team-role-${tid}`;

describe('useTeamRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: USER_ID, email: 'test@test.com', displayName: 'Test' },
      token: 'tok',
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('returns PLAYER default while loading (no cache)', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTeamRole(TEAM_ID));
    expect(result.current).toBe('PLAYER');
  });

  it('returns cached role immediately on init (AC-11, FR-4a)', () => {
    sessionStorage.setItem(roleKey(TEAM_ID), 'COACH');
    vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useTeamRole(TEAM_ID));
    // Should read COACH from cache without waiting for API
    expect(result.current).toBe('COACH');
  });

  it('returns the matched role after fetch resolves and writes to cache (AC-11, FR-4b)', async () => {
    vi.mocked(api.get).mockResolvedValue([
      { id: 'm-1', userId: USER_ID, role: 'COACH' as MemberRole },
      { id: 'm-2', userId: 'other-user', role: 'PLAYER' as MemberRole },
    ]);
    const { result } = renderHook(() => useTeamRole(TEAM_ID));
    await waitFor(() => expect(result.current).toBe('COACH'));
    expect(sessionStorage.getItem(roleKey(TEAM_ID))).toBe('COACH');
  });

  it('returns PLAYER when user is not in members list', async () => {
    vi.mocked(api.get).mockResolvedValue([
      { id: 'm-1', userId: 'some-other-user', role: 'COACH' as MemberRole },
    ]);
    const { result } = renderHook(() => useTeamRole(TEAM_ID));
    await waitFor(() => expect(result.current).toBe('PLAYER'));
  });

  it('returns PLAYER when API call fails and clears cache', async () => {
    sessionStorage.setItem(roleKey(TEAM_ID), 'COACH');
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useTeamRole(TEAM_ID));
    // starts from cache
    expect(result.current).toBe('COACH');
    await new Promise((r) => setTimeout(r, 20));
    // after error, cache cleared
    expect(sessionStorage.getItem(roleKey(TEAM_ID))).toBeNull();
  });

  it('does not call API when teamId is undefined', () => {
    vi.mocked(api.get).mockResolvedValue([]);
    const { result } = renderHook(() => useTeamRole(undefined));
    expect(result.current).toBe('PLAYER');
    expect(vi.mocked(api.get)).not.toHaveBeenCalled();
  });
});

describe('clearAllRoleCaches (FR-4c)', () => {
  beforeEach(() => sessionStorage.clear());

  it('removes all tm-team-role-* keys from sessionStorage', () => {
    sessionStorage.setItem('tm-team-role-abc', 'COACH');
    sessionStorage.setItem('tm-team-role-xyz', 'PLAYER');
    sessionStorage.setItem('tm_token', 'keep-me');
    clearAllRoleCaches();
    expect(sessionStorage.getItem('tm-team-role-abc')).toBeNull();
    expect(sessionStorage.getItem('tm-team-role-xyz')).toBeNull();
    expect(sessionStorage.getItem('tm_token')).toBe('keep-me');
  });

  it('does not throw when no role cache keys exist', () => {
    expect(() => clearAllRoleCaches()).not.toThrow();
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
