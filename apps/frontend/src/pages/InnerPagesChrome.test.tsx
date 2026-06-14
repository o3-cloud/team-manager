import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import AnnouncementsPage from './AnnouncementsPage';
import EventDetailPage from './EventDetailPage';
import EventsPage from './EventsPage';
import GameResultsPage from './GameResultsPage';
import NotificationsPage from './NotificationsPage';
import TeamDetailPage from './TeamDetailPage';

const TEAM_ID = 'team-1';
const EVENT_ID = 'event-1';
const USER_ID = 'u1';

type PageRoute = { path: string; element: ReactElement };

const PAGE_ROUTES: PageRoute[] = [
  { path: `/teams/${TEAM_ID}/detail`, element: <TeamDetailPage /> },
  { path: `/teams/${TEAM_ID}/events`, element: <EventsPage /> },
  { path: `/teams/${TEAM_ID}/events/${EVENT_ID}`, element: <EventDetailPage /> },
  { path: `/teams/${TEAM_ID}/announcements`, element: <AnnouncementsPage /> },
  { path: `/teams/${TEAM_ID}/notifications`, element: <NotificationsPage /> },
  { path: `/teams/${TEAM_ID}/game-results`, element: <GameResultsPage /> },
];

function renderPage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {PAGE_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

describe('Inner team pages drop their own chrome (F-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: USER_ID, email: 'coach@test.com', displayName: 'Ryan' },
      token: 'tok',
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path === `/teams/${TEAM_ID}/members`)
        return Promise.resolve([{ id: 'm1', userId: USER_ID, role: 'COACH' }]);
      if (path === `/teams/${TEAM_ID}/events`)
        return Promise.resolve([
          {
            id: EVENT_ID,
            title: 'Scrimmage',
            type: 'GAME',
            status: 'SCHEDULED',
            startsAt: new Date(Date.now() + 86400000).toISOString(),
            location: 'Field A',
            notes: null,
            version: 1,
          },
        ]);
      if (path === `/teams/${TEAM_ID}/events/${EVENT_ID}`)
        return Promise.resolve({
          id: EVENT_ID,
          title: 'Scrimmage',
          type: 'GAME',
          status: 'SCHEDULED',
          startsAt: new Date(Date.now() + 86400000).toISOString(),
          location: 'Field A',
          notes: null,
          version: 1,
        });
      if (path === `/teams/${TEAM_ID}/events/${EVENT_ID}/rsvp`)
        return Promise.resolve({ rsvps: [], nonRespondents: 0 });
      if (path === `/teams/${TEAM_ID}/events/${EVENT_ID}/attendance`) return Promise.resolve([]);
      if (path === `/teams/${TEAM_ID}/seasons`) return Promise.resolve([]);
      if (path === `/teams/${TEAM_ID}/roster`) return Promise.resolve([]);
      if (path === `/teams/${TEAM_ID}/roster/my-players`) return Promise.resolve([]);
      if (path === `/teams/${TEAM_ID}/invites`) return Promise.resolve([]);
      if (path === `/teams/${TEAM_ID}/announcements`) return Promise.resolve([]);
      if (path === `/teams/${TEAM_ID}/notifications`) return Promise.resolve([]);
      return Promise.resolve([]);
    });
  });

  it.each(PAGE_ROUTES.map((r) => r.path))('page %s does not render a back link', async (path) => {
    renderPage(path);
    await waitFor(() => expect(screen.queryByText(/← Back/)).not.toBeInTheDocument());
  });

  it.each(
    PAGE_ROUTES.map((r) => r.path),
  )('page %s does not render a full-page wrapper class', async (path) => {
    const { container } = renderPage(path);
    await waitFor(() => expect(screen.queryByText(/← Back/)).not.toBeInTheDocument());
    // The outermost element rendered by the page must not be the old full-page wrapper.
    const wrapper = container.firstElementChild;
    expect(wrapper).not.toHaveClass('min-h-screen');
    expect(wrapper).not.toHaveClass('bg-base-200');
    expect(wrapper).not.toHaveClass('p-6');
  });
});
