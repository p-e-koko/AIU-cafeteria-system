import React from 'react';

const Dashboard = () => (
  <div className="p-4">
    <h1 className="text-2xl font-semibold mb-4">Welcome to AIU Cafeteria System</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg mb-2">View Menu</h2>
        <p className="text-gray-600">Check today's and upcoming special dishes.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg mb-2">Submit Suggestion</h2>
        <p className="text-gray-600">Have a dish in mind? Let us know!</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg mb-2">Give Feedback</h2>
        <p className="text-gray-600">Rate your recent meal and help us improve.</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
