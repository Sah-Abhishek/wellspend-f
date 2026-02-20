import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center h-12 px-4 bg-surface border-b border-border shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-2 transition-colors text-text-muted"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 text-base font-bold tracking-tight">
            <span className="text-primary">Well</span><span className="text-text">Spend</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto pb-18 md:pb-6 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
