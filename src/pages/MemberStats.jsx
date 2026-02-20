import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft } from 'lucide-react';
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

export default function MemberStats() {
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState('week');
  const [category, setCategory] = useState('totalProtein');
  const [data, setData] = useState([]);
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    api.get(`/groups/${id}`).then(group => {
      const member = group.members?.find(m => m.user.id === userId);
      setMemberName(member?.user?.name || 'Member');
    }).catch(() => {});
  }, [id, userId]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/groups/${id}/members/${userId}/stats?range=${range}&date=${today}`)
      .then(setData)
      .catch(() => setData([]));
  }, [id, userId, range]);

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
      <button onClick={() => navigate(`/app/groups/${id}`)} className="flex items-center gap-1 text-xs md:text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} /> Back to group
      </button>

      <h1 className="text-xl md:text-2xl font-bold tracking-tight">{memberName}'s Stats</h1>

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
    </div>
  );
}
