import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, MessageSquare, ClipboardList, LogOut, Shield, ChevronRight, Calendar, Sun, Moon } from 'lucide-react';

const Navbar = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-card border-b border-border fixed w-full z-30 top-0 transition-colors duration-300">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center shadow-md">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">AIU Cafeteria</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <div className="flex items-center space-x-3 pl-3 border-l border-border ml-2">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-black text-muted-foreground">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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

const Sidebar = ({ user }) => {
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
    <aside className="fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-all bg-card border-r border-border" aria-label="Sidebar">
      <div className="relative flex flex-col flex-1 min-h-0 pt-0">
        <div className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1e3a8a] dark:text-blue-400' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <span className={`transition duration-75 ${isActive ? 'text-[#1e3a8a] dark:text-blue-400' : 'text-slate-400 group-hover:text-foreground'}`}>
                        {item.icon}
                      </span>
                      <span className="ml-3 flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
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
              <div className="w-9 h-9 rounded-xl bg-[#1e3a8a] flex items-center justify-center text-white font-black text-xs shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export { Navbar, Sidebar };
