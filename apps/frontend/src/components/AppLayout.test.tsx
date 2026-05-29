import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { AppLayout } from './AppLayout';

const TEAM_ID = 'team-1';

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={[`/teams/${TEAM_ID}/dashboard`]}>
      <Routes>
        <Route path="/teams/:teamId" element={<AppLayout />}>
          <Route path="dashboard" element={<div>Routed Child Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', email: 'coach@test.com', displayName: 'Ryan' },
      token: 'tok',
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path === '/teams') return Promise.resolve([{ id: TEAM_ID, name: 'Victory FC' }]);
      if (path.endsWith('/notifications'))
        return Promise.resolve([
          { id: 'n1', isRead: false },
          { id: 'n2', isRead: true },
        ]);
      return Promise.resolve([]);
    });
  });

  it('renders sidebar navigation links (FR-03, FR-06)', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      `/teams/${TEAM_ID}/dashboard`,
    );
    expect(screen.getByRole('link', { name: /events/i })).toHaveAttribute(
      'href',
      `/teams/${TEAM_ID}/events`,
    );
    expect(screen.getByRole('link', { name: /roster/i })).toHaveAttribute(
      'href',
      `/teams/${TEAM_ID}/detail`,
    );
  });

  it('renders routed child content via Outlet (FR-07)', () => {
    renderLayout();
    expect(screen.getByText('Routed Child Content')).toBeInTheDocument();
  });

  it('shows the team name fetched from the API (FR-03)', async () => {
    renderLayout();
    await waitFor(() => expect(screen.getByText('Victory FC')).toBeInTheDocument());
  });

  it('shows the unread notification count badge (FR-04)', async () => {
    renderLayout();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /notifications, 1 unread/i })).toBeInTheDocument(),
    );
  });

  it('renders the user display name in the top bar', () => {
    renderLayout();
    expect(screen.getByText('Ryan')).toBeInTheDocument();
  });
});
