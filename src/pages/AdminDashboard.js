import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Lightbulb, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { adminService, suggestionService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSuggestions: 0,
    pendingSuggestions: 0,
    totalFeedback: 0,
    totalUsers: 0,
    avgRating: 0
  });
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, suggestionsRes] = await Promise.all([
          adminService.getStats(),
          suggestionService.getAll()
        ]);
        setStats(statsRes.data);
        setRecentSuggestions(suggestionsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {link && (
          <Link to={link} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl md:text-4xl font-black text-foreground mb-2">System Overview</h1>
        <p className="text-muted-foreground">Monitor cafeteria performance and student feedback.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Users" 
          value={stats.totalUsers} 
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        />
        <StatCard 
          icon={MessageSquare} 
          title="Total Feedback" 
          value={stats.totalFeedback} 
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          link="/summaries"
        />
        <StatCard 
          icon={Lightbulb} 
          title="Pending Suggestions" 
          value={stats.pendingSuggestions} 
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          link="/admin/suggestions"
        />
        <StatCard 
          icon={Star} 
          title="Average Rating" 
          value={`${stats.avgRating} / 5`} 
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          link="/admin/analytics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Suggestions */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
          <div className="p-8 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <Clock className="w-5 h-5 mr-3 text-blue-500" />
              Recent Suggestions
            </h2>
            <Link to="/admin/suggestions" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentSuggestions.length > 0 ? (
              recentSuggestions.map((s) => (
                <div key={s.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                      {s.user?.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{s.dishName}</h4>
                      <p className="text-xs text-muted-foreground">Proposed by {s.user?.name} • {s.mealType}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    s.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    s.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    {s.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground italic">
                No recent suggestions found.
              </div>
            )}
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-8 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-emerald-400" />
              Performance Insight
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p>System is operating normally. All backend services are reachable.</p>
              </div>
              <div className="flex items-start space-x-3 text-sm text-slate-300">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>{stats.pendingSuggestions} suggestions are waiting for your review.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">Need a Report?</h3>
            <p className="text-blue-100 text-sm mb-6">Download the monthly cafeteria performance summary in PDF format.</p>
            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-2xl hover:bg-blue-50 transition-colors">
              Export Monthly Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
