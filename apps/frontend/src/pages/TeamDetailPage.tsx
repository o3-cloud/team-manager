import { type FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canWrite, type MemberRole, useTeamRole } from '../hooks/useTeamRole';
import { api } from '../lib/api';

const ALL_ROLES: MemberRole[] = [
  'COACH',
  'ASSISTANT_COACH',
  'TEAM_MANAGER',
  'SCOREKEEPER',
  'PLAYER',
  'PARENT',
];

const ROLE_LABEL: Record<string, string> = {
  COACH: 'Coach',
  ASSISTANT_COACH: 'Assistant Coach',
  TEAM_MANAGER: 'Team Manager',
  SCOREKEEPER: 'Scorekeeper',
  PLAYER: 'Player',
  PARENT: 'Parent',
};

const INVITE_ROLES: MemberRole[] = ['PLAYER', 'PARENT', 'ASSISTANT_COACH', 'TEAM_MANAGER'];

interface Member {
  id: string;
  userId: string;
  role: MemberRole;
  displayName: string | null;
}

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

type RosterEntryStatus = 'ACTIVE' | 'INJURED' | 'INACTIVE';

const STATUS_LABEL: Record<RosterEntryStatus, string> = {
  ACTIVE: 'Active',
  INJURED: 'Injured',
  INACTIVE: 'Inactive',
};

interface RosterEntry {
  id: string;
  displayName: string;
  jerseyNumber: string | null;
  position: string | null;
  userId: string | null;
  status: RosterEntryStatus;
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
  const { user } = useAuth();
  const role = useTeamRole(teamId);
  const [tab, setTab] = useState<Tab>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [displayNames, setDisplayNames] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  // Season create
  const [showCreateSeason, setShowCreateSeason] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [newSeasonStart, setNewSeasonStart] = useState('');
  const [newSeasonEnd, setNewSeasonEnd] = useState('');
  const [seasonFormError, setSeasonFormError] = useState('');
  const [seasonSubmitting, setSeasonSubmitting] = useState(false);

