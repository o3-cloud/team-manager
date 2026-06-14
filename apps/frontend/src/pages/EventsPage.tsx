import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { canWrite, useTeamRole } from '../hooks/useTeamRole';
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

const TYPE_BADGE: Record<EventType, string> = {
  GAME: 'badge-primary',
  PRACTICE: 'badge-success',
  MEETING: 'badge-info',
  OTHER: 'badge-ghost',
};

const TYPE_LABEL: Record<EventType, string> = {
  GAME: 'Game',
  PRACTICE: 'Practice',
  MEETING: 'Meeting',
  OTHER: 'Other',
};

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EventsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const role = useTeamRole(teamId);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterFrom, setFilterFrom] = useState(today);
  const [filterTo, setFilterTo] = useState('');
  const [filterError, setFilterError] = useState('');

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('GAME');
  const [startsAtLocal, setStartsAtLocal] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    if (filterFrom && filterTo && filterFrom > filterTo) {
      setFilterError('"From" date must be on or before "To" date');
      return;
    }
    setFilterError('');
    const params = new URLSearchParams();
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    const qs = params.toString();
    api
      .get<TeamEvent[]>(`/teams/${teamId}/events${qs ? `?${qs}` : ''}`)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load events'));
  }, [teamId, filterFrom, filterTo]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await api.post<TeamEvent>(`/teams/${teamId}/events`, {
        title,
        type,
        startsAt: new Date(startsAtLocal).toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });
      setEvents((prev) => [created, ...prev]);
      setShowForm(false);
      setTitle('');
      setType('GAME');
      setStartsAtLocal('');
      setLocation('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startsAt) >= now);
  const past = events.filter((e) => new Date(e.startsAt) < now);

  function statusBadge(ev: TeamEvent) {
    if (ev.status === 'CANCELLED')
      return <span className="badge badge-error badge-sm">Cancelled</span>;
    if (new Date(ev.startsAt) < now)
      return <span className="badge badge-ghost badge-sm">Past</span>;
    return <span className="badge badge-success badge-sm">Upcoming</span>;
  }

  function EventCard({ ev }: { ev: TeamEvent }) {
    return (
      <button
        type="button"
        className="card bg-base-100 shadow p-4 w-full text-left hover:shadow-md transition-shadow"
        onClick={() => navigate(`/teams/${teamId}/events/${ev.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p
              className={`font-medium${ev.status === 'CANCELLED' ? ' line-through opacity-60' : ''}`}
            >
              {ev.title}
            </p>
            <p className="text-xs opacity-60">
              {formatEventDate(ev.startsAt)}
              {ev.location ? ` · ${ev.location}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`badge badge-sm ${TYPE_BADGE[ev.type]}`}>{TYPE_LABEL[ev.type]}</span>
            {statusBadge(ev)}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-end">
        {canWrite(role) && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : 'Create Event'}
          </button>
        )}
      </div>

      {/* Date-range filter */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="form-control">
          <label className="label py-0" htmlFor="filter-from">
            <span className="label-text text-xs">From</span>
          </label>
          <input
            id="filter-from"
            type="date"
            className="input input-bordered input-sm"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label py-0" htmlFor="filter-to">
            <span className="label-text text-xs">To</span>
          </label>
          <input
            id="filter-to"
            type="date"
            className="input input-bordered input-sm"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>
        {(filterFrom !== today() || filterTo) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFilterFrom(today());
              setFilterTo('');
            }}
          >
            Reset to today
          </button>
        )}
      </div>
      {filterError && <div className="alert alert-warning text-sm py-2">{filterError}</div>}

      {error && <div className="alert alert-error text-sm">{error}</div>}

      {showForm && canWrite(role) && (
        <div className="card bg-base-100 shadow p-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="form-control">
              <label className="label" htmlFor="ev-title">
                <span className="label-text">Title</span>
              </label>
              <input
                id="ev-title"
                type="text"
                className="input input-bordered"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="ev-type">
                <span className="label-text">Type</span>
              </label>
              <select
                id="ev-type"
                className="select select-bordered"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
              >
                <option value="GAME">Game</option>
                <option value="PRACTICE">Practice</option>
                <option value="MEETING">Meeting</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label" htmlFor="ev-starts">
                <span className="label-text">Starts at</span>
              </label>
              <input
                id="ev-starts"
                type="datetime-local"
                className="input input-bordered"
                required
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="ev-location">
                <span className="label-text">Location (optional)</span>
              </label>
              <input
                id="ev-location"
                type="text"
                className="input input-bordered"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="ev-notes">
                <span className="label-text">Notes (optional)</span>
              </label>
              <textarea
                id="ev-notes"
                className="textarea textarea-bordered"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      {/* Upcoming events */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-50">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-6">No upcoming events.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((ev) => (
              <li key={ev.id}>
                <EventCard ev={ev} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Past events (only shown when filter includes past dates) */}
      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide opacity-50">
            Past ({past.length})
          </h2>
          <ul className="space-y-2">
            {past.map((ev) => (
              <li key={ev.id}>
                <EventCard ev={ev} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
