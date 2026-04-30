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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-[#1e3a8a] mb-2">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Admin Portal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Review Queue</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage incoming menu suggestions from the community.</p>
        </div>
        <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2"></div>
          <span className="text-sm font-bold text-slate-700">{pendingSuggestions.length} Pending Actions</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center shadow-sm border animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Pending Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900">Awaiting Decision</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white h-48 rounded-2xl border border-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : pendingSuggestions.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center justify-center">
            <CheckCircle className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm">No pending suggestions at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingSuggestions.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-[#1e3a8a] transition-all duration-300">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-1 block">{s.mealType}</span>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1e3a8a] transition-colors">{s.dishName}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-lg italic">
                    "{s.description}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-3 text-slate-500">
                      <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold">
                        {s.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{s.user?.name}</p>
                        <p className="text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 flex border-t border-slate-100 gap-3">
                  <button
                    onClick={() => handleStatusUpdate(s.id, 'Approved')}
                    disabled={actioning === s.id}
                    className="flex-1 h-10 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(s.id, 'Rejected')}
                    disabled={actioning === s.id}
                    className="flex-1 h-10 bg-white text-rose-600 border border-rose-200 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition disabled:opacity-50 flex items-center justify-center"
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
        <section className="pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Decision History</h2>
            <button className="text-sm font-bold text-[#1e3a8a] hover:underline flex items-center">
              View All Logs <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Dish</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested By</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {otherSuggestions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{s.dishName}</div>
                      <div className="text-xs text-slate-400">{s.mealType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[8px] font-bold">
                          {s.user?.name?.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{s.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                      {new Date(s.updatedAt || s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminSuggestions;
