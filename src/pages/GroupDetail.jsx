import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Copy, Trophy, Target, Trash2, Check, Medal, Beef, Flame, Wallet, BookOpen, Dumbbell } from 'lucide-react';

const categoryLabels = {
  protein: { label: 'Protein', unit: 'g', icon: Beef, color: 'text-protein' },
  calories: { label: 'Calories', unit: 'kcal', icon: Flame, color: 'text-calories' },
  spending: { label: 'Spending', unit: '₹', icon: Wallet, color: 'text-spending' },
  study: { label: 'Study', unit: 'hrs', icon: BookOpen, color: 'text-study' },
  exercise: { label: 'Exercise', unit: 'min', icon: Dumbbell, color: 'text-exercise' },
};

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/groups/${id}`).then(setGroup).catch(() => navigate('/app/groups'));
    api.get(`/groups/${id}/leaderboard`).then(setLeaderboard).catch(() => {}).finally(() => setLbLoading(false));
  }, [id]);

  function copyInvite() {
    const link = `${window.location.origin}/join/${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteGroup() {
    if (!confirm('Delete this group?')) return;
    await api.delete(`/groups/${id}`);
    navigate('/app/groups');
  }

  if (!group) return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4 animate-pulse">
      <div className="h-4 w-16 rounded bg-surface-2" />
      <div className="bg-surface rounded-xl p-4 md:p-5 border border-border">
        <div className="h-5 w-36 rounded bg-surface-2 mb-2" />
        <div className="h-3 w-20 rounded bg-surface-2" />
        <div className="mt-3 flex gap-1.5">
          <div className="h-6 w-16 rounded-md bg-surface-2" />
          <div className="h-6 w-16 rounded-md bg-surface-2" />
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border">
          <div className="h-4 w-24 rounded bg-surface-2" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
            <div className="w-6 h-5 rounded bg-surface-2" />
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-md bg-surface-2" />
            <div className="h-4 w-24 rounded bg-surface-2" />
            <div className="ml-auto h-4 w-12 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );

  const isOwner = group.ownerId === user?.id;

  return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
      <button onClick={() => navigate('/app/groups')} className="flex items-center gap-1 text-xs md:text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} /> Groups
      </button>

      <div className="bg-surface rounded-xl p-4 md:p-5 border border-border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-xs md:text-sm text-text-muted mt-0.5">{group.members?.length || 0} members</p>
          </div>
          <button
            onClick={copyInvite}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs md:text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Invite'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.goals?.map(goal => {
            const cat = categoryLabels[goal.category] || {};
            const GoalIcon = cat.icon;
            return (
              <div key={goal.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 rounded-md text-xs md:text-sm text-text-muted">
                {GoalIcon && <GoalIcon size={12} className={cat.color} />}
                <span>{goal.target} {cat.unit}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <h3 className="px-3.5 py-2.5 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted border-b border-border flex items-center gap-1.5">
          <Trophy size={14} className="text-calories" /> Leaderboard
        </h3>
        {lbLoading ? (
          <div className="animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
                <div className="w-6 h-5 rounded bg-surface-2" />
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-md bg-surface-2" />
                <div className="h-4 w-24 rounded bg-surface-2" />
                <div className="ml-auto h-4 w-12 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="px-3.5 py-6 text-center text-xs md:text-sm text-text-muted">No points yet. Start logging!</p>
        ) : (
          leaderboard.map((entry, i) => (
            <div
              key={entry.userId}
              onClick={() => navigate(`/app/groups/${id}/members/${entry.userId}`)}
              className={`flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-2 transition-colors ${entry.userId === user?.id ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <span className="w-6 flex justify-center">
                  {i < 3 ? (
                    <Medal size={18} style={{ color: medalColors[i] }} />
                  ) : (
                    <span className="font-bold text-xs md:text-sm text-text-muted">{i + 1}</span>
                  )}
                </span>
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] md:text-xs">
                  {entry.userName?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-sm md:text-base">{entry.userName}</span>
              </div>
              <span className="font-bold text-xs md:text-sm text-primary">{entry.totalPoints} pts</span>
            </div>
          ))
        )}
      </div>

      {isOwner && (
        <button
          onClick={deleteGroup}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm text-spending/70 hover:text-spending hover:bg-spending/10 rounded-lg transition-colors"
        >
          <Trash2 size={12} /> Delete Group
        </button>
      )}
    </div>
  );
}
