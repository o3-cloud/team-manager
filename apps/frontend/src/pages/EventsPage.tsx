import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function EventsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const role = useTeamRole(teamId);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('GAME');
  const [startsAtLocal, setStartsAtLocal] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    api
      .get<TeamEvent[]>(`/teams/${teamId}/events`)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load events'));
  }, [teamId]);

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

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Link to={`/teams/${teamId}`} className="btn btn-sm btn-ghost">
          ← Back to team
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
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

        <ul className="space-y-2">
          {events.map((ev) => (
            <li key={ev.id}>
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
                      {new Date(ev.startsAt).toLocaleString()}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="badge badge-neutral badge-sm">{ev.type}</span>
                    {ev.status === 'CANCELLED' ? (
                      <span className="badge badge-error badge-sm">Cancelled</span>
                    ) : (
                      <span className="badge badge-success badge-sm">Scheduled</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
          {events.length === 0 && (
            <li className="text-sm opacity-60 text-center py-8">No events yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
