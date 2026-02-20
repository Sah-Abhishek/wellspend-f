import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Users, BarChart3, CalendarDays, User } from 'lucide-react';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/app/log', icon: UtensilsCrossed, label: 'Log' },
  { to: '/app/groups', icon: Users, label: 'Groups' },
  { to: '/app/stats', icon: BarChart3, label: 'Stats' },
  { to: '/app/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/app/profile', icon: User, label: 'Me' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-150 min-w-[52px]
              ${isActive ? 'text-primary' : 'text-text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
