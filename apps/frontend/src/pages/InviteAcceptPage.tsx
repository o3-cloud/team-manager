import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'accepting' | 'error'>('accepting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .post(`/invites/${token}/accept`, {})
      .then(() => navigate('/teams', { replace: true }))
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to accept invite');
      });
  }, [token, navigate]);

  if (status === 'accepting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card bg-base-100 shadow-xl max-w-sm w-full">
        <div className="card-body gap-4">
          <h1 className="card-title text-xl">Invite Error</h1>
          <div className="alert alert-error text-sm">{message}</div>
          <Link to="/teams" className="btn btn-primary btn-sm">
            Back to My Teams
          </Link>
        </div>
      </div>
    </div>
  );
}
