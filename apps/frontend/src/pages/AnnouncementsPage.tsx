import { type FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { canWrite, useTeamRole } from '../hooks/useTeamRole';
import { api } from '../lib/api';

type AnnouncementAudience = 'ALL' | 'PLAYERS' | 'PARENTS';

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  targetAudience: AnnouncementAudience;
  urgent: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const role = useTeamRole(teamId);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [targetAudience, setTargetAudience] = useState<AnnouncementAudience>('ALL');
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Announcement[]>(`/teams/${teamId}/announcements`)
      .then(setAnnouncements)
      .catch(console.error);
  }, [teamId]);

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const created = await api.post<Announcement>(`/teams/${teamId}/announcements`, {
        title,
        body,
        pinned,
        targetAudience,
        urgent,
      });
      setAnnouncements((prev) => {
        const next = [created, ...prev];
        return [...next.filter((a) => a.pinned), ...next.filter((a) => !a.pinned)];
      });
      setTitle('');
      setBody('');
      setPinned(false);
      setTargetAudience('ALL');
      setUrgent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/teams/${teamId}/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <Link to={`/teams/${teamId}`} className="btn btn-sm btn-ghost">
            ← Back
          </Link>
        </header>

        {canWrite(role) && (
          <form onSubmit={handlePost} className="card bg-base-100 shadow p-5 space-y-3">
            <h2 className="font-semibold text-lg">Post Announcement</h2>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                <span className="text-sm">Pin</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-warning"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                <span className="text-sm">Urgent</span>
              </label>
              <label className="flex items-center gap-2 select-none">
                <span className="text-sm">Audience:</span>
                <select
                  className="select select-bordered select-sm"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as AnnouncementAudience)}
                >
                  <option value="ALL">Everyone</option>
                  <option value="PLAYERS">Players only</option>
                  <option value="PARENTS">Parents only</option>
                </select>
              </label>
            </div>
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'Post'}
            </button>
          </form>
        )}

        {announcements.length === 0 ? (
          <div className="card bg-base-100 shadow p-6 text-center opacity-60">
            No announcements yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="card bg-base-100 shadow p-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{a.title}</span>
                    {a.pinned && <span className="badge badge-accent badge-sm">Pinned</span>}
                    {a.urgent && <span className="badge badge-warning badge-sm">Urgent</span>}
                    <span className="badge badge-ghost badge-sm">
                      {a.targetAudience === 'PLAYERS' ? 'Players only' : a.targetAudience === 'PARENTS' ? 'Parents only' : 'Everyone'}
                    </span>
                  </div>
                  {canWrite(role) && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost text-error shrink-0"
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                    >
                      {deleting === a.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        'Delete'
                      )}
                    </button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{a.body}</p>
                <span className="text-xs opacity-50">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
