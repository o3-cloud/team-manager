import { type ReactElement, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Team {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  isRead: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"
        />
      </svg>
    ),
  },
  {
    to: 'events',
    label: 'Events',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
        <path strokeWidth="2" strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: 'detail',
    label: 'Roster',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeWidth="2" strokeLinecap="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" strokeWidth="2" />
        <path
          strokeWidth="2"
          strokeLinecap="round"
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </svg>
    ),
  },
  {
    to: 'game-results',
    label: 'Schedule',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeWidth="2" strokeLinecap="round" d="M9 11l3 3L22 4" />
        <path
          strokeWidth="2"
          strokeLinecap="round"
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        />
      </svg>
    ),
  },
  {
    to: 'announcements',
    label: 'Messages',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        />
      </svg>
    ),
  },
  {
    to: 'notifications',
    label: 'Notifications',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        />
        <path strokeWidth="2" strokeLinecap="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export function AppLayout() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [teamName, setTeamName] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!teamId) return;
    api
      .get<Team[]>('/teams')
      .then((teams) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) setTeamName(team.name);
      })
      .catch(() => setTeamName(''));
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;
    api
      .get<Notification[]>(`/teams/${teamId}/notifications`)
      .then((items) => setUnreadCount(items.filter((n) => !n.isRead).length))
      .catch(() => setUnreadCount(0));
  }, [teamId, location.pathname]);

  function closeDrawer() {
    const toggle = document.getElementById('app-drawer-toggle') as HTMLInputElement | null;
    if (toggle) toggle.checked = false;
  }

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="app-drawer-toggle" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col bg-base-200/40">
        {/* Top bar */}
        <header className="navbar sticky top-0 z-10 gap-2 border-b border-base-300 bg-base-100 px-4 shadow-sm">
          <label
            htmlFor="app-drawer-toggle"
            className="btn btn-square btn-ghost drawer-button lg:hidden"
            aria-label="Open navigation"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </label>

          <div className="flex-1">
            <label className="input input-sm input-bordered hidden w-full max-w-md items-center gap-2 sm:flex">
              <svg
                className="h-4 w-4 opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                className="grow"
                placeholder="Search players, events, messages..."
              />
            </label>
          </div>

          <Link
            to={teamId ? `/teams/${teamId}/notifications` : '/teams'}
            className="btn btn-square btn-ghost"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            <div className="indicator">
              {unreadCount > 0 && (
                <span className="badge badge-primary badge-sm indicator-item">{unreadCount}</span>
              )}
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                />
                <path strokeWidth="2" strokeLinecap="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          </Link>

          <div className="dropdown dropdown-end">
            <button type="button" tabIndex={0} className="btn btn-ghost gap-2">
              <div className="avatar avatar-placeholder">
                <div className="w-8 rounded-full bg-primary text-primary-content">
                  <span className="text-sm">
                    {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                </div>
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.displayName ?? 'Account'}
              </span>
            </button>
            <ul className="dropdown-content menu z-20 mt-2 w-48 rounded-box bg-base-100 p-2 shadow">
              <li className="menu-title">{user?.email}</li>
              <li>
                <Link to="/teams">Switch team</Link>
              </li>
              <li>
                <button type="button" onClick={logout}>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </header>

        {/* Routed page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label
          htmlFor="app-drawer-toggle"
          className="drawer-overlay"
          aria-label="Close navigation"
        />
        <aside className="flex min-h-full w-64 flex-col bg-neutral text-neutral-content">
          {/* Team identity */}
          <div className="flex flex-col items-center gap-2 border-b border-neutral-content/10 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-box bg-primary text-primary-content">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="truncate text-base font-bold">{teamName || 'Team'}</p>
              <p className="text-xs text-neutral-content/60">Team Manager</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={teamId ? `/teams/${teamId}/${item.to}` : '/teams'}
                onClick={closeDrawer}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'text-neutral-content/80 hover:bg-neutral-content/10'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer: switch team */}
          <div className="border-t border-neutral-content/10 p-3">
            <Link
              to="/teams"
              onClick={closeDrawer}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-content/80 transition-colors hover:bg-neutral-content/10"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12h18M3 12l6-6M3 12l6 6"
                />
              </svg>
              <span>Switch team</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
