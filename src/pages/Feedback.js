import React, { useState, useEffect } from 'react';
import { menuService, feedbackService } from '../services/api';
import { Star, MessageSquare, CheckCircle, AlertCircle, Utensils, Send } from 'lucide-react';

const Feedback = ({ user }) => {
  const [todayMenu, setTodayMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // ID of item being rated
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Feedback form states
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
      // Clear specific form
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
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={`transition-all duration-150 ${disabled ? 'cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= value 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-slate-200 fill-transparent'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] mx-auto mb-2">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">How was your meal?</h1>
        <p className="text-slate-500">Your feedback helps us improve the quality of cafeteria service.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center shadow-sm border animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white h-64 rounded-2xl border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : todayMenu.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 py-24 flex flex-col items-center justify-center text-center px-4">
          <Utensils className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium text-lg">No meals listed for today.</p>
          <p className="text-slate-400 text-sm mt-1">Feedback is only available for active menu items.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {todayMenu.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-5 h-full">
              <div className="md:col-span-2 relative h-48 md:h-auto">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                <div className="absolute bottom-4 left-4 text-white md:hidden">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#1e3a8a] px-2 py-0.5 rounded mr-2">{item.mealType}</span>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                </div>
              </div>
              
              <div className="md:col-span-3 p-6 flex flex-col justify-between">
                <div className="hidden md:block mb-4">
                  <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-1 block">{item.mealType}</span>
                  <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">Rate your experience</p>
                    <StarRating 
                      value={ratings[item.id] || 0} 
                      onChange={(val) => handleRatingChange(item.id, val)}
                      disabled={submitting === item.id}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Comments (Optional)</label>
                    <textarea
                      rows="2"
                      className="input-shadcn h-auto py-3 resize-none"
                      placeholder="Taste, portion size, service..."
                      value={comments[item.id] || ''}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      disabled={submitting === item.id}
                    ></textarea>
                  </div>

                  <button
                    onClick={() => handleSubmit(item.id)}
                    disabled={submitting === item.id}
                    className="w-full btn-primary h-11 flex items-center justify-center space-x-2"
                  >
                    {submitting === item.id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Feedback</span>
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
