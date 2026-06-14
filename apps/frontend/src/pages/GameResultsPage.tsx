import { type FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

interface GameEvent {
  id: string;
  title: string;
  type: string;
  startsAt: string;
}

interface GameResult {
  ownScore: number;
  oppScore: number;
  outcome: 'WIN' | 'LOSS' | 'TIE';
  notes: string | null;
}

export default function GameResultsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [record, setRecord] = useState<SeasonRecord | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [gameResults, setGameResults] = useState<Record<string, GameResult>>({});
  const [error, setError] = useState('');
  const [seasonLoading, setSeasonLoading] = useState(true);

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

        const events = await api.get<GameEvent[]>(`/teams/${teamId}/events`);
        const games = events.filter((e) => e.type === 'GAME');
        setGameEvents(games);

        const now = new Date().toISOString();
        const pastGames = games.filter((e) => e.startsAt < now);
        const settled = await Promise.allSettled(
          pastGames.map((e) =>
            api
              .get<GameResult>(`/teams/${teamId}/events/${e.id}/game-result`)
              .then((r) => [e.id, r] as [string, GameResult]),
          ),
        );
        const resultMap: Record<string, GameResult> = {};
        for (const r of settled) {
          if (r.status === 'fulfilled') {
            const [id, result] = r.value;
            resultMap[id] = result;
          }
        }
        setGameResults(resultMap);
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
      const updated = await api.get<GameResult>(
        `/teams/${teamId}/events/${selectedEventId}/game-result`,
      );
      setGameResults((prev) => ({ ...prev, [selectedEventId]: updated }));
      setFormSuccess('Result recorded.');
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

  const now = new Date().toISOString();
  const recordableGames = gameEvents.filter((e) => e.startsAt < now && !gameResults[e.id]);

  function outcomeBadge(outcome: GameResult['outcome']) {
    if (outcome === 'WIN') return <span className="badge badge-success badge-sm">WIN</span>;
    if (outcome === 'LOSS') return <span className="badge badge-error badge-sm">LOSS</span>;
    return <span className="badge badge-warning badge-sm">TIE</span>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
                <h2 className="font-semibold text-lg mb-3">Season Record — {activeSeason.name}</h2>
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
                {gameEvents.map((ev) => {
                  const result = gameResults[ev.id];
                  const isPast = ev.startsAt < now;
                  return (
                    <li key={ev.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-base-300">
                        <div>
                          <p className="font-medium">{ev.title}</p>
                          <p className="text-xs opacity-50">
                            {new Date(ev.startsAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        {result ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-semibold">
                              {result.ownScore}–{result.oppScore}
                            </span>
                            {outcomeBadge(result.outcome)}
                          </div>
                        ) : isPast ? (
                          <span className="badge badge-ghost badge-sm">No result</span>
                        ) : (
                          <span className="badge badge-outline badge-sm">Upcoming</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Record result form */}
          {activeSeason && (
            <div className="card bg-base-100 shadow p-5 space-y-3">
              <h2 className="font-semibold text-lg">Record Result</h2>
              {recordableGames.length === 0 ? (
                <p className="opacity-60 text-sm">No unrecorded past games.</p>
              ) : (
                <form onSubmit={handleRecordResult} className="space-y-3">
                  <select
                    className="select select-bordered w-full"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select game event…
                    </option>
                    {recordableGames.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} —{' '}
                        {new Date(ev.startsAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
