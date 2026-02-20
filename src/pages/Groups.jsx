import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Plus, Users, Trophy, ChevronRight, Dumbbell } from 'lucide-react';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/groups').then(setGroups).catch(() => {});
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    try {
      const group = await api.post('/groups/join', { inviteCode });
      navigate(`/app/groups/${group.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Groups</h1>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowJoin(!showJoin)}
            className="px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
          >
            Join
          </button>
          <Link
            to="/app/groups/new"
            className="px-3 py-1.5 text-xs md:text-sm font-medium bg-primary text-bg rounded-lg hover:bg-primary-light transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Create
          </Link>
        </div>
      </div>

      {showJoin && (
        <form onSubmit={handleJoin} className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-2.5">
          <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Join with invite code</h3>
          {error && <p className="text-spending text-sm md:text-base">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-muted/50"
            />
            <button type="submit" className="px-4 py-2 bg-primary text-bg text-xs md:text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors">
              Join
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 md:p-10 border border-border text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-exercise/10 flex items-center justify-center mx-auto mb-3">
            <Dumbbell size={24} className="text-exercise" />
          </div>
          <p className="font-semibold text-sm md:text-base mb-1">No groups yet</p>
          <p className="text-xs md:text-sm text-text-muted">Create a group or join one with an invite code</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-2.5">
          {groups.map(group => (
            <Link
              key={group.id}
              to={`/app/groups/${group.id}`}
              className="flex items-center justify-between bg-surface rounded-xl p-3.5 md:p-4 border border-border hover:border-surface-2 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{group.name}</p>
                  <p className="text-[11px] md:text-sm text-text-muted">
                    {group._count?.members || group.memberCount || 0} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {group.userPoints !== undefined && (
                  <div className="flex items-center gap-1 text-xs md:text-sm text-calories font-semibold">
                    <Trophy size={12} /> {group.userPoints}
                  </div>
                )}
                <ChevronRight size={14} className="text-text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
