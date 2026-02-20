import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ChevronLeft, ChevronRight, Plus, Minus, Trash2, BookOpen, Dumbbell, Search, Check, Save } from 'lucide-react';
import FoodIcon from '../components/FoodIcon';

export default function LogEntry() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [log, setLog] = useState(null);
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [servings, setServings] = useState(1);
  const [selected, setSelected] = useState([]);
  const [adding, setAdding] = useState(false);
  const [studyHours, setStudyHours] = useState(0);
  const [exerciseMins, setExerciseMins] = useState(0);

  useEffect(() => {
    loadLog();
    api.get('/foods').then(setFoods).catch(() => {});
  }, [date]);

  async function loadLog() {
    try {
      const data = await api.get(`/logs?date=${date}`);
      setLog(data);
      setStudyHours(data.studyHours || 0);
      setExerciseMins(data.exerciseMins || 0);
    } catch { setLog(null); }
  }

  function shiftDate(days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  }

  function toggleFood(foodId) {
    setSelected(prev =>
      prev.some(s => s.foodId === foodId)
        ? prev.filter(s => s.foodId !== foodId)
        : [...prev, { foodId, servings }]
    );
  }

  async function addSelected() {
    if (!log || selected.length === 0 || adding) return;
    setAdding(true);
    try {
      for (const item of selected) {
        await api.post(`/logs/${log.id}/food`, item);
      }
      setSelected([]);
      setServings(1);
      loadLog();
    } finally {
      setAdding(false);
    }
  }

  async function removeEntry(entryId) {
    if (!log) return;
    await api.delete(`/logs/${log.id}/food/${entryId}`);
    loadLog();
  }

  async function updateActivity() {
    if (!log) return;
    await api.patch(`/logs/${log.id}`, { studyHours, exerciseMins });
    loadLog();
  }

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
      <div className="flex items-center justify-between bg-surface rounded-xl p-2.5 md:p-3.5 border border-border">
        <button onClick={() => shiftDate(-1)} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-text-muted">
          <ChevronLeft size={18} />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent text-center font-medium text-sm md:text-base focus:outline-none text-text"
        />
        <button onClick={() => shiftDate(1)} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-text-muted">
          <ChevronRight size={18} />
        </button>
      </div>

      {log && (
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            { label: 'Protein', value: log.totalProtein, unit: 'g', color: 'text-protein' },
            { label: 'Calories', value: log.totalCalories, unit: 'kcal', color: 'text-calories' },
            { label: 'Spent', value: log.totalSpending, unit: '₹', color: 'text-spending' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-surface rounded-lg p-2.5 md:p-3.5 border border-border text-center">
              <p className={`text-lg md:text-2xl font-bold ${color}`}>{Math.round(value * 10) / 10}</p>
              <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">{unit} {label}</p>
            </div>
          ))}
        </div>
      )}

      {log?.entries?.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <h3 className="px-3.5 py-2.5 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted border-b border-border">Today's Food</h3>
          {log.entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted">
                  <FoodIcon name={entry.food.emoji} size={16} />
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium">{entry.food.name}</p>
                  <p className="text-[11px] md:text-sm text-text-muted">
                    {entry.servings}x {entry.food.serving} · {Math.round(entry.food.protein * entry.servings)}g · {Math.round(entry.food.calories * entry.servings)} cal
                  </p>
                </div>
              </div>
              <button onClick={() => removeEntry(entry.id)} className="p-1 text-spending/70 hover:text-spending hover:bg-spending/10 rounded-md transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-3">
        <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Add Food</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search your foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 md:py-2.5 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-muted/50"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs md:text-sm text-text-muted">Servings:</span>
          <button onClick={() => setServings(Math.max(0.5, servings - 0.5))} className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-surface-2 flex items-center justify-center hover:bg-border transition-colors text-text-muted">
            <Minus size={12} />
          </button>
          <span className="font-semibold text-sm md:text-base w-6 text-center">{servings}</span>
          <button onClick={() => setServings(servings + 0.5)} className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-surface-2 flex items-center justify-center hover:bg-border transition-colors text-text-muted">
            <Plus size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-44 md:max-h-64 overflow-y-auto">
          {filteredFoods.map(food => {
            const isSelected = selected.some(s => s.foodId === food.id);
            return (
              <button
                key={food.id}
                onClick={() => toggleFood(food.id)}
                className={`flex items-center gap-2 p-2.5 md:p-3 rounded-lg border transition-all text-left relative ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} className="text-bg" />
                  </div>
                )}
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted shrink-0">
                  <FoodIcon name={food.emoji} size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm md:text-base font-medium truncate">{food.name}</p>
                  <p className="text-[11px] md:text-sm text-text-muted">{food.protein}g · {food.calories} cal</p>
                </div>
              </button>
            );
          })}
          {filteredFoods.length === 0 && (
            <p className="col-span-2 text-center text-sm md:text-base text-text-muted py-4">
              No foods found. Add some in Profile!
            </p>
          )}
        </div>

        {selected.length > 0 && (
          <button
            onClick={addSelected}
            disabled={adding}
            className="w-full py-2.5 bg-primary text-bg text-sm md:text-base font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Save size={14} />
            {adding ? 'Adding...' : `Add ${selected.length} item${selected.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-3">
        <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted">Activity</h3>
        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-muted mb-1.5">
              <BookOpen size={12} /> Study Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={studyHours}
              onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
              onBlur={updateActivity}
              className="w-full px-3 py-2 md:py-2.5 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-muted mb-1.5">
              <Dumbbell size={12} /> Exercise (min)
            </label>
            <input
              type="number"
              step="5"
              min="0"
              value={exerciseMins}
              onChange={(e) => setExerciseMins(parseFloat(e.target.value) || 0)}
              onBlur={updateActivity}
              className="w-full px-3 py-2 md:py-2.5 rounded-lg border border-border bg-surface-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
