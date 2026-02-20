import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { ChevronLeft, ChevronRight, Plus, Minus, Trash2, BookOpen, Dumbbell, Search, Check, Save, MoreVertical, X } from 'lucide-react';
import FoodIcon from '../components/FoodIcon';
import StudyIcon from '../components/StudyIcon';

export default function LogEntry() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [log, setLog] = useState(null);
  const [foods, setFoods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [servings, setServings] = useState(1);
  const [selected, setSelected] = useState([]);
  const [adding, setAdding] = useState(false);
  const [exerciseMins, setExerciseMins] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [studyMenuOpen, setStudyMenuOpen] = useState(null);
  const [studyDeleteConfirm, setStudyDeleteConfirm] = useState(null);

  // Study session form
  const [studySubjectId, setStudySubjectId] = useState('');
  const [studyHoursInput, setStudyHoursInput] = useState(1);
  const [addingStudy, setAddingStudy] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadLog(),
      api.get('/foods').then(setFoods).catch(() => {}),
      api.get('/study-subjects').then(setSubjects).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [date]);

  async function loadLog() {
    try {
      const data = await api.get(`/logs?date=${date}`);
      setLog(data);
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

  async function addStudySession() {
    if (!log || !studySubjectId || addingStudy) return;
    setAddingStudy(true);
    try {
      await api.post(`/logs/${log.id}/study`, { subjectId: studySubjectId, hours: studyHoursInput });
      setStudyHoursInput(1);
      loadLog();
    } finally {
      setAddingStudy(false);
    }
  }

  async function removeStudyEntry(entryId) {
    if (!log) return;
    await api.delete(`/logs/${log.id}/study/${entryId}`);
    loadLog();
  }

  async function updateActivity() {
    if (!log) return;
    await api.patch(`/logs/${log.id}`, { exerciseMins });
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

      {loading ? (
        <div className="grid grid-cols-3 gap-2 md:gap-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg p-2.5 md:p-3.5 border border-border text-center">
              <div className="h-6 w-12 rounded bg-surface-2 mx-auto mb-1" />
              <div className="h-3 w-14 rounded bg-surface-2 mx-auto" />
            </div>
          ))}
        </div>
      ) : log && (
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

      {/* Today's Food */}
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
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === entry.id ? null : entry.id)}
                  className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                {menuOpen === entry.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => { setMenuOpen(null); setDeleteConfirm(entry); }}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm text-spending hover:bg-spending/10 transition-colors whitespace-nowrap"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Food Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-sm space-y-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">Remove entry?</h3>
              <button onClick={() => setDeleteConfirm(null)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs md:text-sm text-text-muted">
              Remove <span className="font-medium text-text">{deleteConfirm.food?.name}</span> ({deleteConfirm.servings}x) from this log?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { removeEntry(deleteConfirm.id); setDeleteConfirm(null); }}
                className="flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg bg-spending/10 text-spending hover:bg-spending/20 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Food */}
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

      {/* Study Sessions */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <h3 className="px-3.5 py-2.5 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted border-b border-border flex items-center gap-1.5">
          <BookOpen size={13} /> Study Sessions
          {log?.studyHours > 0 && (
            <span className="ml-auto text-study font-bold text-xs md:text-sm normal-case tracking-normal">{Math.round(log.studyHours * 10) / 10}h total</span>
          )}
        </h3>

        {log?.studyEntries?.length > 0 && (
          log.studyEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-study/10 flex items-center justify-center text-study">
                  <StudyIcon name={entry.subject?.emoji} size={16} />
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium">{entry.subject?.name}</p>
                  <p className="text-[11px] md:text-sm text-text-muted">{entry.hours}h</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setStudyMenuOpen(studyMenuOpen === entry.id ? null : entry.id)}
                  className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                {studyMenuOpen === entry.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setStudyMenuOpen(null)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => { setStudyMenuOpen(null); setStudyDeleteConfirm(entry); }}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm text-spending hover:bg-spending/10 transition-colors whitespace-nowrap"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {subjects.length > 0 ? (
          <div className="p-3.5 md:p-4 space-y-2.5 bg-surface-2/30">
            <div className="flex gap-2">
              <select
                value={studySubjectId}
                onChange={(e) => setStudySubjectId(e.target.value)}
                className="flex-1 px-3 py-2 md:py-2.5 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-study/50 appearance-none"
              >
                <option value="">Select subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={studyHoursInput}
                onChange={(e) => setStudyHoursInput(parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 md:py-2.5 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-study/50 text-center"
                placeholder="hrs"
              />
            </div>
            <button
              onClick={addStudySession}
              disabled={!studySubjectId || addingStudy}
              className="w-full py-2 bg-study text-bg text-xs md:text-sm font-semibold rounded-lg hover:bg-study/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              {addingStudy ? 'Adding...' : 'Add Session'}
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-6 text-center">
            <p className="text-xs md:text-sm text-text-muted">No subjects yet. Add some in Profile!</p>
          </div>
        )}
      </div>

      {/* Study Delete Modal */}
      {studyDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setStudyDeleteConfirm(null)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-sm space-y-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">Remove session?</h3>
              <button onClick={() => setStudyDeleteConfirm(null)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs md:text-sm text-text-muted">
              Remove <span className="font-medium text-text">{studyDeleteConfirm.subject?.name}</span> ({studyDeleteConfirm.hours}h) from this log?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStudyDeleteConfirm(null)}
                className="flex-1 py-2 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { removeStudyEntry(studyDeleteConfirm.id); setStudyDeleteConfirm(null); }}
                className="flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg bg-spending/10 text-spending hover:bg-spending/20 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise */}
      <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border space-y-3">
        <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Dumbbell size={13} /> Exercise
        </h3>
        <div>
          <label className="flex items-center gap-1.5 text-xs md:text-sm text-text-muted mb-1.5">
            Minutes
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
  );
}
