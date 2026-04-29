import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Utensils, MessageSquare, ClipboardList, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex ml-2 md:mr-24 font-bold text-xl text-blue-600">
              AIU Cafeteria
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="flex items-center text-gray-600 hover:text-blue-600">
              <LogIn className="w-5 h-5 mr-1" />
              <span>Login</span>
            </Link>
            <Link to="/register" className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
              <UserPlus className="w-5 h-5 mr-1" />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Menu Suggestions', path: '/suggestions' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Feedback', path: '/feedback' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Summaries', path: '/summaries' },
  ];

  return (
    <aside className="fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width" aria-label="Sidebar">
      <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200">
            <ul className="pb-2 space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group"
                  >
                    <span className="text-gray-500 transition duration-75 group-hover:text-gray-900">
                      {item.icon}
                    </span>
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
};

export { Navbar, Sidebar };
