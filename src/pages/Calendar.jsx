import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ChevronLeft, ChevronRight, Beef, Flame, Wallet, BookOpen, Dumbbell, Loader2, Pencil } from 'lucide-react';
import FoodIcon from '../components/FoodIcon';

const categories = [
  { key: 'totalProtein', label: 'Protein', unit: 'g', color: 'text-protein', bg: 'bg-protein/10', icon: Beef },
  { key: 'totalCalories', label: 'Calories', unit: 'kcal', color: 'text-calories', bg: 'bg-calories/10', icon: Flame },
  { key: 'totalSpending', label: 'Spending', unit: '\u20b9', color: 'text-spending', bg: 'bg-spending/10', icon: Wallet },
  { key: 'studyHours', label: 'Study', unit: 'hrs', color: 'text-study', bg: 'bg-study/10', icon: BookOpen },
  { key: 'exerciseMins', label: 'Exercise', unit: 'min', color: 'text-exercise', bg: 'bg-exercise/10', icon: Dumbbell },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function pad(n) { return String(n).padStart(2, '0'); }

function toDateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function Calendar() {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
    setLog(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
    setLog(null);
  };

  const selectDay = useCallback(async (day) => {
    const dateStr = toDateStr(year, month, day);
    setSelectedDate(dateStr);
    setLoading(true);
    setLog(null);
    try {
      const data = await api.get(`/logs?date=${dateStr}`);
      setLog(data);
    } catch {
      setLog(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5 md:mb-7">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-text-muted text-sm md:text-base mt-0.5">Tap a day to see your stats</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-3.5 md:p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-text-muted transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-sm md:text-base font-semibold tracking-tight">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-text-muted transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] md:text-xs font-medium text-text-muted py-1.5">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateStr = toDateStr(year, month, day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={day}
                onClick={() => selectDay(day)}
                className={`
                  relative aspect-square flex items-center justify-center text-xs md:text-sm font-medium rounded-lg transition-all duration-150
                  ${isSelected
                    ? 'bg-primary text-bg'
                    : isToday
                      ? 'text-primary font-bold'
                      : 'text-text hover:bg-surface-2'
                  }
                `}
              >
                {day}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selectedDate && (
        <div className="mt-3 md:mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-text-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs md:text-sm text-text-muted font-medium">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <Link
                  to={`/app/log?date=${selectedDate}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
                {categories.map(({ key, label, unit, color, bg, icon: Icon }) => {
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
                      <p className="text-[11px] md:text-sm text-text-muted mt-0.5">{unit}</p>
                    </div>
                  );
                })}
              </div>

              {log?.entries?.length > 0 && (
                <div className="mt-3 md:mt-4 bg-surface rounded-xl border border-border overflow-hidden">
                  <h3 className="px-3.5 py-2.5 md:px-4 md:py-3 font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted border-b border-border">Food Entries</h3>
                  {log.entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-3.5 py-2.5 md:px-4 md:py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted">
                          <FoodIcon name={entry.food?.emoji} size={16} />
                        </div>
                        <div>
                          <p className="text-sm md:text-base font-medium">{entry.food?.name}</p>
                          <p className="text-[11px] md:text-sm text-text-muted">
                            {entry.servings}x · {Math.round(entry.food?.protein * entry.servings)}g · {Math.round(entry.food?.calories * entry.servings)} cal
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
