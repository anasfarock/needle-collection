import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Settings, LogOut, Menu, ChevronRight } from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: FileText, label: 'Content', path: '/admin/content' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function AdminLayout() {
  const { isAdmin, authLoading, adminUser, logoutAdmin } = useStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-stone text-xs uppercase tracking-[0.2em]">Loading Admin Portal...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const initials = (adminUser?.name || 'Admin User')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-ivory transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/admin" className="font-display text-xl tracking-[0.15em] uppercase">
              Needle Collection
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/50 mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3">
            {sidebarItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 mb-1 text-sm transition-colors ${
                    isActive ? 'bg-oxblood text-ivory' : 'text-ivory/70 hover:text-ivory hover:bg-white/5'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span className="tracking-wide">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-oxblood rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate">{adminUser?.name || 'Admin User'}</p>
                <p className="text-[10px] text-ivory/50 truncate">{adminUser?.email || 'Owner'}</p>
              </div>
            </div>
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-2 text-sm text-ivory/50 hover:text-ivory transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-ivory border-b border-hairline flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink">
              <Menu size={22} />
            </button>
            <div className="text-sm text-stone">
              {sidebarItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[11px] uppercase tracking-[0.15em] text-stone hover:text-oxblood transition-colors">
              View Store →
            </Link>
            <Link to="/admin/settings" className="w-8 h-8 bg-parchment rounded-full flex items-center justify-center hover:bg-oxblood hover:text-ivory transition-colors" title={adminUser?.email}>
              <span className="text-xs font-medium">{initials[0] || 'A'}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
