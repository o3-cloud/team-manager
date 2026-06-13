import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

type EventType = 'GAME' | 'PRACTICE' | 'MEETING' | 'OTHER';
type EventStatus = 'SCHEDULED' | 'CANCELLED';

interface TeamEvent {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  startsAt: string;
  location: string | null;
  notes: string | null;
}

type RosterEntryStatus = 'ACTIVE' | 'INJURED' | 'INACTIVE';

interface RosterEntry {
  id: string;
  displayName: string;
  jerseyNumber: string | null;
  position: string | null;
  userId: string | null;
  status: RosterEntryStatus;
}

interface Notification {
  id: string;
  isRead: boolean;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

interface Season {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface SeasonRecord {
  wins: number;
  losses: number;
  ties: number;
  goalsScored: number;
  attendanceRate: number | null;
}

type Loadable<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

const EVENT_TYPE_BADGE: Record<EventType, string> = {
  GAME: 'badge-primary',
  PRACTICE: 'badge-success',
  MEETING: 'badge-accent',
  OTHER: 'badge-ghost',
};

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  GAME: 'Game',
  PRACTICE: 'Practice',
  MEETING: 'Meeting',
  OTHER: 'Other',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function DashboardPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [events, setEvents] = useState<Loadable<TeamEvent[]>>({ status: 'loading' });
  const [roster, setRoster] = useState<Loadable<RosterEntry[]>>({ status: 'loading' });
  const [notifications, setNotifications] = useState<Loadable<Notification[]>>({
    status: 'loading',
  });
  const [announcements, setAnnouncements] = useState<Loadable<Announcement[]>>({
    status: 'loading',
  });
  const [record, setRecord] = useState<Loadable<SeasonRecord | null>>({ status: 'loading' });

  useEffect(() => {
    if (!teamId) return;

    api
      .get<TeamEvent[]>(`/teams/${teamId}/events`)
      .then((data) => setEvents({ status: 'ready', data }))
      .catch(() => setEvents({ status: 'error' }));

    api
      .get<RosterEntry[]>(`/teams/${teamId}/roster`)
      .then((data) => setRoster({ status: 'ready', data }))
      .catch(() => setRoster({ status: 'error' }));

    api
      .get<Notification[]>(`/teams/${teamId}/notifications`)
      .then((data) => setNotifications({ status: 'ready', data }))
      .catch(() => setNotifications({ status: 'error' }));

    api
      .get<Announcement[]>(`/teams/${teamId}/announcements`)
      .then((data) => setAnnouncements({ status: 'ready', data }))
      .catch(() => setAnnouncements({ status: 'error' }));

    api
      .get<Season[]>(`/teams/${teamId}/seasons`)
      .then(async (seasons) => {
        const active = seasons.find((s) => s.status === 'ACTIVE');
        if (!active) {
          setRecord({ status: 'ready', data: null });
          return;
        }
        const rec = await api.get<SeasonRecord>(`/teams/${teamId}/seasons/${active.id}/record`);
        setRecord({ status: 'ready', data: rec });
      })
      .catch(() => setRecord({ status: 'error' }));
  }, [teamId]);

