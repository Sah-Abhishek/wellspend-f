import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, ChevronLeft, ChevronRight, BarChart3, CalendarDays, Loader2, Beef, Flame, Wallet, BookOpen, Dumbbell } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FoodIcon from '../components/FoodIcon';

const statsCategories = [
  { key: 'totalProtein', label: 'Protein', color: '#10B981', unit: 'g' },
  { key: 'totalCalories', label: 'Calories', color: '#F59E0B', unit: 'kcal' },
  { key: 'totalSpending', label: 'Spending', color: '#EF4444', unit: '₹' },
  { key: 'studyHours', label: 'Study', color: '#3B82F6', unit: 'hrs' },
  { key: 'exerciseMins', label: 'Exercise', color: '#8B5CF6', unit: 'min' },
];

const calCategories = [
  { key: 'totalProtein', label: 'Protein', unit: 'g', color: 'text-protein', bg: 'bg-protein/10', icon: Beef },
  { key: 'totalCalories', label: 'Calories', unit: 'kcal', color: 'text-calories', bg: 'bg-calories/10', icon: Flame },
  { key: 'totalSpending', label: 'Spending', unit: '₹', color: 'text-spending', bg: 'bg-spending/10', icon: Wallet },
  { key: 'studyHours', label: 'Study', unit: 'hrs', color: 'text-study', bg: 'bg-study/10', icon: BookOpen },
  { key: 'exerciseMins', label: 'Exercise', unit: 'min', color: 'text-exercise', bg: 'bg-exercise/10', icon: Dumbbell },
];

const tooltipStyle = {
  contentStyle: { background: '#1C2330', border: '1px solid #1E2A37', borderRadius: '8px', fontSize: '12px', color: '#E8ECF1' },
  itemStyle: { color: '#E8ECF1' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function pad(n) { return String(n).padStart(2, '0'); }
function toDateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function MemberStats() {
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [memberName, setMemberName] = useState('');

  // Stats state
  const [range, setRange] = useState('week');
  const [category, setCategory] = useState('totalProtein');
  const [data, setData] = useState([]);

  // Calendar state
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [log, setLog] = useState(null);
  const [calLoading, setCalLoading] = useState(false);

  useEffect(() => {
    api.get(`/groups/${id}`).then(group => {
      const member = group.members?.find(m => m.user.id === userId);
      setMemberName(member?.user?.name || 'Member');
    }).catch(() => {});
  }, [id, userId]);

  useEffect(() => {
    const todayDate = new Date().toISOString().split('T')[0];
    api.get(`/groups/${id}/members/${userId}/stats?range=${range}&date=${todayDate}`)
      .then(setData)
      .catch(() => setData([]));
  }, [id, userId, range]);

  const cat = statsCategories.find(c => c.key === category);
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
    value: d[category] || 0,
  }));

  const avg = chartData.length
    ? Math.round((chartData.reduce((s, d) => s + d.value, 0) / chartData.length) * 10) / 10
    : 0;
  const max = chartData.length ? Math.max(...chartData.map(d => d.value)) : 0;

  // Calendar helpers
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
    setCalLoading(true);
    setLog(null);
    try {
      const data = await api.get(`/groups/${id}/members/${userId}/logs?date=${dateStr}`);
      setLog(data);
    } catch {
      setLog(null);
    } finally {
      setCalLoading(false);
    }
  }, [year, month, id, userId]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
      <button onClick={() => navigate(`/app/groups/${id}`)} className="flex items-center gap-1 text-xs md:text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} /> Back to group
      </button>

      <h1 className="text-xl md:text-2xl font-bold tracking-tight">{memberName}&rsquo;s Stats</h1>

      {/* Tabs */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setTab('stats')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            tab === 'stats' ? 'bg-primary/15 text-primary' : 'bg-surface text-text-muted border border-border hover:bg-surface-2'
          }`}
        >
          <BarChart3 size={14} /> Stats
        </button>
        <button
          onClick={() => setTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            tab === 'calendar' ? 'bg-primary/15 text-primary' : 'bg-surface text-text-muted border border-border hover:bg-surface-2'
          }`}
        >
          <CalendarDays size={14} /> Calendar
        </button>
      </div>

      {tab === 'stats' && (
        <>
          <div className="flex gap-1.5">
            {['week', 'month'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  range === r ? 'bg-primary/15 text-primary' : 'bg-surface text-text-muted border border-border hover:bg-surface-2'
                }`}
              >
                {r === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {statsCategories.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[11px] md:text-sm font-semibold whitespace-nowrap transition-colors border ${
                  category === c.key
                    ? 'text-bg border-transparent'
                    : 'bg-surface text-text-muted border-border hover:bg-surface-2'
                }`}
                style={category === c.key ? { backgroundColor: c.color, borderColor: c.color } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-surface rounded-lg p-3 md:p-4 border border-border">
              <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider mb-1">Average</p>
              <p className="text-xl md:text-2xl font-bold tracking-tight">{avg} <span className="text-xs md:text-sm font-normal text-text-muted">{cat?.unit}</span></p>
            </div>
            <div className="bg-surface rounded-lg p-3 md:p-4 border border-border">
              <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-wider mb-1">Best Day</p>
              <p className="text-xl md:text-2xl font-bold tracking-tight">{max} <span className="text-xs md:text-sm font-normal text-text-muted">{cat?.unit}</span></p>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border">
            <h3 className="font-semibold text-xs md:text-sm uppercase tracking-wider text-text-muted mb-4">
              {range === 'week' ? 'Weekly' : 'Monthly'} Overview
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              {range === 'week' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A37" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7A8D' }} axisLine={{ stroke: '#1E2A37' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7A8D' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" fill={cat?.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A37" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7A8D' }} axisLine={{ stroke: '#1E2A37' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7A8D' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke={cat?.color} strokeWidth={2} dot={{ r: 3, fill: cat?.color }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === 'calendar' && (
        <>
          <div className="bg-surface rounded-xl border border-border p-3.5 md:p-5">
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

            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] md:text-xs font-medium text-text-muted py-1.5">
                  {d}
                </div>
              ))}
            </div>

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

          {selectedDate && (
            <div className="mt-3 md:mt-4">
              {calLoading ? (
                <div className="flex items-center justify-center py-10 text-text-muted">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <>
                  <p className="text-xs md:text-sm text-text-muted font-medium mb-2.5">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
                    {calCategories.map(({ key, label, unit, color, bg, icon: Icon }) => {
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
        </>
      )}
    </div>
  );
}
