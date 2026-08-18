import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/sales': 'Sales',
  '/inventory': 'Inventory',
  '/payroll': 'Payroll',
  '/expenses': 'Expenses',
  '/customers': 'Customers',
  '/suppliers': 'Suppliers',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { user } = useAuth();
  const { notifications, toggleSidebar } = useUI();
  const location = useLocation();
  const safeUser = user ?? { name: 'User', initials: 'US' };

  const currentPage = pageTitles[location.pathname] || 'BizManage';

  return (
    <header className="sticky top-0 z-30 bg-navy-950/80 backdrop-blur-xl border-b border-navy-500/30">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-700 text-text-muted"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <span className="text-text-muted">BizManage</span>
            <span className="text-text-muted">{'>'}</span>
            <span className="text-text-primary font-medium">{currentPage}</span>
          </nav>
        </div>

        {/* Right: search + notifications + user */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-navy-800 border border-navy-500/50 rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-muted w-32 lg:w-48"
              aria-label="Global search"
            />
          </div>

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-lg hover:bg-navy-700 text-text-muted transition-colors"
            aria-label={`Notifications (${notifications} unread)`}
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                {notifications}
              </span>
            )}
          </button>

          {/* User chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-navy-500/30">
            <div className="w-8 h-8 bg-accent-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-accent-blue">
              {safeUser.initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-text-primary">
              {safeUser.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
