import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function JoinGroup() {
  const { inviteCode } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(`/login?redirect=/join/${inviteCode}`);
      return;
    }
    if (!joining) {
      setJoining(true);
      api.post('/groups/join', { inviteCode })
        .then(group => navigate(`/app/groups/${group.id}`))
        .catch(err => setError(err.message));
    }
  }, [user, loading]);

  if (error) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl p-5 md:p-7 border border-border text-center max-w-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-spending/10 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} className="text-spending" />
          </div>
          <p className="font-semibold text-sm md:text-base mb-1">Couldn't join group</p>
          <p className="text-xs md:text-sm text-text-muted mb-4">{error}</p>
          <button onClick={() => navigate('/app/groups')} className="px-4 py-2 bg-primary text-bg text-xs md:text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors">
            Go to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center">
      <p className="text-text-muted text-sm md:text-base">Joining group...</p>
    </div>
  );
}
