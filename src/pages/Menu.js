import React, { useState, useEffect } from 'react';
import { menuService } from '../services/api';
import { Calendar, Utensils, Info, ArrowRight } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Menu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Monday');


  useEffect(() => {
    fetchMenu();
    // Set active day to today
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    if (days.includes(today)) {
      setActiveDay(today);
    }
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuService.getAll();
      setMenu(response.data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = menu.filter(item => item.dayOfWeek === activeDay);

  const MealCard = ({ item }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1494859814609-3fbd77c95bc1?q=80&w=2070&auto=format&fit=crop'} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1e3a8a] text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            {item.mealType}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1e3a8a] transition-colors">{item.name}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{item.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <button className="flex items-center text-xs font-bold text-[#1e3a8a] uppercase tracking-wider hover:underline">
            Nutritional Info <Info className="w-3 h-3 ml-1" />
          </button>
          <a href="/feedback" className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-[#1e3a8a] transition-colors">
            Rate Meal <ArrowRight className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-[#1e3a8a] mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Weekly Schedule</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Cafeteria Menu</h1>
          <p className="text-slate-500 mt-2 text-lg">Fresh, healthy, and delicious meals served daily.</p>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shrink-0 border ${
              activeDay === day 
                ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-lg shadow-blue-900/20' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white h-80 rounded-2xl border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 py-24 flex flex-col items-center justify-center">
          <Utensils className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No menu available for {activeDay}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map(item => (
            <MealCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <Info className="text-[#1e3a8a] w-6 h-6" />
        </div>
        <div>
          <h4 className="text-[#1e3a8a] font-bold">Standard Serving Times</h4>
          <p className="text-blue-700/70 text-sm">Breakfast: 07:00 - 09:00 | Lunch: 11:30 - 13:30 | Dinner: 17:30 - 19:30</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
