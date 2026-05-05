import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Send, MessageSquare, ArrowRight, Star, Clock, Info, ShieldCheck } from 'lucide-react';
import { menuService } from '../services/api';

const Dashboard = ({ user }) => {
  const [todayMenu, setTodayMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayMenu = async () => {
      try {
        const response = await menuService.getAll();
        const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
        const filtered = response.data.filter(item => item.dayOfWeek === today);
        setTodayMenu(filtered);
      } catch (error) {
        console.error('Failed to fetch today\'s menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayMenu();
  }, []);

  const lunchItem = todayMenu.find(item => item.mealType === 'Lunch') || todayMenu[0];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#1e3a8a] dark:bg-blue-900 p-6 md:p-12 text-white shadow-2xl shadow-blue-900/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-blue-400/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" />
            <span>Official Campus Portal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Hello, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-100/80 text-base md:text-xl leading-relaxed mb-8">
            Welcome back to the AIU Cafeteria. We're serving something special today. Check out the menu and share your thoughts!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/menu" className="bg-white text-[#1e3a8a] px-8 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center group shadow-lg">
              View Today's Menu
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl"></div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Column */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black text-foreground flex items-center">
            <span className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-[#1e3a8a] dark:text-blue-400 rounded-lg flex items-center justify-center mr-3">
              <Utensils className="w-4 h-4" />
            </span>
            Quick Access
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/suggestions" className="group bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">New Suggestion</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">Have a specific dish in mind? Propose it to our chefs and see it on the menu.</p>
              <span className="text-[#1e3a8a] dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center group-hover:translate-x-2 transition-transform">
                Propose a dish <ArrowRight className="ml-2 w-3 h-3" />
              </span>
            </Link>

            <Link to="/feedback" className="group bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Rate Your Meal</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">Help us maintain high quality standards by rating your recent dining experience.</p>
              <span className="text-[#1e3a8a] dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center group-hover:translate-x-2 transition-transform">
                Give feedback <ArrowRight className="ml-2 w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Featured Meal Card */}
          {!loading && lunchItem && (
            <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden flex flex-col md:flex-row group hover:border-blue-500/20 transition-all">
              <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                <img 
                  src={lunchItem.imageUrl} 
                  alt={lunchItem.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="md:w-3/5 p-8 flex flex-col justify-center">
                <div className="flex items-center text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">
                  <Star className="w-3 h-3 mr-1 fill-amber-500" />
                  Today's Featured {lunchItem.mealType}
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">{lunchItem.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">"{lunchItem.description}"</p>
                <Link to="/menu" className="text-[#1e3a8a] dark:text-blue-400 text-sm font-bold flex items-center hover:underline">
                  View Full Menu <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column: Stats/Info */}
        <div className="space-y-8">
          <div className="bg-slate-950 dark:bg-black rounded-3xl p-8 text-white shadow-xl border border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-3 text-blue-400" />
              Cafeteria Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-slate-400 text-sm">Main Hall</span>
                <span className="text-emerald-400 font-bold text-sm">Open Now</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-slate-400 text-sm">Peak Hours</span>
                <span className="text-slate-300 font-bold text-sm">12:00 - 13:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Wait Time</span>
                <span className="text-slate-300 font-bold text-sm">~10 mins</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-8">
            <div className="w-10 h-10 bg-white dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <Info className="text-[#1e3a8a] dark:text-blue-400 w-5 h-5" />
            </div>
            <h3 className="text-[#1e3a8a] dark:text-blue-400 font-bold text-lg mb-2">Sustainable Campus</h3>
            <p className="text-blue-700/70 dark:text-blue-300/60 text-sm leading-relaxed">
              We are committed to reducing food waste. Did you know 80% of our ingredients are sourced from local farms?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
