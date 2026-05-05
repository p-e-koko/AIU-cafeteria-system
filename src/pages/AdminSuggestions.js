import React, { useState, useEffect } from 'react';
import { suggestionService } from '../services/api';
import { Shield, CheckCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await suggestionService.getAll();
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setMessage({ type: 'error', text: 'Failed to load suggestions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActioning(id);
    setMessage({ type: '', text: '' });

    try {
      await suggestionService.updateStatus(id, status);
      setMessage({ type: 'success', text: `Suggestion has been ${status.toLowerCase()}.` });
      fetchSuggestions();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update status.' 
      });
    } finally {
      setActioning(null);
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'Pending');
  const otherSuggestions = suggestions.filter(s => s.status !== 'Pending');

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
        <div>
          <div className="flex items-center space-x-2 text-[#1e3a8a] dark:text-blue-400 mb-3">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Admin Portal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter">Review Queue</h1>
          <p className="text-muted-foreground mt-3 text-lg">Manage incoming menu suggestions from the community.</p>
        </div>
        <div className="flex items-center bg-accent/50 rounded-full px-5 py-2.5 border border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse mr-3"></div>
          <span className="text-sm font-black text-foreground uppercase tracking-widest">{pendingSuggestions.length} Pending</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-5 rounded-2xl flex items-center shadow-sm border animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-6 h-6 mr-4" /> : <AlertCircle className="w-6 h-6 mr-4" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {/* Pending Section */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-black text-foreground">Awaiting Decision</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="bg-card h-64 rounded-3xl border border-border animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : pendingSuggestions.length === 0 ? (
          <div className="bg-accent/20 rounded-[2rem] border border-dashed border-border py-24 flex flex-col items-center justify-center">
            <CheckCircle className="w-16 h-16 text-muted-foreground/10 mb-6" />
            <p className="text-foreground font-black text-xl">All caught up!</p>
            <p className="text-muted-foreground text-sm">No pending suggestions at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pendingSuggestions.map((s) => (
              <div key={s.id} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all duration-300">
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-[10px] font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-[0.2em] mb-2 block">{s.mealType}</span>
                      <h3 className="text-2xl font-black text-foreground group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors">{s.dishName}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-muted-foreground shadow-inner">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 text-sm leading-relaxed mb-8 bg-accent/30 p-5 rounded-2xl italic border border-border/50">
                    "{s.description}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-black shadow-lg">
                        {s.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="text-xs">
                        <p className="font-black text-foreground uppercase tracking-wider">{s.user?.name}</p>
                        <p className="text-muted-foreground/60 font-medium">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/30 p-5 flex border-t border-border gap-4">
                  <button
                    onClick={() => handleStatusUpdate(s.id, 'Approved')}
                    disabled={actioning === s.id}
                    className="flex-1 h-12 bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 dark:hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(s.id, 'Rejected')}
                    disabled={actioning === s.id}
                    className="flex-1 h-12 bg-card text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      {otherSuggestions.length > 0 && (
        <section className="pt-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-foreground">Decision History</h2>
            <button className="text-sm font-black text-[#1e3a8a] dark:text-blue-400 hover:underline flex items-center uppercase tracking-widest">
              View All Logs <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-accent/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Proposed Dish</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Suggested By</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Final Status</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Review Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {otherSuggestions.map((s) => (
                    <tr key={s.id} className="hover:bg-accent/20 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-black text-foreground">{s.dishName}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.mealType}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-lg bg-accent text-muted-foreground flex items-center justify-center text-[10px] font-black shadow-inner">
                            {s.user?.name?.charAt(0)}
                          </div>
                          <span className="text-sm text-foreground/80 font-bold">{s.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          s.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-xs text-muted-foreground/60 font-black tracking-tighter">
                        {new Date(s.updatedAt || s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminSuggestions;
