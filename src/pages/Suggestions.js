import React, { useState, useEffect } from 'react';
import { suggestionService } from '../services/api';
import { Utensils, Send, CheckCircle, AlertCircle, Clock, Search, Filter } from 'lucide-react';

const Suggestions = ({ user }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    dishName: '',
    mealType: 'Lunch',
    description: ''
  });

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await suggestionService.getAll();
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await suggestionService.submit(formData);
      setMessage({ type: 'success', text: 'Your suggestion has been received!' });
      setFormData({ dishName: '', mealType: 'Lunch', description: '' });
      fetchSuggestions();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
      Approved: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
      Rejected: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Menu Suggestions</h1>
        <p className="text-muted-foreground">Help us improve your dining experience by suggesting new dishes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-6 flex items-center text-foreground">
              <Send className="w-4 h-4 mr-2 text-[#1e3a8a] dark:text-blue-400" />
              New Suggestion
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Dish Name</label>
                <input
                  type="text"
                  required
                  className="input-shadcn"
                  placeholder="e.g., Tom Yum Pasta"
                  value={formData.dishName}
                  onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Meal Category</label>
                <select
                  className="input-shadcn"
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground/80">Why suggest this?</label>
                <textarea
                  required
                  rows="4"
                  className="input-shadcn h-auto py-3"
                  placeholder="Describe the dish..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              {message.text && (
                <div className={`p-3 rounded-xl text-sm flex items-start animate-in slide-in-from-top-1 ${
                  message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2 mt-0.5" /> : <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary flex items-center justify-center space-x-2 h-11"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <span>Submit to Admin</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-foreground">Community Suggestions</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border bg-card shadow-sm">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border bg-card shadow-sm">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border shadow-inner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] dark:border-blue-400 mb-4"></div>
              <p className="text-muted-foreground text-sm">Refreshing menu ideas...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border">
              <Utensils className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-foreground font-bold">No suggestions yet</p>
              <p className="text-muted-foreground text-sm">Be the first to propose a new meal!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s, index) => (
                <div 
                  key={s.id} 
                  className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-bold text-foreground leading-tight">{s.dishName}</h3>
                        {getStatusBadge(s.status)}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground space-x-2">
                        <span className="bg-accent px-1.5 py-0.5 rounded text-foreground font-black uppercase tracking-tighter text-[9px]">{s.mealType}</span>
                        <span>•</span>
                        <span>By {s.user?.name || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">{s.description}</p>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground/60 uppercase tracking-widest font-black">
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default Suggestions;