  // Roster add
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addDisplayName, setAddDisplayName] = useState('');
  const [addJersey, setAddJersey] = useState('');
  const [addPosition, setAddPosition] = useState('');
  const [addStatus, setAddStatus] = useState<RosterEntryStatus>('ACTIVE');
  const [rosterAddError, setRosterAddError] = useState('');
  const [rosterAddSubmitting, setRosterAddSubmitting] = useState(false);

  // Roster inline edit
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editJersey, setEditJersey] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editStatus, setEditStatus] = useState<RosterEntryStatus>('ACTIVE');
  const [rosterEditError, setRosterEditError] = useState('');
  const [rosterEditSubmitting, setRosterEditSubmitting] = useState(false);

  // Link parent
  const [linkParentEntryId, setLinkParentEntryId] = useState<string | null>(null);
  const [linkParentUserId, setLinkParentUserId] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [linkedParents, setLinkedParents] = useState<Record<string, string>>({});

  // Create invite
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [newInviteRole, setNewInviteRole] = useState<MemberRole>('PLAYER');
  const [justCreatedToken, setJustCreatedToken] = useState<string | null>(null);
  const [inviteCreateError, setInviteCreateError] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  // Member role update
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [memberRoleError, setMemberRoleError] = useState('');

  useEffect(() => {
    if (!teamId) return;
    api
      .get<Member[]>(`/teams/${teamId}/members`)
      .then(setMembers)
      .catch((err) => {
        if ((err as { status?: number }).status === 403) {
          setAccessDenied(true);
        } else {
          console.error(err);
        }
      });
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

  async function createSeason(e: FormEvent) {
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

  async function addPlayer(e: FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    const name = addDisplayName.trim();
    if (!name) {
      setRosterAddError('Display name is required');
      return;
    }
    setRosterAddSubmitting(true);
    setRosterAddError('');
    try {
      const created = await api.post<RosterEntry>(`/teams/${teamId}/roster`, {
        displayName: name,
        jerseyNumber: addJersey.trim() || undefined,
        position: addPosition.trim() || undefined,
        status: addStatus,
      });
      setRoster((prev) => [...prev, created]);
      setShowAddPlayer(false);
      setAddDisplayName('');
      setAddJersey('');
      setAddPosition('');
      setAddStatus('ACTIVE');
    } catch (err) {
      setRosterAddError(err instanceof Error ? err.message : 'Failed to add player');
    } finally {
      setRosterAddSubmitting(false);
    }
  }

  function openEdit(entry: RosterEntry) {
    setEditEntryId(entry.id);
    setEditDisplayName(entry.displayName);
    setEditJersey(entry.jerseyNumber ?? '');
    setEditPosition(entry.position ?? '');
    setEditStatus(entry.status);
    setRosterEditError('');
  }

  async function saveEdit(entryId: string) {
    if (!teamId) return;
    const name = editDisplayName.trim();
    if (!name) {
      setRosterEditError('Display name is required');
      return;
    }
    setRosterEditSubmitting(true);
    setRosterEditError('');
    try {
      const updated = await api.patch<RosterEntry>(`/teams/${teamId}/roster/${entryId}`, {
        displayName: name,
        jerseyNumber: editJersey.trim() || undefined,
        position: editPosition.trim() || undefined,
        status: editStatus,
      });
      setRoster((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
      setEditEntryId(null);
    } catch (err) {
      setRosterEditError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setRosterEditSubmitting(false);
    }
  }

  function openLinkParent(entryId: string) {
    const firstParent = members.find((m) => m.role === 'PARENT');
    setLinkParentUserId(firstParent?.userId ?? '');
    setLinkParentEntryId(entryId);
    setLinkError('');
  }

  async function submitLinkParent(entryId: string) {
    if (!teamId || !linkParentUserId) return;
    setLinkSubmitting(true);
    setLinkError('');
    try {
      await api.post(`/teams/${teamId}/roster/${entryId}/parents`, {
        parentUserId: linkParentUserId,
      });
      const parent = members.find((m) => m.userId === linkParentUserId);
      setLinkedParents((prev) => ({
        ...prev,
        [entryId]: parent?.displayName ?? linkParentUserId,
      }));
      setLinkParentEntryId(null);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Failed to link parent');
    } finally {
      setLinkSubmitting(false);
    }
  }

  async function createInvite(e: FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setInviteSubmitting(true);
    setInviteCreateError('');
    try {
      const created = await api.post<Invite>(`/teams/${teamId}/invites`, { role: newInviteRole });
      setJustCreatedToken(created.token);
      setInvites((prev) => [...prev, { ...created, token: '' }]);
      setShowCreateInvite(false);
    } catch (err) {
      setInviteCreateError(err instanceof Error ? err.message : 'Failed to create invite');
    } finally {
      setInviteSubmitting(false);
    }
  }

  async function updateMemberRole(memberId: string, targetUserId: string, newRole: MemberRole) {
    if (!teamId) return;
    setUpdatingMemberId(memberId);
    setMemberRoleError('');
    try {
      await api.patch(`/teams/${teamId}/members/${targetUserId}/role`, { role: newRole });
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    } catch (err) {
      setMemberRoleError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdatingMemberId(null);
    }
  }

  const parentMembers = members.filter((m) => m.role === 'PARENT');

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Link to="/teams" className="btn btn-sm btn-ghost">
            ← Back to teams
          </Link>
          <div className="card bg-base-100 shadow p-6 space-y-3">
            <div className="alert alert-error">
              <span>You don't have access to this team.</span>
            </div>
            <Link to="/teams" className="btn btn-primary btn-sm">
              Back to My Teams
            </Link>
          </div>
        </div>
      </div>
    );
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
          <div className="space-y-2">
            {memberRoleError && <div className="alert alert-error text-sm">{memberRoleError}</div>}
            <ul className="space-y-2">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="card bg-base-100 shadow p-3 flex flex-row items-center justify-between"
                >
                  <span className="text-sm">
                    {m.displayName ?? displayNames.get(m.userId) ?? `${m.userId.slice(0, 8)}…`}
                  </span>
                  {canWrite(role) && m.userId !== user?.id ? (
                    <select
                      className="select select-bordered select-xs"
                      value={m.role}
                      disabled={updatingMemberId === m.id}
                      aria-label={`Role for ${m.displayName ?? m.userId}`}
                      onChange={(e) =>
                        updateMemberRole(m.id, m.userId, e.target.value as MemberRole)
                      }
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="badge badge-neutral">{ROLE_LABEL[m.role] ?? m.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
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
                  {s.status === 'ACTIVE' && canWrite(role) && (
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
          <div className="space-y-3">
            {canWrite(role) && (
              <div>
                {!showAddPlayer ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddPlayer(true)}
                  >
                    Add Player
                  </button>
                ) : (
                  <form onSubmit={addPlayer} className="card bg-base-100 shadow p-4 space-y-3">
                    <h3 className="font-semibold text-sm">New Player</h3>
                    {rosterAddError && (
                      <div className="alert alert-error text-xs py-2">{rosterAddError}</div>
                    )}
                    <div className="flex gap-2">
                      <div className="form-control flex-1">
                        <label className="label py-0" htmlFor="add-name">
                          <span className="label-text text-xs">Display name *</span>
                        </label>
                        <input
                          id="add-name"
                          type="text"
                          className="input input-bordered input-sm"
                          required
                          maxLength={100}
                          value={addDisplayName}
                          onChange={(e) => setAddDisplayName(e.target.value)}
                        />
                      </div>
                      <div className="form-control w-24">
                        <label className="label py-0" htmlFor="add-jersey">
                          <span className="label-text text-xs">Jersey #</span>
                        </label>
                        <input
                          id="add-jersey"
                          type="text"
                          className="input input-bordered input-sm"
                          maxLength={20}
                          value={addJersey}
                          onChange={(e) => setAddJersey(e.target.value)}
                        />
                      </div>
                      <div className="form-control flex-1">
                        <label className="label py-0" htmlFor="add-position">
                          <span className="label-text text-xs">Position</span>
                        </label>
                        <input
                          id="add-position"
                          type="text"
                          className="input input-bordered input-sm"
                          maxLength={50}
                          value={addPosition}
                          onChange={(e) => setAddPosition(e.target.value)}
                        />
                      </div>
                      <div className="form-control w-32">
                        <label className="label py-0" htmlFor="add-status">
                          <span className="label-text text-xs">Status</span>
                        </label>
                        <select
                          id="add-status"
                          className="select select-bordered select-sm"
                          value={addStatus}
                          onChange={(e) => setAddStatus(e.target.value as RosterEntryStatus)}
                        >
                          {(['ACTIVE', 'INJURED', 'INACTIVE'] as RosterEntryStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={rosterAddSubmitting}
                      >
                        {rosterAddSubmitting ? 'Adding…' : 'Add'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setShowAddPlayer(false);
                          setRosterAddError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            <ul className="space-y-2">
              {roster.map((e) => (
                <li key={e.id} className="card bg-base-100 shadow p-3 space-y-2">
                  {editEntryId === e.id ? (
                    <div className="space-y-2">
                      {rosterEditError && (
                        <div className="alert alert-error text-xs py-2">{rosterEditError}</div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered input-sm flex-1"
                          aria-label="Display name"
                          value={editDisplayName}
                          onChange={(ev) => setEditDisplayName(ev.target.value)}
                          maxLength={100}
                        />
                        <input
                          type="text"
                          className="input input-bordered input-sm w-20"
                          aria-label="Jersey number"
                          value={editJersey}
                          onChange={(ev) => setEditJersey(ev.target.value)}
                          maxLength={20}
                          placeholder="Jersey #"
                        />
                        <input
                          type="text"
                          className="input input-bordered input-sm flex-1"
                          aria-label="Position"
                          value={editPosition}
                          onChange={(ev) => setEditPosition(ev.target.value)}
                          maxLength={50}
                          placeholder="Position"
                        />
                        <select
                          className="select select-bordered select-sm w-28"
                          aria-label="Status"
                          value={editStatus}
                          onChange={(ev) => setEditStatus(ev.target.value as RosterEntryStatus)}
                        >
                          {(['ACTIVE', 'INJURED', 'INACTIVE'] as RosterEntryStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          disabled={rosterEditSubmitting}
                          onClick={() => saveEdit(e.id)}
                        >
                          {rosterEditSubmitting ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => setEditEntryId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{e.displayName}</p>
                        <p className="text-xs opacity-60">
                          #{e.jerseyNumber ?? '—'} · {e.position ?? 'No position'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`badge badge-sm ${
                            e.status === 'ACTIVE'
                              ? 'badge-success'
                              : e.status === 'INJURED'
                                ? 'badge-warning'
                                : 'badge-ghost'
                          }`}
                        >
                          {STATUS_LABEL[e.status]}
                        </span>
                        {canWrite(role) && (
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => openEdit(e)}
                            >
                              Edit
                            </button>
                            {linkedParents[e.id] ? (
                              <span className="text-xs opacity-60">
                                Parent: {linkedParents[e.id]}
                              </span>
                            ) : linkParentEntryId === e.id ? (
                              <div className="flex items-center gap-1">
                                {linkError && (
                                  <span className="text-xs text-error">{linkError}</span>
                                )}
                                {parentMembers.length === 0 ? (
                                  <span className="text-xs opacity-60">No PARENT members</span>
                                ) : (
                                  <select
                                    className="select select-bordered select-xs"
                                    value={linkParentUserId}
                                    aria-label="Select parent"
                                    onChange={(ev) => setLinkParentUserId(ev.target.value)}
                                  >
                                    {parentMembers.map((m) => (
                                      <option key={m.userId} value={m.userId}>
                                        {m.displayName ?? m.userId.slice(0, 8)}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-xs btn-primary"
                                  disabled={linkSubmitting || parentMembers.length === 0}
                                  onClick={() => submitLinkParent(e.id)}
                                >
                                  {linkSubmitting ? '…' : 'Link'}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-xs btn-ghost"
                                  onClick={() => setLinkParentEntryId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-xs btn-secondary"
                                onClick={() => openLinkParent(e.id)}
                              >
                                Link Parent
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
              {roster.length === 0 && !showAddPlayer && (
                <li className="text-sm opacity-60 text-center py-8">
                  No roster entries yet.{canWrite(role) ? ' Click "Add Player" to start.' : ''}
                </li>
              )}
            </ul>
          </div>
        )}

        {tab === 'invites' && (
          <div className="space-y-3">
            {canWrite(role) && (
              <div className="space-y-2">
                {justCreatedToken && (
                  <div className="alert alert-success flex flex-col items-start gap-2">
                    <p className="text-sm font-semibold">Invite created — copy token now:</p>
                    <code className="bg-base-200 rounded px-2 py-1 text-sm break-all select-all">
                      {justCreatedToken}
                    </code>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => setJustCreatedToken(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                {inviteCreateError && (
                  <div className="alert alert-error text-sm">{inviteCreateError}</div>
                )}
                {!showCreateInvite ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreateInvite(true)}
                  >
                    Create Invite
                  </button>
                ) : (
                  <form
                    onSubmit={createInvite}
                    className="card bg-base-100 shadow p-4 flex gap-3 items-end"
                  >
                    <div className="form-control">
                      <label className="label py-0" htmlFor="invite-role">
                        <span className="label-text text-xs">Role</span>
                      </label>
                      <select
                        id="invite-role"
                        className="select select-bordered select-sm"
                        value={newInviteRole}
                        onChange={(e) => setNewInviteRole(e.target.value as MemberRole)}
                      >
                        {INVITE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={inviteSubmitting}
                    >
                      {inviteSubmitting ? 'Generating…' : 'Generate'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setShowCreateInvite(false);
                        setInviteCreateError('');
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            )}
            <ul className="space-y-2">
              {invites.map((i) => (
                <li
                  key={i.id}
                  className="card bg-base-100 shadow p-3 flex flex-row items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-mono break-all text-xs opacity-60">
                      {i.token || '(token hidden — copy at creation time)'}
                    </p>
                    <p className="text-xs opacity-60">
                      Role: {ROLE_LABEL[i.role] ?? i.role} · Status: {i.status}
                    </p>
                  </div>
                  {i.status === 'PENDING' && canWrite(role) && (
                    <button
                      type="button"
                      className="btn btn-xs btn-error"
                      onClick={() => revokeInvite(i.id)}
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
              {invites.length === 0 && !showCreateInvite && (
                <li className="text-sm opacity-60 text-center py-8">
                  No invites yet.{canWrite(role) ? ' Click "Create Invite" to generate one.' : ''}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
