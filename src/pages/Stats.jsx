import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const categories = [
  { key: 'totalProtein', label: 'Protein', color: '#10B981', unit: 'g' },
  { key: 'totalCalories', label: 'Calories', color: '#F59E0B', unit: 'kcal' },
  { key: 'totalSpending', label: 'Spending', color: '#EF4444', unit: '₹' },
  { key: 'studyHours', label: 'Study', color: '#3B82F6', unit: 'hrs' },
  { key: 'exerciseMins', label: 'Exercise', color: '#8B5CF6', unit: 'min' },
];

const tooltipStyle = {
  contentStyle: { background: '#1C2330', border: '1px solid #1E2A37', borderRadius: '8px', fontSize: '12px', color: '#E8ECF1' },
  itemStyle: { color: '#E8ECF1' },
};

export default function Stats() {
  const [range, setRange] = useState('week');
  const [category, setCategory] = useState('totalProtein');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    api.get(`/stats?range=${range}&date=${today}`)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [range]);

  const cat = categories.find(c => c.key === category);
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
    value: d[category] || 0,
  }));

  const avg = chartData.length
    ? Math.round((chartData.reduce((s, d) => s + d.value, 0) / chartData.length) * 10) / 10
    : 0;
  const max = chartData.length ? Math.max(...chartData.map(d => d.value)) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight">Stats</h1>

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
        {categories.map(c => (
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

      {loading ? (
        <div className="animate-pulse space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-surface rounded-lg p-3 md:p-4 border border-border">
              <div className="h-3 w-14 rounded bg-surface-2 mb-2" />
              <div className="h-6 w-20 rounded bg-surface-2" />
            </div>
            <div className="bg-surface rounded-lg p-3 md:p-4 border border-border">
              <div className="h-3 w-14 rounded bg-surface-2 mb-2" />
              <div className="h-6 w-20 rounded bg-surface-2" />
            </div>
          </div>
          <div className="bg-surface rounded-xl p-3.5 md:p-5 border border-border">
            <div className="h-3 w-28 rounded bg-surface-2 mb-4" />
            <div className="flex items-end gap-2 h-[220px] pb-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t bg-surface-2" style={{ height: `${30 + Math.random() * 50}%` }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
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
    </div>
  );
}
