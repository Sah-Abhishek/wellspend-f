import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Copy, Trophy, Target, Trash2, Check, Medal, Beef, Flame, Wallet, BookOpen, Dumbbell, MoreVertical, X, Pencil, Plus } from 'lucide-react';

const categoryLabels = {
  protein: { label: 'Protein', unit: 'g', icon: Beef, color: 'text-protein', bg: 'bg-protein' },
  calories: { label: 'Calories', unit: 'kcal', icon: Flame, color: 'text-calories', bg: 'bg-calories' },
  spending: { label: 'Spending', unit: '₹', icon: Wallet, color: 'text-spending', bg: 'bg-spending' },
  study: { label: 'Study', unit: 'hrs', icon: BookOpen, color: 'text-study', bg: 'bg-study' },
  exercise: { label: 'Exercise', unit: 'min', icon: Dumbbell, color: 'text-exercise', bg: 'bg-exercise' },
};

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

const goalCategories = [
  { value: 'protein', label: 'Protein (g)', icon: Beef, color: 'text-protein' },
  { value: 'calories', label: 'Calories (kcal)', icon: Flame, color: 'text-calories' },
  { value: 'spending', label: 'Spending (₹)', icon: Wallet, color: 'text-spending' },
  { value: 'study', label: 'Study (hrs)', icon: BookOpen, color: 'text-study' },
  { value: 'exercise', label: 'Exercise (min)', icon: Dumbbell, color: 'text-exercise' },
];

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [wpLoading, setWpLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState([]);
  const [editWeeklyGoals, setEditWeeklyGoals] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    api.get(`/groups/${id}`).then(setGroup).catch(() => navigate('/app/groups'));
    api.get(`/groups/${id}/leaderboard`).then(setLeaderboard).catch(() => {}).finally(() => setLbLoading(false));
    api.get(`/groups/${id}/weekly-progress`).then(setWeeklyProgress).catch(() => {}).finally(() => setWpLoading(false));
  }, [id]);

  function copyInvite() {
    const link = `${window.location.origin}/join/${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteGroup() {
    await api.delete(`/groups/${id}`);
    navigate('/app/groups');
  }

  function openEditModal() {
    setEditName(group.name);
    setEditGoals((group.goals || []).filter(g => g.type !== 'weekly').map(g => ({ category: g.category, target: g.target })));
    setEditWeeklyGoals((group.goals || []).filter(g => g.type === 'weekly').map(g => ({ category: g.category, target: g.target })));
    setShowEditModal(true);
  }

  function addEditGoal() {
    const used = editGoals.map(g => g.category);
    const next = goalCategories.find(c => !used.includes(c.value));
    if (next) setEditGoals([...editGoals, { category: next.value, target: 0 }]);
  }

  function addEditWeeklyGoal() {
    const used = editWeeklyGoals.map(g => g.category);
    const next = goalCategories.find(c => !used.includes(c.value));
    if (next) setEditWeeklyGoals([...editWeeklyGoals, { category: next.value, target: 0 }]);
  }

  async function handleEditSave() {
    setEditLoading(true);
    try {
      const updated = await api.put(`/groups/${id}`, { name: editName, goals: editGoals, weeklyGoals: editWeeklyGoals });
      setGroup(updated);
      setShowEditModal(false);
      api.get(`/groups/${id}/weekly-progress`).then(setWeeklyProgress).catch(() => {});
    } catch {
    } finally {
      setEditLoading(false);
    }
  }

  function getRank(index) {
    if (index === 0) return 0;
    return leaderboard[index].totalPoints === leaderboard[index - 1].totalPoints
      ? getRank(index - 1)
      : index;
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
          {group.goals?.filter(g => g.type !== 'weekly').map(goal => {
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

      {wpLoading ? (
        <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-surface-2" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-surface-2" />
            <div className="h-3 w-3/4 rounded bg-surface-2" />
          </div>
        </div>
      ) : weeklyProgress && weeklyProgress.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Target size={14} className="text-primary" /> Weekly Progress
          </h3>
          {weeklyProgress.map(wp => {
            const cat = categoryLabels[wp.category] || {};
            const GoalIcon = cat.icon;
            return (
              <div key={wp.goalId} className="bg-surface rounded-xl p-3.5 md:p-4 border border-border space-y-2.5">
                <div className="flex items-center gap-2 text-xs md:text-sm text-text-muted">
                  {GoalIcon && <GoalIcon size={14} className={cat.color} />}
                  <span className="font-medium">{cat.label}</span>
                  <span>· {wp.target} {cat.unit}</span>
                </div>
                <div className="space-y-2">
                  {wp.members.map(m => (
                    <div key={m.userId} className="flex items-center gap-2.5">
                      <span className="text-xs md:text-sm w-20 md:w-24 truncate text-text-muted">{m.userName}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cat.bg}`}
                          style={{ width: `${m.percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-10 text-right text-text-muted">{m.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          leaderboard.map((entry, i) => {
            const rank = getRank(i);
            return (
              <div
                key={entry.userId}
                onClick={() => navigate(`/app/groups/${id}/members/${entry.userId}`)}
                className={`flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-2 transition-colors ${entry.userId === user?.id ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-2.5 md:gap-3">
                  <span className="w-6 flex justify-center">
                    {rank < 3 ? (
                      <Medal size={18} style={{ color: medalColors[rank] }} />
                    ) : (
                      <span className="font-bold text-xs md:text-sm text-text-muted">{rank + 1}</span>
                    )}
                  </span>
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] md:text-xs">
                    {entry.userName?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-sm md:text-base">{entry.userName}</span>
                </div>
                <span className="font-bold text-xs md:text-sm text-primary">{entry.totalPoints} pts</span>
              </div>
            );
          })
        )}
      </div>

      {isOwner && (
        <div className="relative w-fit flex items-center gap-1.5">
          <button
            onClick={openEditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors"
          >
            <MoreVertical size={14} /> Options
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute left-0 bottom-full mb-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm text-spending hover:bg-spending/10 transition-colors whitespace-nowrap"
                >
                  <Trash2 size={13} /> Delete Group
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEditModal(false)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-md space-y-4 animate-modal-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">Edit Group</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-medium text-text-muted uppercase tracking-wider">Group Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Daily Goals</h4>
                {editGoals.length < 5 && (
                  <button type="button" onClick={addEditGoal} className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 hover:underline">
                    <Plus size={12} /> Add
                  </button>
                )}
              </div>
              {editGoals.map((goal, i) => {
                const cat = goalCategories.find(c => c.value === goal.category);
                const CatIcon = cat?.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                      {CatIcon && <CatIcon size={16} className={cat.color} />}
                    </div>
                    <select
                      value={goal.category}
                      onChange={(e) => { const u = [...editGoals]; u[i] = { ...u[i], category: e.target.value }; setEditGoals(u); }}
                      className="flex-1 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 text-text"
                    >
                      {goalCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <input
                      type="number"
                      value={goal.target}
                      onChange={(e) => { const u = [...editGoals]; u[i] = { ...u[i], target: parseFloat(e.target.value) || 0 }; setEditGoals(u); }}
                      className="w-20 md:w-24 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {editGoals.length > 1 && (
                      <button type="button" onClick={() => setEditGoals(editGoals.filter((_, idx) => idx !== i))} className="p-1 text-spending/70 hover:text-spending hover:bg-spending/10 rounded-md transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Weekly Goals</h4>
                {editWeeklyGoals.length < 5 && (
                  <button type="button" onClick={addEditWeeklyGoal} className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 hover:underline">
                    <Plus size={12} /> Add
                  </button>
                )}
              </div>
              {editWeeklyGoals.length === 0 && (
                <p className="text-xs text-text-muted">No weekly goals. Add one to track cumulative targets.</p>
              )}
              {editWeeklyGoals.map((goal, i) => {
                const cat = goalCategories.find(c => c.value === goal.category);
                const CatIcon = cat?.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                      {CatIcon && <CatIcon size={16} className={cat.color} />}
                    </div>
                    <select
                      value={goal.category}
                      onChange={(e) => { const u = [...editWeeklyGoals]; u[i] = { ...u[i], category: e.target.value }; setEditWeeklyGoals(u); }}
                      className="flex-1 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 text-text"
                    >
                      {goalCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <input
                      type="number"
                      value={goal.target}
                      onChange={(e) => { const u = [...editWeeklyGoals]; u[i] = { ...u[i], target: parseFloat(e.target.value) || 0 }; setEditWeeklyGoals(u); }}
                      className="w-20 md:w-24 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button type="button" onClick={() => setEditWeeklyGoals(editWeeklyGoals.filter((_, idx) => idx !== i))} className="p-1 text-spending/70 hover:text-spending hover:bg-spending/10 rounded-md transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading || !editName.trim()}
                className="flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg bg-primary text-bg hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-sm space-y-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">Delete group?</h3>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs md:text-sm text-text-muted">
              This will permanently delete <span className="font-medium text-text">{group.name}</span> and all its data. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg bg-spending/10 text-spending hover:bg-spending/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
