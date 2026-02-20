import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Plus, Beef, Flame, Wallet, BookOpen, Dumbbell } from 'lucide-react';

const categories = [
  { key: 'totalProtein', label: 'Protein', unit: 'g', color: 'text-protein', bg: 'bg-protein/10', icon: Beef },
  { key: 'totalCalories', label: 'Calories', unit: 'kcal', color: 'text-calories', bg: 'bg-calories/10', icon: Flame },
  { key: 'totalSpending', label: 'Spending', unit: '₹', color: 'text-spending', bg: 'bg-spending/10', icon: Wallet },
  { key: 'studyHours', label: 'Study', unit: 'hrs', color: 'text-study', bg: 'bg-study/10', icon: BookOpen },
  { key: 'exerciseMins', label: 'Exercise', unit: 'min', color: 'text-exercise', bg: 'bg-exercise/10', icon: Dumbbell },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/logs?date=${today}`).then(setLog).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
          categories.map(({ key, label, unit, color, bg, icon: Icon }) => {
            const value = log?.[key] || 0;
            return (
              <div key={key} className="bg-surface rounded-xl p-3.5 md:p-5 border border-border hover:border-surface-2 transition-all">
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
              </div>
            );
          })
        )}
      </div>

      <Link
        to="/app/log"
        className="fixed bottom-18 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-primary text-bg rounded-xl flex items-center justify-center hover:bg-primary-light transition-colors z-30"
      >
        <Plus size={22} />
      </Link>
    </div>
  );
}
