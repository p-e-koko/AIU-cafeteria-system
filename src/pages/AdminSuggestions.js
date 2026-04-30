import React, { useState, useEffect } from 'react';
import { suggestionService } from '../services/api';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle, User, Mail } from 'lucide-react';

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null); // ID of suggestion being updated
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
      setMessage({ type: 'success', text: `Suggestion ${status.toLowerCase()} successfully!` });
      fetchSuggestions(); // Refresh list
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Suggestion Review</h1>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg font-medium flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {pendingSuggestions.length} Pending
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center mb-6 shadow-sm border ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* Pending Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-yellow-500" />
          Pending Review
        </h2>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">Loading...</div>
        ) : pendingSuggestions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
            No pending suggestions to review.
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingSuggestions.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-blue-300 transition-colors">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{s.dishName}</h3>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded uppercase">
                          {s.mealType}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{s.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1.5" />
                          {s.user?.name}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1.5" />
                          {s.user?.email}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleStatusUpdate(s.id, 'Approved')}
                        disabled={actioning === s.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(s.id, 'Rejected')}
                        disabled={actioning === s.id}
                        className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      {otherSuggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Review History</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dish</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {otherSuggestions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{s.dishName}</div>
                      <div className="text-xs text-gray-500">{s.mealType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{s.user?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
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
