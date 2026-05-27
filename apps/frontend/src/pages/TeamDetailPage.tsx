import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { canWrite, useTeamRole } from '../hooks/useTeamRole';
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
  userId: string | null;
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
  const role = useTeamRole(teamId);
  const [tab, setTab] = useState<Tab>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [displayNames, setDisplayNames] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState('');
  const [showCreateSeason, setShowCreateSeason] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [newSeasonStart, setNewSeasonStart] = useState('');
  const [newSeasonEnd, setNewSeasonEnd] = useState('');
  const [seasonFormError, setSeasonFormError] = useState('');
  const [seasonSubmitting, setSeasonSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    api.get<Member[]>(`/teams/${teamId}/members`).then(setMembers).catch(console.error);
    api
      .get<RosterEntry[]>(`/teams/${teamId}/roster`)
      .then((entries) => {
        const map = new Map<string, string>();
        for (const entry of entries) {
          if (entry.userId) map.set(entry.userId, entry.displayName);
        }
        setDisplayNames(map);
      })
      .catch(console.error);
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

  async function createSeason(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    const trimmedName = newSeasonName.trim();
    if (!trimmedName) {
      setSeasonFormError('Season name is required');
      return;
    }
    if (newSeasonEnd < newSeasonStart) {
      setSeasonFormError('End date must be on or after start date');
      return;
    }
    setSeasonSubmitting(true);
    setSeasonFormError('');
    try {
      const created = await api.post<Season>(`/teams/${teamId}/seasons`, {
        name: trimmedName,
        startDate: newSeasonStart,
        endDate: newSeasonEnd,
      });
      setSeasons((prev) => [created, ...prev]);
      setShowCreateSeason(false);
      setNewSeasonName('');
      setNewSeasonStart('');
      setNewSeasonEnd('');
    } catch (err) {
      setSeasonFormError(err instanceof Error ? err.message : 'Failed to create season');
    } finally {
      setSeasonSubmitting(false);
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
                <span className="text-sm">
                  {displayNames.get(m.userId) ?? `${m.userId.slice(0, 8)}…`}
                </span>
                <span className="badge badge-neutral">{m.role}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'seasons' && (
          <div className="space-y-2">
            {canWrite(role) && (
              <div>
                {!showCreateSeason ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateSeason(true)}
                  >
                    Create Season
                  </button>
                ) : (
                  <form onSubmit={createSeason} className="card bg-base-100 shadow p-4 space-y-3">
                    <h3 className="font-semibold text-sm">New Season</h3>
                    <div className="form-control">
                      <label className="label py-0" htmlFor="season-name">
                        <span className="label-text text-xs">Name</span>
                      </label>
                      <input
                        id="season-name"
                        type="text"
                        className="input input-bordered input-sm"
                        required
                        value={newSeasonName}
                        onChange={(e) => setNewSeasonName(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="form-control flex-1">
                        <label className="label py-0" htmlFor="season-start">
                          <span className="label-text text-xs">Start date</span>
                        </label>
                        <input
                          id="season-start"
                          type="date"
                          className="input input-bordered input-sm"
                          required
                          value={newSeasonStart}
                          onChange={(e) => setNewSeasonStart(e.target.value)}
                        />
                      </div>
                      <div className="form-control flex-1">
                        <label className="label py-0" htmlFor="season-end">
                          <span className="label-text text-xs">End date</span>
                        </label>
                        <input
                          id="season-end"
                          type="date"
                          className="input input-bordered input-sm"
                          required
                          value={newSeasonEnd}
                          onChange={(e) => setNewSeasonEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    {seasonFormError && (
                      <div className="alert alert-error text-xs py-2">{seasonFormError}</div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={seasonSubmitting}
                      >
                        {seasonSubmitting ? 'Creating…' : 'Create'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setShowCreateSeason(false);
                          setSeasonFormError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
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
