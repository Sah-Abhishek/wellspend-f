import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, Beef, Flame, Wallet, BookOpen, Dumbbell } from 'lucide-react';

const goalCategories = [
  { value: 'protein', label: 'Protein (g)', icon: Beef, color: 'text-protein' },
  { value: 'calories', label: 'Calories (kcal)', icon: Flame, color: 'text-calories' },
  { value: 'spending', label: 'Spending (₹)', icon: Wallet, color: 'text-spending' },
  { value: 'study', label: 'Study (hrs)', icon: BookOpen, color: 'text-study' },
  { value: 'exercise', label: 'Exercise (min)', icon: Dumbbell, color: 'text-exercise' },
];

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [goals, setGoals] = useState([{ category: 'protein', target: 100 }]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function addGoal() {
    const used = goals.map(g => g.category);
    const next = goalCategories.find(c => !used.includes(c.value));
    if (next) setGoals([...goals, { category: next.value, target: 0 }]);
  }

  function removeGoal(i) {
    setGoals(goals.filter((_, idx) => idx !== i));
  }

  function updateGoal(i, field, value) {
    const updated = [...goals];
    updated[i] = { ...updated[i], [field]: value };
    setGoals(updated);
  }

  function addWeeklyGoal() {
    const used = weeklyGoals.map(g => g.category);
    const next = goalCategories.find(c => !used.includes(c.value));
    if (next) setWeeklyGoals([...weeklyGoals, { category: next.value, target: 0 }]);
  }

  function removeWeeklyGoal(i) {
    setWeeklyGoals(weeklyGoals.filter((_, idx) => idx !== i));
  }

  function updateWeeklyGoal(i, field, value) {
    const updated = [...weeklyGoals];
    updated[i] = { ...updated[i], [field]: value };
    setWeeklyGoals(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Group name is required');
    setLoading(true);
    try {
      const group = await api.post('/groups', { name, goals, weeklyGoals });
      navigate(`/app/groups/${group.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-3 md:space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs md:text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Create Group</h1>

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        {error && (
          <div className="bg-spending/10 text-spending text-sm md:text-base px-3 py-2 rounded-lg">{error}</div>
        )}

        <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-2.5">
          <label className="block text-xs md:text-sm font-medium text-text-muted uppercase tracking-wider">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Gym Buddies"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-muted/50"
          />
        </div>

        <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-2.5 md:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Daily Goals</h3>
            {goals.length < 5 && (
              <button type="button" onClick={addGoal} className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus size={12} /> Add
              </button>
            )}
          </div>

          {goals.map((goal, i) => {
            const cat = goalCategories.find(c => c.value === goal.category);
            const CatIcon = cat?.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                  {CatIcon && <CatIcon size={16} className={cat.color} />}
                </div>
                <select
                  value={goal.category}
                  onChange={(e) => updateGoal(i, 'category', e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 text-text"
                >
                  {goalCategories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={goal.target}
                  onChange={(e) => updateGoal(i, 'target', parseFloat(e.target.value) || 0)}
                  className="w-20 md:w-24 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {goals.length > 1 && (
                  <button type="button" onClick={() => removeGoal(i)} className="p-1 text-spending/70 hover:text-spending hover:bg-spending/10 rounded-md transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-2.5 md:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Weekly Goals <span className="normal-case font-normal">(optional)</span></h3>
            {weeklyGoals.length < 5 && (
              <button type="button" onClick={addWeeklyGoal} className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus size={12} /> Add
              </button>
            )}
          </div>

          {weeklyGoals.length === 0 && (
            <p className="text-xs text-text-muted">Cumulative targets tracked Mon–Sun. Add one to get started.</p>
          )}

          {weeklyGoals.map((goal, i) => {
            const cat = goalCategories.find(c => c.value === goal.category);
            const CatIcon = cat?.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                  {CatIcon && <CatIcon size={16} className={cat.color} />}
                </div>
                <select
                  value={goal.category}
                  onChange={(e) => updateWeeklyGoal(i, 'category', e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 text-text"
                >
                  {goalCategories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={goal.target}
                  onChange={(e) => updateWeeklyGoal(i, 'target', parseFloat(e.target.value) || 0)}
                  className="w-20 md:w-24 px-2.5 py-2 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button type="button" onClick={() => removeWeeklyGoal(i)} className="p-1 text-spending/70 hover:text-spending hover:bg-spending/10 rounded-md transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 md:py-3 bg-primary text-bg font-semibold text-sm md:text-base rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}
