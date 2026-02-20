import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Plus, Beef, Flame, Wallet, BookOpen, Dumbbell, X } from 'lucide-react';
import FoodIcon from '../components/FoodIcon';
import StudyIcon from '../components/StudyIcon';

const categories = [
  { key: 'totalProtein', label: 'Protein', unit: 'g', color: 'text-protein', bg: 'bg-protein/10', icon: Beef, type: 'food', field: 'protein' },
  { key: 'totalCalories', label: 'Calories', unit: 'kcal', color: 'text-calories', bg: 'bg-calories/10', icon: Flame, type: 'food', field: 'calories' },
  { key: 'totalSpending', label: 'Spending', unit: '₹', color: 'text-spending', bg: 'bg-spending/10', icon: Wallet, type: 'food', field: 'cost' },
  { key: 'studyHours', label: 'Study', unit: 'hrs', color: 'text-study', bg: 'bg-study/10', icon: BookOpen, type: 'study' },
  { key: 'exerciseMins', label: 'Exercise', unit: 'min', color: 'text-exercise', bg: 'bg-exercise/10', icon: Dumbbell, type: 'exercise' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/logs?date=${today}`).then(setLog).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function openDetail(cat) {
    const value = log?.[cat.key] || 0;
    if (value === 0) return;
    setDetail(cat);
  }

  function renderBreakdown() {
    if (!detail || !log) return null;

    if (detail.type === 'food') {
      const entries = log.entries || [];
      if (entries.length === 0) return <p className="text-xs md:text-sm text-text-muted text-center py-4">No entries yet</p>;
      return entries.map(entry => {
        const contribution = Math.round(entry.food[detail.field] * entry.servings * 10) / 10;
        return (
          <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted">
                <FoodIcon name={entry.food.emoji} size={14} />
              </div>
              <div>
                <p className="text-sm md:text-base font-medium">{entry.food.name}</p>
                <p className="text-[11px] md:text-xs text-text-muted">{entry.servings}x {entry.food.serving}</p>
              </div>
            </div>
            <span className={`text-sm md:text-base font-semibold ${detail.color}`}>
              {detail.field === 'cost' ? '₹' : ''}{contribution}{detail.field === 'protein' ? 'g' : detail.field === 'calories' ? '' : ''}
            </span>
          </div>
        );
      });
    }

    if (detail.type === 'study') {
      const entries = log.studyEntries || [];
      if (entries.length === 0) return <p className="text-xs md:text-sm text-text-muted text-center py-4">No entries yet</p>;
      return entries.map(entry => (
        <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-study/10 flex items-center justify-center text-study">
              <StudyIcon name={entry.subject?.emoji} size={14} />
            </div>
            <p className="text-sm md:text-base font-medium">{entry.subject?.name}</p>
          </div>
          <span className="text-sm md:text-base font-semibold text-study">{entry.hours}h</span>
        </div>
      ));
    }

    if (detail.type === 'exercise') {
      return (
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-exercise/10 flex items-center justify-center text-exercise">
              <Dumbbell size={14} />
            </div>
            <p className="text-sm md:text-base font-medium">Exercise</p>
          </div>
          <span className="text-sm md:text-base font-semibold text-exercise">{log.exerciseMins} min</span>
        </div>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5 md:mb-7">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-text-muted text-sm md:text-base mt-0.5">Here's your day so far</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-3.5 md:p-5 border border-border animate-pulse">
              <div className="flex items-center justify-between mb-2.5 md:mb-3">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2" />
                <div className="h-3 w-12 rounded bg-surface-2" />
              </div>
              <div className="h-7 w-16 rounded bg-surface-2 mb-1" />
              <div className="h-3 w-14 rounded bg-surface-2" />
            </div>
          ))
        ) : (
          categories.map(cat => {
            const { key, label, unit, color, bg, icon: Icon } = cat;
            const value = log?.[key] || 0;
            return (
              <button
                key={key}
                onClick={() => openDetail(cat)}
                className="bg-surface rounded-xl p-3.5 md:p-5 border border-border hover:border-surface-2 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2.5 md:mb-3">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon size={18} className={color} />
                  </div>
                  <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${color}`}>
                    {label}
                  </span>
                </div>
                <p className={`text-2xl md:text-3xl font-bold tracking-tight ${color}`}>
                  {Math.round(value * 10) / 10}
                </p>
                <p className="text-[11px] md:text-sm text-text-muted mt-0.5">{unit} today</p>
              </button>
            );
          })
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDetail(null)}>
          <div className="bg-surface rounded-xl border border-border p-5 w-full max-w-sm space-y-3 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${detail.bg} flex items-center justify-center`}>
                  <detail.icon size={16} className={detail.color} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base">{detail.label} Breakdown</h3>
                  <p className={`text-xs font-semibold ${detail.color}`}>{Math.round((log?.[detail.key] || 0) * 10) / 10} {detail.unit} total</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 text-text-muted hover:text-text rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {renderBreakdown()}
            </div>
          </div>
        </div>
      )}

      <Link
        to="/app/log"
        className="fixed bottom-18 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-primary text-bg rounded-xl flex items-center justify-center hover:bg-primary-light transition-colors z-30"
      >
        <Plus size={22} />
      </Link>
    </div>
  );
}
