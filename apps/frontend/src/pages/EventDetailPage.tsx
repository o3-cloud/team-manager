import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { canWrite, useTeamRole } from '../hooks/useTeamRole';
import { api } from '../lib/api';

type EventStatus = 'SCHEDULED' | 'CANCELLED';
type RsvpStatus = 'GOING' | 'NOT_GOING' | 'MAYBE';
type AttendanceMark = 'PRESENT' | 'ABSENT';

interface TeamEvent {
  id: string;
  title: string;
  type: string;
  status: EventStatus;
  startsAt: string;
  location: string | null;
  notes: string | null;
  version: number;
}

interface RsvpEntry {
  userId: string;
  displayName: string | null;
  status: RsvpStatus;
}

interface RsvpSummary {
  rsvps: RsvpEntry[];
  nonRespondents: number;
}

interface LinkedPlayer {
  id: string;
  displayName: string;
  userId: string | null;
}

interface RosterEntrySlim {
  id: string;
  displayName: string;
  jerseyNumber: string | null;
}

interface AttendanceRecord {
  rosterEntryId: string;
  mark: AttendanceMark;
}

export default function EventDetailPage() {
  const { teamId, eventId } = useParams<{ teamId: string; eventId: string }>();
  const role = useTeamRole(teamId);
  const [event, setEvent] = useState<TeamEvent | null>(null);
  const [rsvpSummary, setRsvpSummary] = useState<RsvpSummary | null>(null);
  const [linkedPlayers, setLinkedPlayers] = useState<LinkedPlayer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [error, setError] = useState('');
  const [rsvpError, setRsvpError] = useState('');
  const [actionError, setActionError] = useState('');
  const [editError, setEditError] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editStartsAt, setEditStartsAt] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Attendance
  const [rosterForAttendance, setRosterForAttendance] = useState<RosterEntrySlim[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSubmitting, setAttendanceSubmitting] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState('');

  useEffect(() => {
    if (!teamId || !eventId) return;
    api
      .get<TeamEvent>(`/teams/${teamId}/events/${eventId}`)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load event'));
    api
      .get<RsvpSummary>(`/teams/${teamId}/events/${eventId}/rsvp`)
      .then(setRsvpSummary)
      .catch((err) => setRsvpError(err instanceof Error ? err.message : 'Failed to load RSVPs'));
  }, [teamId, eventId]);

  useEffect(() => {
    if (role === 'PARENT' && teamId) {
      api
        .get<LinkedPlayer[]>(`/teams/${teamId}/roster/my-players`)
        .then((players) => {
          const withAccount = players.filter((p) => p.userId !== null);
          setLinkedPlayers(withAccount);
          if (withAccount.length > 0) setSelectedPlayerId(withAccount[0].id);
        })
        .catch(console.error);
    }
  }, [role, teamId]);

  // Load attendance data once we know the event is a past SCHEDULED event and user can write
  useEffect(() => {
    if (!teamId || !eventId || !event) return;
    const isPast = new Date(event.startsAt) < new Date();
    if (!canWrite(role) || event.status !== 'SCHEDULED' || !isPast) return;
    api
      .get<RosterEntrySlim[]>(`/teams/${teamId}/roster`)
      .then(setRosterForAttendance)
      .catch(console.error);
    api
      .get<AttendanceRecord[]>(`/teams/${teamId}/events/${eventId}/attendance`)
      .then(setAttendanceRecords)
      .catch(console.error);
  }, [teamId, eventId, event, role]);

  function refreshRsvp() {
    if (!teamId || !eventId) return;
    api
      .get<RsvpSummary>(`/teams/${teamId}/events/${eventId}/rsvp`)
      .then(setRsvpSummary)
      .catch(console.error);
  }

  async function submitRsvp(status: RsvpStatus) {
    if (!teamId || !eventId) return;
    setRsvpSubmitting(true);
    setRsvpError('');
    try {
      const body: { status: RsvpStatus; onBehalfOfUserId?: string } = { status };
      if (role === 'PARENT' && selectedPlayerId) {
        const player = linkedPlayers.find((p) => p.id === selectedPlayerId);
        if (player?.userId) body.onBehalfOfUserId = player.userId;
      }
      await api.put(`/teams/${teamId}/events/${eventId}/rsvp`, body);
      refreshRsvp();
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : 'Failed to submit RSVP');
    } finally {
      setRsvpSubmitting(false);
    }
  }

  async function cancelEvent(reason: string) {
    if (!teamId || !eventId || !event) return;
    setActionSubmitting(true);
    setActionError('');
    try {
      const updated = await api.post<TeamEvent>(`/teams/${teamId}/events/${eventId}/cancel`, {
        version: event.version,
        reason,
      });
      setEvent(updated);
      setShowCancelForm(false);
      setCancelReason('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel event');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function reinstateEvent() {
    if (!teamId || !eventId || !event) return;
    setActionSubmitting(true);
    setActionError('');
    try {
      const updated = await api.post<TeamEvent>(`/teams/${teamId}/events/${eventId}/reinstate`, {
        version: event.version,
      });
      setEvent(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reinstate event');
    } finally {
      setActionSubmitting(false);
    }
  }

  function openEditForm() {
    if (!event) return;
    setEditTitle(event.title);
    setEditStartsAt(new Date(event.startsAt).toISOString().slice(0, 16));
    setEditLocation(event.location ?? '');
    setEditNotes(event.notes ?? '');
    setEditError('');
    setShowEditForm(true);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !eventId || !event) return;
    setEditSubmitting(true);
    setEditError('');
    try {
      const updated = await api.patch<TeamEvent>(`/teams/${teamId}/events/${eventId}`, {
        title: editTitle,
        startsAt: new Date(editStartsAt).toISOString(),
        location: editLocation || null,
        notes: editNotes || null,
        version: event.version,
      });
      setEvent(updated);
      setShowEditForm(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('409') || msg.toLowerCase().includes('conflict')) {
        setEditError('Event was updated by someone else — please refresh');
      } else {
        setEditError(msg || 'Failed to save event');
      }
    } finally {
      setEditSubmitting(false);
    }
  }

  async function submitMark(rosterEntryId: string, mark: AttendanceMark) {
    if (!teamId || !eventId) return;
    setAttendanceSubmitting(rosterEntryId);
    setAttendanceError('');
    try {
      await api.put(`/teams/${teamId}/events/${eventId}/attendance`, { rosterEntryId, mark });
      setAttendanceRecords((prev) => {
        const existing = prev.find((r) => r.rosterEntryId === rosterEntryId);
        if (existing)
          return prev.map((r) => (r.rosterEntryId === rosterEntryId ? { ...r, mark } : r));
        return [...prev, { rosterEntryId, mark }];
      });
    } catch (err) {
      setAttendanceError(err instanceof Error ? err.message : 'Failed to record attendance');
    } finally {
      setAttendanceSubmitting(null);
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="alert alert-error text-sm">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  const isPast = new Date(event.startsAt) < new Date();
  const showAttendance = canWrite(role) && event.status === 'SCHEDULED' && isPast;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Event details */}
      <div className="card bg-base-100 shadow p-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1
            className={`text-2xl font-bold${event.status === 'CANCELLED' ? ' line-through opacity-60' : ''}`}
          >
            {event.title}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <span className="badge badge-neutral">{event.type}</span>
            {event.status === 'CANCELLED' ? (
              <span className="badge badge-error">Cancelled</span>
            ) : (
              <span className="badge badge-success">Scheduled</span>
            )}
          </div>
        </div>

        <p className="text-sm opacity-70">{new Date(event.startsAt).toLocaleString()}</p>

        {event.location && (
          <p className="text-sm">
            <span className="opacity-60">Location:</span> {event.location}
          </p>
        )}

        {event.notes && (
          <p className="text-sm">
            <span className="opacity-60">Notes:</span> {event.notes}
          </p>
        )}
      </div>

      {/* RSVP section */}
      <div className="card bg-base-100 shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">RSVP</h2>

        {rsvpError && <div className="alert alert-error text-sm">{rsvpError}</div>}

        {event.status === 'CANCELLED' && (
          <p className="text-sm opacity-60">Event is cancelled — RSVP not available</p>
        )}

        {role === 'PARENT' && linkedPlayers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">RSVP for:</span>
            <select
              className="select select-bordered select-sm"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
            >
              {linkedPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          {(['GOING', 'MAYBE', 'NOT_GOING'] as RsvpStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm${s === 'GOING' ? ' btn-success' : s === 'MAYBE' ? ' btn-warning' : ' btn-error'}`}
              disabled={rsvpSubmitting || event.status === 'CANCELLED'}
              onClick={() => submitRsvp(s)}
            >
              {s === 'NOT_GOING' ? 'Not Going' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {rsvpSummary && (
          <div className="space-y-1">
            {rsvpSummary.rsvps.map((r) => (
              <div key={r.userId} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{r.displayName ?? r.userId}</span>
                <span
                  className={`badge badge-sm${r.status === 'GOING' ? ' badge-success' : r.status === 'MAYBE' ? ' badge-warning' : ' badge-error'}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
            {rsvpSummary.nonRespondents > 0 && (
              <p className="text-xs opacity-50">{rsvpSummary.nonRespondents} not yet responded</p>
            )}
          </div>
        )}
      </div>

      {/* Attendance section — past SCHEDULED events, write roles only */}
      {showAttendance && (
        <div className="card bg-base-100 shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold">Attendance</h2>
          {attendanceError && <div className="alert alert-error text-sm">{attendanceError}</div>}
          {rosterForAttendance.length === 0 ? (
            <p className="text-sm opacity-60">No roster entries — add players in the Roster tab.</p>
          ) : (
            <ul className="space-y-2">
              {rosterForAttendance.map((entry) => {
                const record = attendanceRecords.find((r) => r.rosterEntryId === entry.id);
                const isSubmitting = attendanceSubmitting === entry.id;
                return (
                  <li key={entry.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      {entry.displayName}
                      {entry.jerseyNumber ? ` #${entry.jerseyNumber}` : ''}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={`btn btn-xs${record?.mark === 'PRESENT' ? ' btn-success' : ' btn-outline'}`}
                        disabled={isSubmitting}
                        onClick={() => submitMark(entry.id, 'PRESENT')}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        className={`btn btn-xs${record?.mark === 'ABSENT' ? ' btn-error' : ' btn-outline'}`}
                        disabled={isSubmitting}
                        onClick={() => submitMark(entry.id, 'ABSENT')}
                      >
                        Absent
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Edit event */}
      {canWrite(role) && event.status === 'SCHEDULED' && (
        <div className="card bg-base-100 shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit Event</h2>
            {!showEditForm && (
              <button type="button" className="btn btn-sm btn-outline" onClick={openEditForm}>
                Edit
              </button>
            )}
          </div>

          {showEditForm && (
            <form onSubmit={submitEdit} className="space-y-2">
              {editError && <div className="alert alert-error text-sm">{editError}</div>}
              <label className="form-control w-full">
                <span className="label-text text-xs opacity-60">Title</span>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  maxLength={200}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text text-xs opacity-60">Date & time</span>
                <input
                  type="datetime-local"
                  className="input input-bordered input-sm w-full"
                  value={editStartsAt}
                  onChange={(e) => setEditStartsAt(e.target.value)}
                  required
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text text-xs opacity-60">Location</span>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  maxLength={200}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text text-xs opacity-60">Notes</span>
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                />
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Cancel / Reinstate */}
      <div className="card bg-base-100 shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">Actions</h2>

        {actionError && <div className="alert alert-error text-sm">{actionError}</div>}

        {canWrite(role) && event.status === 'SCHEDULED' && !showCancelForm && (
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => setShowCancelForm(true)}
          >
            Cancel Event
          </button>
        )}

        {canWrite(role) && event.status === 'SCHEDULED' && showCancelForm && (
          <div className="space-y-2">
            <textarea
              className="textarea textarea-bordered w-full text-sm"
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-warning btn-sm"
                disabled={actionSubmitting}
                onClick={() => cancelEvent(cancelReason)}
              >
                {actionSubmitting ? 'Cancelling…' : 'Confirm Cancellation'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelReason('');
                }}
              >
                Never mind
              </button>
            </div>
          </div>
        )}

        {canWrite(role) && event.status === 'CANCELLED' && (
          <div
            className="tooltip"
            data-tip={isPast ? 'Cannot reinstate — event has already started' : ''}
          >
            <button
              type="button"
              className="btn btn-success btn-sm"
              disabled={actionSubmitting || isPast}
              onClick={reinstateEvent}
            >
              {actionSubmitting ? 'Reinstating…' : 'Reinstate Event'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
