import React, { useState, useEffect } from 'react';
import Navbar from './navbar'
interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  managerAnswer?: string;
}

export const ResidentMaintenance: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In production, fetch current resident's request history here
  useEffect(() => {
    // axios.get('/api/maintenance/my-requests').then(res => setRequests(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);

    // Mock API post request response
    const mockNewRequest: MaintenanceRequest = {
      id: Date.now(),
      title,
      description,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setRequests([mockNewRequest, ...requests]);
      setTitle('');
      setDescription('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <>
      <Navbar userType="resident" />
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Portal</h1>
        <p className="text-gray-500 text-sm mt-1">Log internal or external property issues. Your logs are kept strictly private with your Village Manager.</p>
      </div>

      {/* Top Form Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Report a New Issue</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Issue Item / Location</label>
            <input 
              type="text" 
              placeholder="e.g., Broken heat pump in lounge" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Detailed Description</label>
            <input 
              type="text" 
              placeholder="Provide context, timeline, or urgency levels..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm transition duration-200 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit to Manager'}
          </button>
        </form>
      </div>

      {/* Bottom Tracking History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base font-semibold text-gray-800">Your Maintenance Log History</h2>
        </div>
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No requests logged yet. Use the form above to submit an issue.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-100">
                  <th className="p-4">Date Filed</th>
                  <th className="p-4">Issue Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Manager Resolution Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString('en-NZ')}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{req.title}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{req.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        req.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {req.managerAnswer ? (
                        <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl text-xs text-gray-700 font-medium">
                          💡 "{req.managerAnswer}"
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Awaiting site inspection</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  );
};