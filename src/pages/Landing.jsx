import { Link } from 'react-router-dom';
import { TrendingUp, Users, Zap, UtensilsCrossed, Target } from 'lucide-react';

const features = [
  { icon: UtensilsCrossed, title: 'Track Nutrition', desc: 'Log protein, calories & food expenses daily', color: 'text-protein' },
  { icon: TrendingUp, title: 'Study & Exercise', desc: 'Monitor study hours and workout minutes', color: 'text-study' },
  { icon: Users, title: 'Group Goals', desc: 'Join groups, set targets & compete together', color: 'text-spending' },
  { icon: Zap, title: 'Earn Points', desc: 'Hit daily goals and climb the leaderboard', color: 'text-calories' },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl md:text-2xl font-bold tracking-tight">
          <span className="text-primary">Well</span><span className="text-text">Spend</span>
        </span>
        <div className="flex gap-2">
          <Link to="/login" className="px-4 py-2 text-sm md:text-base font-medium text-text-muted hover:text-text rounded-lg transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm md:text-base font-medium bg-primary text-bg rounded-lg hover:bg-primary-light transition-colors">
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Target size={28} className="text-primary md:w-8 md:h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-text mb-4 leading-tight tracking-tight">
          Spend your time<br />
          <span className="text-primary">& money wisely</span>
        </h1>
        <p className="text-text-muted text-base md:text-lg max-w-md mb-8 leading-relaxed">
          Track what you eat, what you spend, how you study, and how you move — all in one place.
        </p>
        <Link
          to="/signup"
          className="px-7 py-3 bg-primary text-bg font-semibold rounded-xl text-base md:text-lg hover:bg-primary-light transition-colors"
        >
          Get Started Free
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-14 max-w-3xl w-full">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-surface rounded-xl p-4 md:p-5 text-left border border-border hover:border-surface-2 transition-all">
              <Icon className={`${color} mb-2.5`} size={22} />
              <h3 className="font-semibold text-[13px] md:text-base mb-1">{title}</h3>
              <p className="text-xs md:text-sm text-text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
