import React, { useState, useEffect } from 'react';
import { suggestionService } from '../services/api';
import { Utensils, Send, CheckCircle, AlertCircle, Clock, Check, X } from 'lucide-react';

const Suggestions = ({ user }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
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
      setMessage({ type: 'success', text: 'Suggestion submitted successfully!' });
      setFormData({ dishName: '', mealType: 'Lunch', description: '' });
      fetchSuggestions(); // Refresh list
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit suggestion. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    
    const icons = {
      Pending: <Clock className="w-3 h-3 mr-1" />,
      Approved: <Check className="w-3 h-3 mr-1" />,
      Rejected: <X className="w-3 h-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Utensils className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Menu Suggestions</h1>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-blue-500" />
            Suggest a New Dish
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Spicy Basil Chicken"
                  value={formData.dishName}
                  onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Description</label>
              <textarea
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Why should this be added to the menu?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg flex items-center ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </form>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-gray-600" />
          Recent Suggestions
        </h2>

        {loading ? (
          <div className="text-center py-8">Loading suggestions...</div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No suggestions yet. Be the first to suggest something!
          </div>
        ) : (
          <div className="grid gap-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{s.dishName}</h3>
                    <p className="text-sm text-gray-500">{s.mealType} • Suggested by {s.user?.name || 'User'}</p>
                  </div>
                  {getStatusBadge(s.status)}
                </div>
                <p className="text-gray-700 mt-2">{s.description}</p>
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
