import React, { useState, useEffect } from 'react';
import { menuService, feedbackService } from '../services/api';
import { Star, MessageSquare, CheckCircle, AlertCircle, Utensils, Send } from 'lucide-react';

const Feedback = ({ user }) => {
  const [todayMenu, setTodayMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchTodayMenu();
  }, []);

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

  const handleRatingChange = (id, value) => {
    setRatings({ ...ratings, [id]: value });
  };

  const handleCommentChange = (id, value) => {
    setComments({ ...comments, [id]: value });
  };

  const handleSubmit = async (menuItemId) => {
    const rating = ratings[menuItemId];
    if (!rating) {
      setMessage({ type: 'error', text: 'Please select a star rating.' });
      return;
    }

    setSubmitting(menuItemId);
    setMessage({ type: '', text: '' });

    try {
      await feedbackService.submit({
        menuItemId,
        rating,
        comment: comments[menuItemId] || ''
      });
      setMessage({ type: 'success', text: 'Thank you! Your feedback has been recorded.' });
      setRatings({ ...ratings, [menuItemId]: 0 });
      setComments({ ...comments, [menuItemId]: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit feedback.' 
      });
    } finally {
      setSubmitting(null);
    }
  };

  const StarRating = ({ value, onChange, disabled }) => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`transition-all duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-125 active:scale-95'}`}
          >
            <Star
              className={`w-10 h-10 ${
                star <= value 
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                  : 'text-slate-200 dark:text-slate-800 fill-transparent'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col space-y-3 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/20 text-[#1e3a8a] dark:text-blue-400 mx-auto mb-2 shadow-inner">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">How was your meal?</h1>
        <p className="text-muted-foreground text-lg">Your feedback helps us improve the quality of cafeteria service.</p>
      </div>

      {message.text && (
        <div className={`p-5 rounded-2xl flex items-center shadow-sm border animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-6 h-6 mr-4" /> : <AlertCircle className="w-6 h-6 mr-4" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-card h-80 rounded-[2rem] border border-border animate-pulse"></div>
          ))}
        </div>
      ) : todayMenu.length === 0 ? (
        <div className="bg-accent/30 rounded-[2rem] border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-4">
          <Utensils className="w-16 h-16 text-muted-foreground/10 mb-6" />
          <p className="text-foreground font-black text-xl">No meals listed for today.</p>
          <p className="text-muted-foreground text-sm mt-2">Feedback is only available for active menu items.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {todayMenu.map((item) => (
            <div key={item.id} className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-5 h-full transition-all hover:shadow-xl hover:border-blue-500/20">
              <div className="md:col-span-2 relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden"></div>
                <div className="absolute bottom-6 left-6 text-white md:hidden">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#1e3a8a] px-3 py-1 rounded-lg mr-2 shadow-lg">{item.mealType}</span>
                  <h3 className="text-2xl font-black mt-2">{item.name}</h3>
                </div>
              </div>
              
              <div className="md:col-span-3 p-10 flex flex-col justify-between">
                <div className="hidden md:block mb-8">
                  <span className="text-[10px] font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-[0.2em] mb-2 block">{item.mealType}</span>
                  <h3 className="text-3xl font-black text-foreground tracking-tight">{item.name}</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-sm font-black text-foreground/80 uppercase tracking-widest mb-4">Rate your experience</p>
                    <StarRating 
                      value={ratings[item.id] || 0} 
                      onChange={(val) => handleRatingChange(item.id, val)}
                      disabled={submitting === item.id}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-foreground/80 uppercase tracking-widest mb-3 block">Tell us more</label>
                    <textarea
                      rows="3"
                      className="input-shadcn h-auto py-4 rounded-2xl resize-none"
                      placeholder="Taste, portion size, service..."
                      value={comments[item.id] || ''}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      disabled={submitting === item.id}
                    ></textarea>
                  </div>

                  <button
                    onClick={() => handleSubmit(item.id)}
                    disabled={submitting === item.id}
                    className="w-full btn-primary h-14 flex items-center justify-center space-x-3 text-lg"
                  >
                    {submitting === item.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
