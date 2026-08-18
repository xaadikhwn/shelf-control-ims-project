import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Banknote,
  FileSpreadsheet,
  UserCheck,
  Building2,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  X,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sales', label: 'Sales', icon: ShoppingBag },
  { path: '/inventory', label: 'Inventory', icon: Boxes },
  { path: '/payroll', label: 'Payroll', icon: Banknote },
  { path: '/expenses', label: 'Expenses', icon: FileSpreadsheet },
  { path: '/customers', label: 'Customers', icon: UserCheck },
  { path: '/suppliers', label: 'Suppliers', icon: Building2 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const location = useLocation();
  const safeUser = user ?? { name: 'User', role: 'Staff', initials: 'US', studentId: 'N/A' };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-accent-blue to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">BizManage</h1>
            <p className="text-[10px] text-text-muted">SME Platform v1.0</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 mx-3 mb-4 bg-navy-700/40 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-accent-blue">
            {safeUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {safeUser.name}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-accent-blue-light">
                {safeUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Modules
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-accent-blue/10 text-accent-blue-light'
                  : 'text-text-secondary hover:bg-navy-700/50 hover:text-text-primary'
              }`}
            >
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${
                  isActive(item.path)
                    ? 'text-accent-blue-light'
                    : 'text-text-muted group-hover:text-text-secondary'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive(item.path) && (
                <ChevronRight className="w-4 h-4 text-accent-blue-light" />
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom items */}
      <div className="px-3 pb-3 pt-2 border-t border-navy-500/30 mt-auto space-y-2">
        <div className="flex flex-col gap-2">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all duration-200 ${
              isActive('/settings')
                ? 'bg-accent-blue/10 text-accent-blue-light'
                : 'text-text-secondary hover:bg-navy-700/50 hover:text-text-primary'
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-text-secondary hover:bg-navy-700/50 hover:text-text-primary transition-all duration-200"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>

        {/* Session footer */}
        <p className="px-3 pt-2 text-[9px] font-mono text-text-muted leading-relaxed">
          JWT · Session active · ID:
          <br />
          {safeUser.studentId}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-navy-900 border-r border-navy-500/30 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-navy-900 border-r border-navy-500/30 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-navy-700 text-text-muted"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
