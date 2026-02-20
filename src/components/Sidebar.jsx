import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Users, BarChart3, CalendarDays, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/log', icon: UtensilsCrossed, label: 'Log' },
  { to: '/app/groups', icon: Users, label: 'Groups' },
  { to: '/app/stats', icon: BarChart3, label: 'Stats' },
  { to: '/app/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-surface border-r border-border z-50
          flex flex-col transition-all duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
          ${collapsed ? 'w-[72px]' : 'w-60'}
        `}
      >
        <div className={`flex items-center h-14 px-4 border-b border-border ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Well</span><span className="text-text">Spend</span>
            </span>
          )}
          {collapsed && (
            <span className="text-lg font-bold text-primary">W</span>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-surface-2 transition-colors text-text-muted"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-surface-2 transition-colors text-text-muted"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150
                ${isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text'
                }
                ${collapsed ? 'justify-center' : ''}`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {!collapsed && <span className="font-medium text-[13px] md:text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && user && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-medium truncate">{user.name}</p>
                <p className="text-[11px] text-text-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