  const upcoming = useMemo(() => {
    if (events.status !== 'ready') return [];
    const now = Date.now();
    return events.data
      .filter((e) => e.status === 'SCHEDULED' && new Date(e.startsAt).getTime() >= now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [events]);

  const nextEvent = upcoming[0] ?? null;
  const weekEvents = upcoming.slice(0, 5);

  const activePlayers = roster.status === 'ready' ? roster.data.length : null;
  const upcomingCount = events.status === 'ready' ? upcoming.length : null;
  const unreadAlerts =
    notifications.status === 'ready' ? notifications.data.filter((n) => !n.isRead).length : null;
  const messageCount = announcements.status === 'ready' ? announcements.data.length : null;
  const recentMessages = announcements.status === 'ready' ? announcements.data.slice(0, 3) : [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Team Dashboard</h1>
        <p className="text-sm text-base-content/60">Your team at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming Events"
          value={upcomingCount}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          label="Active Players"
          value={activePlayers}
          accent="bg-success/10 text-success"
        />
        <StatCard
          label="Tasks"
          value={messageCount}
          accent="bg-info/10 text-info"
          hint="messages"
        />
        <StatCard
          label="Alerts"
          value={unreadAlerts}
          accent="bg-warning/10 text-warning"
          hint={unreadAlerts ? 'requires attention' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Next Event */}
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-lg">Next Event</h2>
                <Link to={`/teams/${teamId}/events`} className="link link-primary text-sm">
                  View All Events
                </Link>
              </div>
              {events.status === 'loading' && <div className="skeleton h-24 w-full" />}
              {events.status === 'error' && (
                <p className="text-sm text-error">Could not load events.</p>
              )}
              {events.status === 'ready' && !nextEvent && (
                <p className="py-4 text-sm text-base-content/60">No upcoming events.</p>
              )}
              {nextEvent && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-box bg-primary text-primary-content">
                      <svg
                        className="h-6 w-6"
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
                    <div>
                      <p className="text-lg font-semibold">{nextEvent.title}</p>
                      <span className={`badge ${EVENT_TYPE_BADGE[nextEvent.type]} badge-sm`}>
                        {EVENT_TYPE_LABEL[nextEvent.type]}
                      </span>
                      <p className="mt-1 text-sm text-base-content/70">
                        {formatDate(nextEvent.startsAt)} · {formatTime(nextEvent.startsAt)}
                        {nextEvent.location ? ` · ${nextEvent.location}` : ''}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/teams/${teamId}/events/${nextEvent.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Team Roster */}
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-lg">Team Roster</h2>
                <Link to={`/teams/${teamId}/detail`} className="link link-primary text-sm">
                  View Full Roster
                </Link>
              </div>
              {roster.status === 'loading' && <div className="skeleton h-32 w-full" />}
              {roster.status === 'error' && (
                <p className="text-sm text-error">Could not load roster.</p>
              )}
              {roster.status === 'ready' && roster.data.length === 0 && (
                <p className="py-4 text-sm text-base-content/60">No players added yet.</p>
              )}
              {roster.status === 'ready' && roster.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Pos</th>
                        <th>Number</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.data.slice(0, 6).map((p) => (
                        <tr key={p.id}>
                          <td className="flex items-center gap-2">
                            <div className="avatar avatar-placeholder">
                              <div className="w-7 rounded-full bg-base-300 text-base-content">
                                <span className="text-xs">
                                  {p.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <span className="font-medium">{p.displayName}</span>
                          </td>
                          <td>{p.position ?? '—'}</td>
                          <td>{p.jerseyNumber ?? '—'}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${
                                p.status === 'ACTIVE'
                                  ? 'badge-success'
                                  : p.status === 'INJURED'
                                    ? 'badge-warning'
                                    : 'badge-ghost'
                              }`}
                            >
                              {p.status === 'ACTIVE'
                                ? 'Active'
                                : p.status === 'INJURED'
                                  ? 'Injured'
                                  : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {roster.data.length > 6 && (
                    <p className="text-xs text-base-content/50 mt-2 text-center">
                      and {roster.data.length - 6} more —{' '}
                      <Link to={`/teams/${teamId}/detail`} className="link link-primary">
                        view all
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Schedule */}
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">Schedule</h2>
              {events.status === 'loading' && <div className="skeleton h-24 w-full" />}
              {events.status === 'ready' && weekEvents.length === 0 && (
                <p className="py-2 text-sm text-base-content/60">Nothing scheduled.</p>
              )}
              <ul className="flex flex-col gap-3">
                {weekEvents.map((e) => (
                  <li key={e.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        e.type === 'GAME'
                          ? 'bg-success'
                          : e.type === 'MEETING'
                            ? 'bg-accent'
                            : 'bg-primary'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-base-content/60">
                        {formatDate(e.startsAt)} · {formatTime(e.startsAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Recent Messages */}
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-lg">Recent Messages</h2>
                <Link to={`/teams/${teamId}/announcements`} className="link link-primary text-sm">
                  View All
                </Link>
              </div>
              {announcements.status === 'loading' && <div className="skeleton h-20 w-full" />}
              {announcements.status === 'error' && (
                <p className="text-sm text-error">Could not load messages.</p>
              )}
              {announcements.status === 'ready' && recentMessages.length === 0 && (
                <p className="py-2 text-sm text-base-content/60">No messages yet.</p>
              )}
              <ul className="flex flex-col gap-3">
                {recentMessages.map((m) => (
                  <li key={m.id} className="border-b border-base-200 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <span className="shrink-0 text-xs text-base-content/50">
                        {timeAgo(m.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-base-content/60">{m.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Team Overview */}
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg">Team Overview</h2>
              {record.status === 'loading' && <div className="skeleton h-16 w-full" />}
              {record.status === 'error' && (
                <p className="text-sm text-error">Could not load season record.</p>
              )}
              {record.status === 'ready' && record.data === null && (
                <p className="py-2 text-sm text-base-content/60">No active season.</p>
              )}
              {record.status === 'ready' && record.data && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-base-content/50">
                      Win / Loss / Tie
                    </p>
                    <p className="text-2xl font-bold">
                      {record.data.wins} - {record.data.losses} - {record.data.ties}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-base-content/50">
                        Goals Scored
                      </p>
                      <p className="text-xl font-bold">{record.data.goalsScored}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-base-content/50">
                        Attendance
                      </p>
                      <p className="text-xl font-bold">
                        {record.data.attendanceRate === null
                          ? '—'
                          : `${record.data.attendanceRate}%`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: number | null;
  accent: string;
  hint?: string;
}) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body flex-row items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-box ${accent}`}>
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
          </svg>
        </div>
        <div>
          {value === null ? (
            <div className="skeleton h-7 w-10" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          <p className="text-sm text-base-content/60">{label}</p>
          {hint && <p className="text-xs text-base-content/40">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
