import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, ChevronDown, ChevronUp, User, Utensils } from 'lucide-react';
import { feedbackService } from '../services/api';

const Summaries = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await feedbackService.getAll();
        setFeedbackList(response.data);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Group feedback by menu item
  const groupedFeedback = feedbackList.reduce((acc, item) => {
    const key = item.menuItemId;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: item.menuItem?.name || 'Unknown Item',
        mealType: item.menuItem?.mealType,
        dayOfWeek: item.menuItem?.dayOfWeek,
        feedbacks: [],
        totalRating: 0,
      };
    }
    acc[key].feedbacks.push(item);
    acc[key].totalRating += item.rating;
    return acc;
  }, {});

  const summaryData = Object.values(groupedFeedback).map(item => ({
    ...item,
    avgRating: (item.totalRating / item.feedbacks.length).toFixed(1),
  })).sort((a, b) => b.feedbacks.length - a.feedbacks.length);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Feedback Summaries...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-4xl font-black text-foreground mb-2">Feedback Summaries</h1>
        <p className="text-muted-foreground">Aggregated ratings and comments for each menu item.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {summaryData.length > 0 ? (
          summaryData.map((item) => (
            <div 
              key={item.id} 
              className={`bg-card rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                expandedItem === item.id ? 'border-blue-500/50 shadow-xl ring-1 ring-blue-500/20' : 'border-border shadow-sm hover:border-blue-500/30'
              }`}
            >
              <div 
                className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Utensils className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground mb-1">{item.name}</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center bg-muted px-2 py-1 rounded-md">
                        <Calendar className="w-3 h-3 mr-1" /> {item.dayOfWeek}
                      </span>
                      <span className="flex items-center bg-muted px-2 py-1 rounded-md">
                        {item.mealType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="flex items-center text-amber-500 font-black text-2xl">
                      {item.avgRating}
                      <Star className="w-5 h-5 ml-1 fill-amber-500" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Avg Rating</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-black text-2xl">
                      {item.feedbacks.length}
                      <MessageSquare className="w-5 h-5 ml-2" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total Reviews</p>
                  </div>

                  <div className={`p-2 rounded-full bg-muted transition-transform duration-300 ${expandedItem === item.id ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {expandedItem === item.id && (
                <div className="px-8 pb-8 animate-in slide-in-from-top duration-300">
                  <div className="h-px bg-border mb-8" />
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Detailed Feedback</h4>
                    {item.feedbacks.map((fb, idx) => (
                      <div key={idx} className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-border">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="font-bold text-sm">{fb.user?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed italic">"{fb.comment || 'No comment provided.'}"</p>
                        <p className="text-[10px] text-muted-foreground mt-4 uppercase font-bold tracking-widest">
                          {new Date(fb.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-card p-20 rounded-[2rem] border border-border border-dashed text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-foreground">No feedback yet</h3>
            <p className="text-muted-foreground mt-2">Aggregated data will appear once students start rating meals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summaries;
