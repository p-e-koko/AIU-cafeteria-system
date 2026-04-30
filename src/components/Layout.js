import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, MessageSquare, ClipboardList, LogOut, Shield, ChevronRight } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 fixed w-full z-30 top-0">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#1e3a8a] rounded flex items-center justify-center">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">AIU Cafeteria</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
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
    <aside className="fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width" aria-label="Sidebar">
      <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-slate-200">
        <div className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1 bg-white">
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-50 text-[#1e3a8a]' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={`transition duration-75 ${isActive ? 'text-[#1e3a8a]' : 'text-slate-400 group-hover:text-slate-900'}`}>
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
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-8 h-8 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export { Navbar, Sidebar };
