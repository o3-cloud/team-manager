import { type FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface Season {
  id: string;
  name: string;
  status: string;
}

interface SeasonRecord {
  wins: number;
  losses: number;
  ties: number;
}

interface Event {
  id: string;
  title: string;
  type: string;
  startsAt: string;
}

export default function GameResultsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [record, setRecord] = useState<SeasonRecord | null>(null);
  const [gameEvents, setGameEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [seasonLoading, setSeasonLoading] = useState(true);

  // Record result form state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [ownScore, setOwnScore] = useState('');
  const [oppScore, setOppScore] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    async function load() {
      setSeasonLoading(true);
      try {
        const seasons = await api.get<Season[]>(`/teams/${teamId}/seasons`);
        const active = seasons.find((s) => s.status === 'ACTIVE') ?? null;
        setActiveSeason(active);

        if (active) {
          const rec = await api.get<SeasonRecord>(`/teams/${teamId}/seasons/${active.id}/record`);
          setRecord(rec);
        }

        const events = await api.get<Event[]>(`/teams/${teamId}/events`);
        setGameEvents(events.filter((e) => e.type === 'GAME'));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setSeasonLoading(false);
      }
    }

    load();
  }, [teamId]);

  async function handleRecordResult(e: FormEvent) {
    e.preventDefault();
    if (!activeSeason) return;
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await api.post(`/teams/${teamId}/events/${selectedEventId}/game-result`, {
        seasonId: activeSeason.id,
        ownScore: Number(ownScore),
        oppScore: Number(oppScore),
        notes: notes.trim() || undefined,
      });
      setFormSuccess('Result recorded successfully.');
      setSelectedEventId('');
      setOwnScore('');
      setOppScore('');
      setNotes('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to record result');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Game Results</h1>
          <Link to={`/teams/${teamId}`} className="btn btn-sm btn-ghost">
            ← Back
          </Link>
        </header>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        {seasonLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            {/* Season record */}
            <div className="card bg-base-100 shadow p-5">
              {activeSeason ? (
                <>
                  <h2 className="font-semibold text-lg mb-3">
                    Season Record — {activeSeason.name}
                  </h2>
                  {record ? (
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold text-success">{record.wins}</div>
                        <div className="text-xs opacity-60 uppercase tracking-wide">Wins</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-error">{record.losses}</div>
                        <div className="text-xs opacity-60 uppercase tracking-wide">Losses</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-warning">{record.ties}</div>
                        <div className="text-xs opacity-60 uppercase tracking-wide">Ties</div>
                      </div>
                    </div>
                  ) : (
                    <p className="opacity-60 text-sm">No record data available.</p>
                  )}
                </>
              ) : (
                <p className="opacity-60 text-sm">No active season found.</p>
              )}
            </div>

            {/* Game events list */}
            <div className="card bg-base-100 shadow p-5 space-y-3">
              <h2 className="font-semibold text-lg">Game Events</h2>
              {gameEvents.length === 0 ? (
                <p className="opacity-60 text-sm">No game events scheduled.</p>
              ) : (
                <ul className="space-y-2">
                  {gameEvents.map((ev) => (
                    <li key={ev.id}>
                      <Link
                        to={`/teams/${teamId}/events/${ev.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors"
                      >
                        <span className="font-medium">{ev.title}</span>
                        <span className="text-xs opacity-50">
                          {new Date(ev.startsAt).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Record result form */}
            {activeSeason && gameEvents.length > 0 && (
              <form onSubmit={handleRecordResult} className="card bg-base-100 shadow p-5 space-y-3">
                <h2 className="font-semibold text-lg">Record Result</h2>

                <select
                  className="select select-bordered w-full"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select game event…
                  </option>
                  {gameEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} — {new Date(ev.startsAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <label className="flex-1 space-y-1">
                    <span className="text-sm font-medium">Our score</span>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      min={0}
                      value={ownScore}
                      onChange={(e) => setOwnScore(e.target.value)}
                      required
                    />
                  </label>
                  <label className="flex-1 space-y-1">
                    <span className="text-sm font-medium">Opponent score</span>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      min={0}
                      value={oppScore}
                      onChange={(e) => setOppScore(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Notes (optional)"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                {formError && <div className="alert alert-error text-sm">{formError}</div>}
                {formSuccess && <div className="alert alert-success text-sm">{formSuccess}</div>}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    'Save result'
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
