import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { canWrite, useTeamRole } from '../hooks/useTeamRole';
import { api } from '../lib/api';

type EventStatus = 'SCHEDULED' | 'CANCELLED';
type RsvpStatus = 'GOING' | 'NOT_GOING' | 'MAYBE';

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
  status: RsvpStatus;
}

interface RsvpSummary {
  rsvps: RsvpEntry[];
  nonRespondents: number;
}

export default function EventDetailPage() {
  const { teamId, eventId } = useParams<{ teamId: string; eventId: string }>();
  const role = useTeamRole(teamId);
  const [event, setEvent] = useState<TeamEvent | null>(null);
  const [rsvpSummary, setRsvpSummary] = useState<RsvpSummary | null>(null);
  const [error, setError] = useState('');
  const [rsvpError, setRsvpError] = useState('');
  const [actionError, setActionError] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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

  async function submitRsvp(status: RsvpStatus) {
    if (!teamId || !eventId) return;
    setRsvpSubmitting(true);
    setRsvpError('');
    try {
      await api.put(`/teams/${teamId}/events/${eventId}/rsvp`, { status });
      api
        .get<RsvpSummary>(`/teams/${teamId}/events/${eventId}/rsvp`)
        .then(setRsvpSummary)
        .catch(console.error);
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

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Link to={`/teams/${teamId}/events`} className="btn btn-sm btn-ghost">
            ← Back to events
          </Link>
          <div className="alert alert-error text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="max-w-2xl mx-auto">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link to={`/teams/${teamId}/events`} className="btn btn-sm btn-ghost">
          ← Back to events
        </Link>

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
                  <span className="opacity-60 font-mono text-xs">{r.userId}</span>
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
            <button
              type="button"
              className="btn btn-success btn-sm"
              disabled={actionSubmitting}
              onClick={reinstateEvent}
            >
              {actionSubmitting ? 'Reinstating…' : 'Reinstate Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
