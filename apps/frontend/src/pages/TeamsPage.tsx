import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Team {
  id: string;
  name: string;
  createdAt: string;
}

export default function TeamsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinToken, setJoinToken] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    api.get<Team[]>('/teams').then(setTeams).catch(console.error);
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!newName.trim()) {
      setError('Team name cannot be blank');
      return;
    }
    setLoading(true);
    try {
      const team = await api.post<Team>('/teams', { name: newName });
      setTeams((prev) => [...prev, team]);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    const token = joinToken.trim();
    if (!token) {
      setJoinError('Invite token cannot be blank');
      return;
    }
    setJoinLoading(true);
    setJoinError('');
    try {
      await api.post(`/invites/${token}/accept`, {});
      setJoinToken('');
      const updated = await api.get<Team[]>('/teams');
      setTeams(updated);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join team');
    } finally {
      setJoinLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Teams</h1>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm opacity-70">{user.displayName}</span>}
            <button type="button" className="btn btn-sm btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="New team name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={100}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create'}
          </button>
        </form>
        {error && <div className="alert alert-error text-sm">{error}</div>}

        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="Invite token — join a team"
            value={joinToken}
            onChange={(e) => setJoinToken(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" disabled={joinLoading}>
            {joinLoading ? <span className="loading loading-spinner loading-sm" /> : 'Join'}
          </button>
        </form>
        {joinError && <div className="alert alert-error text-sm">{joinError}</div>}

        {teams.length === 0 ? (
          <div className="card bg-base-100 shadow p-6 text-center opacity-60">
            No teams yet — create one above.
          </div>
        ) : (
          <ul className="space-y-2">
            {teams.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/teams/${t.id}`}
                  className="card bg-base-100 shadow hover:shadow-md transition-shadow block p-4"
                >
                  <span className="font-medium">{t.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
