import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { api } from '../lib/api';
import DashboardPage from './DashboardPage';

const TEAM_ID = 'team-1';
const FUTURE = new Date(Date.now() + 86400000).toISOString();

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={[`/teams/${TEAM_ID}/dashboard`]}>
      <Routes>
        <Route path="/teams/:teamId/dashboard" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Route api.get calls to canned responses by path suffix. */
function mockApi(overrides: Record<string, unknown> = {}) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.endsWith('/events')) return Promise.resolve(overrides.events ?? []);
    if (path.endsWith('/roster')) return Promise.resolve(overrides.roster ?? []);
    if (path.endsWith('/notifications')) return Promise.resolve(overrides.notifications ?? []);
    if (path.endsWith('/announcements')) return Promise.resolve(overrides.announcements ?? []);
    if (path.endsWith('/seasons')) return Promise.resolve(overrides.seasons ?? []);
    if (path.includes('/record'))
      return Promise.resolve(overrides.record ?? { wins: 0, losses: 0, ties: 0 });
    return Promise.resolve([]);
  });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard heading and stat cards (AC-01)', async () => {
    mockApi({
      events: [
        {
          id: 'e1',
          title: 'vs. Eastview FC',
          type: 'GAME',
          status: 'SCHEDULED',
          startsAt: FUTURE,
          location: 'Field 2',
          notes: null,
        },
      ],
      roster: [
        {
          id: 'r1',
          displayName: 'Liam',
          jerseyNumber: '10',
          position: 'FW',
          userId: 'u1',
          status: 'ACTIVE',
        },
      ],
      notifications: [{ id: 'n1', isRead: false }],
    });
    renderDashboard();

    expect(screen.getByRole('heading', { name: /team dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('Active Players')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();

    // Active players count resolves to 1
    await waitFor(() =>
      expect(screen.getByText('Active Players').previousSibling).toHaveTextContent('1'),
    );
  });

  it('shows the next event with title and View Details link (FR-09)', async () => {
    mockApi({
      events: [
        {
          id: 'e1',
          title: 'vs. Eastview FC',
          type: 'GAME',
          status: 'SCHEDULED',
          startsAt: FUTURE,
          location: 'Field 2',
          notes: null,
        },
      ],
    });
    renderDashboard();

    // The event title appears in both the Next Event card and the Schedule list.
    await waitFor(() => expect(screen.getAllByText('vs. Eastview FC').length).toBeGreaterThan(0));
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
      'href',
      `/teams/${TEAM_ID}/events/e1`,
    );
  });

  it('renders roster rows with Active and Injured status badges (AC-02, OQ-02)', async () => {
    mockApi({
      roster: [
        {
          id: 'r1',
          displayName: 'Liam Johnson',
          jerseyNumber: '10',
          position: 'FW',
          userId: 'u1',
          status: 'ACTIVE',
        },
        {
          id: 'r2',
          displayName: 'Mason Davis',
          jerseyNumber: '1',
          position: 'GK',
          userId: null,
          status: 'INJURED',
        },
      ],
    });
    renderDashboard();

    await waitFor(() => expect(screen.getByText('Liam Johnson')).toBeInTheDocument());
    expect(screen.getByText('Mason Davis')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Injured')).toBeInTheDocument();
  });

  it('shows empty states when there is no data (E-01, E-02, E-04, E-03)', async () => {
    mockApi({ seasons: [] });
    renderDashboard();

    await waitFor(() => expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument());
    expect(screen.getByText(/no players added yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no active season/i)).toBeInTheDocument();
  });

  it('shows the season win/loss/tie record when an active season exists (FR-13)', async () => {
    mockApi({
      seasons: [{ id: 's1', status: 'ACTIVE' }],
      record: { wins: 8, losses: 2, ties: 1 },
    });
    renderDashboard();

    await waitFor(() => expect(screen.getByText('8 - 2 - 1')).toBeInTheDocument());
  });

  it('shows a per-section error without blanking the page (E-07)', async () => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.endsWith('/roster')) return Promise.reject(new Error('boom'));
      if (path.endsWith('/seasons')) return Promise.resolve([]);
      return Promise.resolve([]);
    });
    renderDashboard();

    await waitFor(() => expect(screen.getByText(/could not load roster/i)).toBeInTheDocument());
    // The rest of the page still rendered
    expect(screen.getByRole('heading', { name: /team dashboard/i })).toBeInTheDocument();
  });
});
