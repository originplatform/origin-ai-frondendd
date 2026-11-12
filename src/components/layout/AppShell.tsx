import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  Bot,
  CheckSquare,
  History,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workspace', label: 'Agent Workspace', icon: Terminal },
  { to: '/history', label: 'Task History', icon: History },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare, badgeKey: 'approvals' as const },
  { to: '/directory', label: 'Agent Directory', icon: Bot },
  { to: '/services', label: 'Connected Services', icon: Link2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const list = await api.approvals.list('pending');
        if (active) setPendingApprovals(list.length);
      } catch {
        // ignore transient error
      }
    };
    void fetchCounts();
    const timer = setInterval(fetchCounts, 12000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [location.pathname]);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-origin-border w-64">
      <div className="px-5 h-16 flex items-center justify-between border-b border-origin-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-origin-ink text-white flex items-center justify-center font-semibold text-sm tracking-tight">
            O
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-origin-ink leading-none">
              ORIGIN AI
            </div>
            <div className="text-[11px] text-origin-faint mt-0.5">Command Center</div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-origin-muted hover:bg-origin-surface"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-origin-accent-soft text-origin-accent'
                    : 'text-origin-muted hover:text-origin-ink hover:bg-origin-subtle'
                )
              }
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                {item.label}
              </span>
              {item.badgeKey === 'approvals' && pendingApprovals > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800">
                  {pendingApprovals}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-origin-border space-y-3">
        <div className="px-3 py-2 rounded-lg bg-origin-subtle border border-origin-border/70">
          <div className="flex items-center gap-2 text-xs font-medium text-origin-ink">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Guardrails Active
          </div>
          <p className="text-[11px] text-origin-faint mt-0.5 leading-snug">
            Allowlisted tools & HITL approvals enabled
          </p>
        </div>

        <div className="flex items-center justify-between px-2 py-1">
          <div className="min-w-0">
            <div className="text-xs font-medium text-origin-ink truncate">
              {user?.full_name || 'User'}
            </div>
            <div className="text-[11px] text-origin-faint truncate">{user?.email}</div>
          </div>
          <button
            onClick={() => void logout()}
            title="Sign out"
            className="p-1.5 rounded-lg text-origin-muted hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-origin-subtle text-origin-ink">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block flex-shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/85 backdrop-blur-sm border-b border-origin-border sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-origin-muted hover:bg-origin-surface"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-origin-faint">
              <Activity className="w-3.5 h-3.5 text-origin-accent" />
              <span>Multi-Agent Runtime</span>
              <span className="text-slate-300">/</span>
              <span className="text-origin-ink font-medium capitalize">
                {user?.llm_provider || 'local'} provider
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-origin-faint">
              One Command. Infinite Possibilities.
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
