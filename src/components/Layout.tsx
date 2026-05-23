import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';
import { logout } from '../lib/firebase';
import { LayoutDashboard, PlusCircle, BarChart3, BookOpen, Target, CreditCard, LogOut, Menu, X, ArrowLeft, HelpCircle, Settings, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/add', label: 'Add Entry', icon: PlusCircle },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
  { path: '/reflections', label: 'Reflections', icon: BookOpen },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/decisions', label: 'Decision Journal', icon: Compass },
  { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/guide', label: 'Guide', icon: HelpCircle },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isDashboard = location.pathname === '/';

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-stone-200 flex-col h-screen sticky top-0">
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-2">
            <Logo size={48} />
            <h1 className="text-xl font-black text-stone-900 tracking-tight leading-none">Finance<br />Shaastra</h1>
          </div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Financial Awareness</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all",
                location.pathname === item.path
                  ? "bg-stone-900 text-white shadow-lg shadow-stone-200"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-stone-100">
          <div className="flex items-center px-4 py-3 mb-4 bg-stone-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-sm font-black text-amber-700">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-stone-900 truncate">{profile?.displayName}</p>
              <p className="text-[10px] font-bold text-stone-400 truncate uppercase tracking-tighter">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-500 rounded-2xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Logo size={32} />
          <h1 className="text-lg font-black text-stone-900">Finance Shaastra</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-72 h-full p-8 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center space-x-4 mb-10">
              <Logo size={40} />
              <h1 className="text-xl font-black text-stone-900 leading-tight">Finance<br />Shaastra</h1>
            </div>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all",
                    location.pathname === item.path
                      ? "bg-stone-900 text-white shadow-lg"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-sm font-bold text-red-500 rounded-2xl hover:bg-red-50 transition-colors mt-auto"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-16 max-w-7xl mx-auto w-full">
        {!isDashboard && (
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        )}
        {children}
      </main>
    </div>
  );
};
