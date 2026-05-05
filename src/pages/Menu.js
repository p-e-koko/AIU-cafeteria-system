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
    <div className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1494859814609-3fbd77c95bc1?q=80&w=2070&auto=format&fit=crop'} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[#1e3a8a] dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            {item.mealType}
          </span>
        </div>
      </div>
      <div className="p-5 md:p-8">
        <h3 className="text-2xl font-black text-foreground mb-2 group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors">{item.name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">{item.description}</p>
        
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button className="flex items-center text-xs font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-widest hover:underline">
            Nutritional Info <Info className="w-3 h-3 ml-1" />
          </button>
          <a href="/feedback" className="flex items-center text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors">
            Rate Meal <ArrowRight className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
        <div>
          <div className="flex items-center space-x-2 text-[#1e3a8a] dark:text-blue-400 mb-3">
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Weekly Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter">Cafeteria Menu</h1>
          <p className="text-muted-foreground mt-3 text-lg">Fresh, healthy, and delicious meals served daily.</p>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 shrink-0 border ${
              activeDay === day 
                ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700 shadow-xl shadow-blue-900/20' 
                : 'bg-card text-muted-foreground border-border hover:border-blue-500/30 hover:bg-accent'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card h-96 rounded-[2rem] border border-border animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="bg-accent/30 rounded-[2rem] border border-dashed border-border py-24 flex flex-col items-center justify-center">
          <Utensils className="w-16 h-16 text-muted-foreground/20 mb-6" />
          <p className="text-foreground font-black text-xl">No menu available for {activeDay}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredMenu.map(item => (
            <MealCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-[#1e3a8a] dark:bg-blue-950 rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-xl text-white text-center md:text-left">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-white/20">
          <Info className="text-white w-8 h-8" />
        </div>
        <div>
          <h4 className="text-2xl font-black mb-1">Standard Serving Times</h4>
          <p className="text-blue-100/70 font-medium">Breakfast: 07:00 - 09:00 | Lunch: 11:30 - 13:30 | Dinner: 17:30 - 19:30</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
