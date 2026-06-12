import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

const NOTIFICATION_LABELS: Record<string, string> = {
  ANNOUNCEMENT_POSTED: 'New Announcement',
  EVENT_CANCELLED: 'Event Cancelled',
  EVENT_REINSTATED: 'Event Reinstated',
  EVENT_UPDATED: 'Event Updated',
  GAME_RESULT_RECORDED: 'Game Result',
  INVITE_ACCEPTED: 'Member Joined',
};

function notificationLabel(type: string): string {
  return NOTIFICATION_LABELS[type] ?? type;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Notification[]>(`/teams/${teamId}/notifications`)
      .then(setNotifications)
      .catch(console.error);
  }, [teamId]);

  async function handleMarkAllRead() {
    setMarkingAll(true);
    setError('');
    try {
      await api.patch(`/teams/${teamId}/notifications/read-all`, {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkRead(id: string) {
    setMarkingId(id);
    setError('');
    try {
      await api.patch(`/teams/${teamId}/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleMarkAllRead}
                disabled={markingAll}
              >
                {markingAll ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Mark all read'
                )}
              </button>
            )}
            <Link to={`/teams/${teamId}`} className="btn btn-sm btn-ghost">
              ← Back
            </Link>
          </div>
        </header>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        {notifications.length === 0 ? (
          <div className="card bg-base-100 shadow p-6 text-center opacity-60">
            No notifications yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`card shadow p-4 ${n.isRead ? 'bg-base-100' : 'bg-accent/10 border border-accent/30'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? '' : 'font-bold'}`}>{n.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-ghost badge-xs">
                        {notificationLabel(n.type)}
                      </span>
                      <span className="text-xs opacity-50">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost shrink-0"
                      onClick={() => handleMarkRead(n.id)}
                      disabled={markingId === n.id}
                    >
                      {markingId === n.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        'Mark read'
                      )}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
