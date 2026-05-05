import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, MessageSquare, ClipboardList, LogOut, Shield, ChevronRight, Calendar, Sun, Moon, Bell, Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout, isDarkMode, toggleDarkMode, onMenuOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-card/80 backdrop-blur-xl border-b border-border fixed w-full z-30 top-0 transition-all duration-300 shadow-sm">
      <div className="px-4 py-3 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={onMenuOpen}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform shrink-0">
                <Utensils className="text-white w-6 h-6" />
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center bg-accent/50 rounded-full px-4 py-1.5 border border-border mr-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">System Active</span>
            </div>

            <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-card"></span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 border border-transparent hover:border-border"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
            </button>

            {user && (
              <div className="flex items-center space-x-3 pl-4 border-l border-border ml-2">
                <div className="hidden lg:flex flex-col items-end mr-1">
                  <span className="text-sm font-black text-foreground tracking-tight">{user.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-black text-[#1e3a8a] dark:text-blue-400 opacity-70">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();

  const baseMenuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Daily Menu', path: '/menu' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Menu Suggestions', path: '/suggestions' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Feedback', path: '/feedback' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Summaries', path: '/summaries' },
  ];

  const adminMenuItems = [
    { icon: <Shield className="w-5 h-5" />, label: 'Admin Dashboard', path: '/admin/dashboard' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Suggestion Review', path: '/admin/suggestions' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Analytics', path: '/admin/analytics' },
  ];

  const menuItems = user?.role === 'Admin' ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 flex flex-col flex-shrink-0 w-64 h-full font-normal duration-300 transition-transform bg-white dark:bg-[#0f172a] border-r border-border shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
        aria-label="Sidebar"
      >
          {/* Logo header — fills the same height as the navbar */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
            <Link to="/" className="flex items-center space-x-3" onClick={onClose}>
              <img src="/logo.png" alt="AIU Logo" className="h-10 w-auto object-contain" />
            </Link>
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-all"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col flex-1 pb-4 overflow-y-auto mt-4">
            <div className="flex-1 px-4 space-y-1">
              <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 opacity-50">Navigation</p>
              <ul className="space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center px-4 py-3 text-sm font-black rounded-xl transition-all duration-300 group ${
                          isActive
                            ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20 translate-x-1'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-foreground'}`}>
                          {item.icon}
                        </span>
                        <span className="ml-3 flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4 opacity-70 animate-in slide-in-from-left-2" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {user && (
            <div className="p-4 border-t border-border bg-accent/30">
              <div className="flex items-center space-x-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/20">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground truncate leading-tight">{user.name}</p>
                  <p className="text-[9px] text-[#1e3a8a] dark:text-blue-400 truncate uppercase tracking-widest font-black opacity-80">{user.role}</p>
                </div>
              </div>
            </div>
          )}
      </aside>
    </>
  );
};

export { Navbar, Sidebar };
