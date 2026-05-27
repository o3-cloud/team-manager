import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface Member {
  id: string;
  userId: string;
  role: string;
}

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface RosterEntry {
  id: string;
  displayName: string;
  jerseyNumber: string | null;
  position: string | null;
}

interface Invite {
  id: string;
  role: string;
  token: string;
  status: string;
  expiresAt: string;
}

type Tab = 'members' | 'seasons' | 'roster' | 'invites';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [tab, setTab] = useState<Tab>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teamId) return;
    api.get<Member[]>(`/teams/${teamId}/members`).then(setMembers).catch(console.error);
  }, [teamId]);

  useEffect(() => {
    if (!teamId || tab === 'members') return;
    if (tab === 'seasons') {
      api.get<Season[]>(`/teams/${teamId}/seasons`).then(setSeasons).catch(console.error);
    } else if (tab === 'roster') {
      api.get<RosterEntry[]>(`/teams/${teamId}/roster`).then(setRoster).catch(console.error);
    } else if (tab === 'invites') {
      api.get<Invite[]>(`/teams/${teamId}/invites`).then(setInvites).catch(console.error);
    }
  }, [teamId, tab]);

  async function archiveSeason(seasonId: string) {
    if (!teamId) return;
    try {
      const updated = await api.patch<Season>(`/teams/${teamId}/seasons/${seasonId}/archive`, {});
      setSeasons((prev) => prev.map((s) => (s.id === seasonId ? updated : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive season');
    }
  }

  async function revokeInvite(inviteId: string) {
    if (!teamId) return;
    try {
      await api.delete(`/teams/${teamId}/invites/${inviteId}`);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite');
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/teams" className="btn btn-sm btn-ghost">
            ← Back to teams
          </Link>
          <div className="flex gap-2">
            <Link to={`/teams/${teamId}/events`} className="btn btn-sm btn-outline">
              Events
            </Link>
            <Link to={`/teams/${teamId}/announcements`} className="btn btn-sm btn-outline">
              Announcements
            </Link>
            <Link to={`/teams/${teamId}/notifications`} className="btn btn-sm btn-outline">
              Notifications
            </Link>
            <Link to={`/teams/${teamId}/game-results`} className="btn btn-sm btn-outline">
              Results
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <div role="tablist" className="tabs tabs-boxed">
          {(['members', 'seasons', 'roster', 'invites'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              className={`tab capitalize${tab === t ? ' tab-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'members' && (
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="card bg-base-100 shadow p-3 flex flex-row items-center justify-between"
              >
                <span className="text-sm opacity-60">{m.userId}</span>
                <span className="badge badge-neutral">{m.role}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'seasons' && (
          <div className="space-y-2">
            {seasons.map((s) => (
              <div
                key={s.id}
                className="card bg-base-100 shadow p-3 flex flex-row items-center justify-between"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs opacity-60">
                    {s.startDate} – {s.endDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}
                  >
                    {s.status}
                  </span>
                  {s.status === 'ACTIVE' && (
                    <button
                      type="button"
                      className="btn btn-xs btn-warning"
                      onClick={() => archiveSeason(s.id)}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'roster' && (
          <ul className="space-y-2">
            {roster.map((e) => (
              <li key={e.id} className="card bg-base-100 shadow p-3">
                <p className="font-medium">{e.displayName}</p>
                <p className="text-xs opacity-60">
                  #{e.jerseyNumber ?? '—'} · {e.position ?? 'No position'}
                </p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'invites' && (
          <div className="space-y-2">
            {invites.map((i) => (
              <div
                key={i.id}
                className="card bg-base-100 shadow p-3 flex flex-row items-center justify-between"
              >
                <div>
                  <p className="text-sm font-mono break-all">{i.token}</p>
                  <p className="text-xs opacity-60">
                    Role: {i.role} · Status: {i.status}
                  </p>
                </div>
                {i.status === 'PENDING' && (
                  <button
                    type="button"
                    className="btn btn-xs btn-error"
                    onClick={() => revokeInvite(i.id)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
