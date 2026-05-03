import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Info } from 'lucide-react';
import { adminService } from '../services/api';

const Analytics = () => {
  const [ratingData, setRatingData] = useState([]);
  const [suggestionData, setSuggestionData] = useState({ byStatus: [], byMealType: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ratingsRes, suggestionsRes] = await Promise.all([
          adminService.getRatingsAnalytics(),
          adminService.getSuggestionsAnalytics()
        ]);
        
        // Process rating data for Bar Chart
        const formattedRatings = ratingsRes.data.map(item => ({
          name: item.menuItem.name,
          rating: parseFloat(parseFloat(item.averageRating).toFixed(1)),
          count: item.feedbackCount
        })).slice(0, 8); // Top 8 items

        setRatingData(formattedRatings);
        setSuggestionData(suggestionsRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">Analytics & Trends</h1>
          <p className="text-muted-foreground">Visualizing cafeteria data to drive improvements.</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-xl">
          <div className="px-4 py-2 bg-background rounded-lg shadow-sm text-sm font-bold text-blue-600">All Time</div>
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground">Last 30 Days</div>
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground">Last 7 Days</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rating Bar Chart */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center">
              <BarChart3 className="w-5 h-5 mr-3 text-blue-500" />
              Top Rated Dishes
            </h3>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Average Rating</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  domain={[0, 5]}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="rating" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Suggestion Pie Chart */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center">
              <PieIcon className="w-5 h-5 mr-3 text-emerald-500" />
              Suggestions Status
            </h3>
          </div>
          <div className="h-[350px] w-full flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={suggestionData.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {suggestionData.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '1rem'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meal Type Distribution */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-purple-500" />
              Popular Meal Types for Suggestions
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestionData.byMealType.map((item, index) => (
              <div key={item.mealType} className="p-6 rounded-3xl bg-muted/30 border border-border flex flex-col items-center justify-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white font-black`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  {item.count}
                </div>
                <h4 className="font-bold text-foreground">{item.mealType}</h4>
                <p className="text-xs text-muted-foreground mt-1">Total Proprosals</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[2rem] p-8 flex items-start space-x-6">
        <div className="bg-white dark:bg-blue-900/20 p-3 rounded-2xl shadow-sm">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="text-blue-900 dark:text-blue-300 font-bold mb-2">How to use this data?</h4>
          <p className="text-blue-800/70 dark:text-blue-400/70 text-sm leading-relaxed">
            These metrics help cafeteria managers understand student preferences. For example, if "Mediterranean Chicken Bowl" consistently receives low ratings, it may be time to update the recipe or ingredient sourcing. High volumes of "Pending" suggestions indicate students are active and looking for variety.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
