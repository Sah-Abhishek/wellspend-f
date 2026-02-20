import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { LogOut, Plus, Trash2, UtensilsCrossed, Save, Bell, BellOff, BookOpen, MoreVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { isPushSupported, subscribeToPush, unsubscribeFromPush, isSubscribed } from '../utils/pushNotifications';
import FoodIcon, { foodIconKeys, foodIconMap } from '../components/FoodIcon';
import StudyIcon, { studyIconKeys, studyIconMap } from '../components/StudyIcon';

export default function Profile() {
  const { user, logout } = useAuth();
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', protein: '', calories: '', cost: '', serving: '1 serving', emoji: 'utensils' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported] = useState(() => isPushSupported());
  const [foodMenuOpen, setFoodMenuOpen] = useState(null);
  const [foodDeleteConfirm, setFoodDeleteConfirm] = useState(null);

  // Study subjects state
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [showSubjectAdd, setShowSubjectAdd] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', emoji: 'book' });
  const [subjectEditId, setSubjectEditId] = useState(null);
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(null);
  const [subjectDeleteConfirm, setSubjectDeleteConfirm] = useState(null);

  useEffect(() => {
    api.get('/foods').then(setFoods).catch(() => {}).finally(() => setFoodsLoading(false));
    api.get('/study-subjects').then(setSubjects).catch(() => {}).finally(() => setSubjectsLoading(false));
    if (pushSupported) {
      isSubscribed().then(setPushEnabled).catch(() => {});
    }
  }, [pushSupported]);

  function resetForm() {
    setForm({ name: '', protein: '', calories: '', cost: '', serving: '1 serving', emoji: 'utensils' });
    setEditId(null);
    setShowAdd(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = { ...form, protein: parseFloat(form.protein) || 0, calories: parseFloat(form.calories) || 0, cost: parseFloat(form.cost) || 0 };
      if (editId) {
        const updated = await api.put(`/foods/${editId}`, payload);
        setFoods(foods.map(f => f.id === editId ? updated : f));
      } else {
        const created = await api.post('/foods', payload);
        setFoods([...foods, created]);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFood(id) {
    await api.delete(`/foods/${id}`);
    setFoods(foods.filter(f => f.id !== id));
    setFoodDeleteConfirm(null);
  }

  function startEdit(food) {
    setForm({ name: food.name, protein: food.protein, calories: food.calories, cost: food.cost, serving: food.serving, emoji: food.emoji });
    setEditId(food.id);
    setShowAdd(true);
  }

  // Subject handlers
  function resetSubjectForm() {
    setSubjectForm({ name: '', emoji: 'book' });
    setSubjectEditId(null);
    setShowSubjectAdd(false);
  }

  async function handleSubjectSave(e) {
    e.preventDefault();
    if (subjectSaving) return;
    setSubjectSaving(true);
    try {
      if (subjectEditId) {
        const updated = await api.put(`/study-subjects/${subjectEditId}`, subjectForm);
        setSubjects(subjects.map(s => s.id === subjectEditId ? updated : s));
      } else {
        const created = await api.post('/study-subjects', subjectForm);
        setSubjects([...subjects, created]);
      }
      resetSubjectForm();
    } finally {
      setSubjectSaving(false);
    }
  }

  async function handleDeleteSubject(id) {
    await api.delete(`/study-subjects/${id}`);
    setSubjects(subjects.filter(s => s.id !== id));
    setSubjectDeleteConfirm(null);
  }

  function startSubjectEdit(subject) {
    setSubjectForm({ name: subject.name, emoji: subject.emoji });
    setSubjectEditId(subject.id);
    setShowSubjectAdd(true);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
      <div className="bg-surface rounded-xl p-4 md:p-5 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg md:text-xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">{user?.name}</h1>
            <p className="text-xs md:text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {pushSupported && (
            <button
              onClick={async () => {
                if (pushEnabled) {
                  await unsubscribeFromPush();
                  setPushEnabled(false);
                  toast.success('Notifications disabled');
                } else {
                  if (Notification.permission === 'denied') {
                    toast.error('Notifications blocked. Enable them in browser settings.');
                    return;
                  }
                  const ok = await subscribeToPush();
                  setPushEnabled(ok);
                  if (ok) toast.success('Notifications enabled');
                  else toast.error('Could not enable notifications');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-lg transition-colors ${
                pushEnabled
                  ? 'text-primary/70 hover:text-primary hover:bg-primary/10'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              {pushEnabled ? <Bell size={13} /> : <BellOff size={13} />}
              {pushEnabled ? 'Notifications on' : 'Notifications off'}
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm text-spending/70 hover:text-spending hover:bg-spending/10 rounded-lg transition-colors"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </div>

      {/* My Foods */}
      <div className="bg-surface rounded-xl border border-border">
        <div className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border">
          <h2 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <UtensilsCrossed size={13} /> My Foods
          </h2>
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleSave} className="p-3.5 md:p-4 border-b border-border space-y-2.5 bg-surface-2/50">
            <div className="flex gap-2">
              <div className="grid grid-cols-6 gap-1 w-fit">
                {foodIconKeys.map(key => {
                  const IconComp = foodIconMap[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, emoji: key })}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-colors ${
                        form.emoji === key ? 'bg-primary/20 text-primary ring-1 ring-primary/50' : 'bg-surface text-text-muted hover:bg-surface-2'
                      }`}
                    >
                      <IconComp size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              type="text"
              placeholder="Food name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-text-muted/50"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">Protein (g)</label>
                <input type="number" step="0.1" value={form.protein} placeholder="0" onChange={(e) => setForm({ ...form, protein: e.target.value })}
                  className="w-full px-2.5 py-1.5 md:py-2 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">Calories</label>
                <input type="number" step="1" value={form.calories} placeholder="0" onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  className="w-full px-2.5 py-1.5 md:py-2 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">Cost (₹)</label>
                <input type="number" step="0.5" value={form.cost} placeholder="0" onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="w-full px-2.5 py-1.5 md:py-2 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider">Serving</label>
                <input type="text" value={form.serving} onChange={(e) => setForm({ ...form, serving: e.target.value })}
                  className="w-full px-2.5 py-1.5 md:py-2 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-primary text-bg text-xs md:text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                <Save size={12} /> {saving ? 'Saving...' : editId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForm} className="px-3 py-2 text-xs md:text-sm text-text-muted hover:bg-surface-2 rounded-lg border border-border transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {foodsLoading ? (
          <div className="animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-surface-2 mb-1.5" />
                  <div className="h-3 w-36 rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : foods.length === 0 && !showAdd ? (
          <div className="px-3.5 py-8 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-2">
              <UtensilsCrossed size={20} className="text-text-muted" />
            </div>
            <p className="text-xs md:text-sm text-text-muted">No foods saved yet. Add your first food item!</p>
          </div>
        ) : (
          foods.map(food => (
            <div key={food.id} className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
              <button onClick={() => startEdit(food)} className="flex items-center gap-2.5 text-left flex-1">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted">
                  <FoodIcon name={food.emoji} size={16} />
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium">{food.name}</p>
                  <p className="text-[11px] md:text-sm text-text-muted">
                    {food.protein}g · {food.calories} cal · ₹{food.cost} · {food.serving}
                  </p>
                </div>
              </button>
              <div className="relative">
                <button
                  onClick={() => setFoodMenuOpen(foodMenuOpen === food.id ? null : food.id)}
                  className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                {foodMenuOpen === food.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setFoodMenuOpen(null)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => { setFoodMenuOpen(null); setFoodDeleteConfirm(food); }}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm text-spending hover:bg-spending/10 transition-colors whitespace-nowrap"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Food Delete Confirmation Modal */}
      {foodDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setFoodDeleteConfirm(null)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-sm space-y-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">Delete food?</h3>
              <button onClick={() => setFoodDeleteConfirm(null)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs md:text-sm text-text-muted">
              Delete <span className="font-medium text-text">{foodDeleteConfirm.name}</span>? This will also remove it from all logged entries.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFoodDeleteConfirm(null)}
                className="flex-1 py-2 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFood(foodDeleteConfirm.id)}
                className="flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg bg-spending/10 text-spending hover:bg-spending/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Subjects */}
      <div className="bg-surface rounded-xl border border-border">
        <div className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border">
          <h2 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <BookOpen size={13} /> My Subjects
          </h2>
          <button
            onClick={() => { resetSubjectForm(); setShowSubjectAdd(true); }}
            className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {showSubjectAdd && (
          <form onSubmit={handleSubjectSave} className="p-3.5 md:p-4 border-b border-border space-y-2.5 bg-surface-2/50">
            <div className="flex gap-2">
              <div className="grid grid-cols-7 gap-1 w-fit">
                {studyIconKeys.map(key => {
                  const IconComp = studyIconMap[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSubjectForm({ ...subjectForm, emoji: key })}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-colors ${
                        subjectForm.emoji === key ? 'bg-study/20 text-study ring-1 ring-study/50' : 'bg-surface text-text-muted hover:bg-surface-2'
                      }`}
                    >
                      <IconComp size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              type="text"
              placeholder="Subject name"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-study/50 placeholder:text-text-muted/50"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={subjectSaving} className="flex-1 py-2 bg-study text-bg text-xs md:text-sm font-semibold rounded-lg hover:bg-study/90 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                <Save size={12} /> {subjectSaving ? 'Saving...' : subjectEditId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetSubjectForm} className="px-3 py-2 text-xs md:text-sm text-text-muted hover:bg-surface-2 rounded-lg border border-border transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {subjectsLoading ? (
          <div className="animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : subjects.length === 0 && !showSubjectAdd ? (
          <div className="px-3.5 py-8 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-2">
              <BookOpen size={20} className="text-text-muted" />
            </div>
            <p className="text-xs md:text-sm text-text-muted">No subjects yet. Add subjects you want to track!</p>
          </div>
        ) : (
          subjects.map(subject => (
            <div key={subject.id} className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
              <button onClick={() => startSubjectEdit(subject)} className="flex items-center gap-2.5 text-left flex-1">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-study/10 flex items-center justify-center text-study">
                  <StudyIcon name={subject.emoji} size={16} />
                </div>
                <p className="text-sm md:text-base font-medium">{subject.name}</p>
              </button>
              <div className="relative">
                <button
                  onClick={() => setSubjectMenuOpen(subjectMenuOpen === subject.id ? null : subject.id)}
                  className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                {subjectMenuOpen === subject.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSubjectMenuOpen(null)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => { setSubjectMenuOpen(null); setSubjectDeleteConfirm(subject); }}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm text-spending hover:bg-spending/10 transition-colors whitespace-nowrap"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subject Delete Confirmation Modal */}
      {subjectDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSubjectDeleteConfirm(null)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-sm space-y-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">Delete subject?</h3>
              <button onClick={() => setSubjectDeleteConfirm(null)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs md:text-sm text-text-muted">
              Delete <span className="font-medium text-text">{subjectDeleteConfirm.name}</span>? This will also remove all logged study sessions for this subject.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSubjectDeleteConfirm(null)}
                className="flex-1 py-2 text-xs md:text-sm font-medium rounded-lg border border-border text-text-muted hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubject(subjectDeleteConfirm.id)}
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
