import React, { useState } from 'react';

interface MaintenanceRequest {
  id: number;
  residentName: string;
  unit: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  managerAnswer?: string;
}

export const ManagerMaintenance: React.FC = () => {
  // Simulating data isolated to this manager's village scope (e.g., Papakura area)
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    { id: 201, residentName: 'Sarah Jenkins', unit: 'Villa 14', title: 'Hot water cylinder leak', description: 'Small pool of water forming under cupboard.', status: 'Pending' }
  ]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleActionRequest = (id: number) => {
    const responseText = answers[id] || "Plumber dispatched. Issue resolved.";
    
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'Completed', managerAnswer: responseText } : req
    ));
    
    // In your finished logic, you will make a C# PUT request here:
    // axios.put(`/api/maintenance/${id}/resolve`, { answer: responseText });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Village Maintenance Queue</h1>
        <p className="text-gray-500 text-sm mt-1">Review, authorize, and resolve privacy-compliant tickets registered within your local village boundary.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-100">
              <th className="p-4">Resident / Address</th>
              <th className="p-4">Issue Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Resolution Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/40 transition">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{req.residentName}</div>
                  <div className="text-xs text-gray-400">{req.unit}</div>
                </td>
                <td className="p-4 max-w-sm">
                  <div className="font-medium text-gray-800">{req.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{req.description}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                    req.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4">
                  {req.status === 'Pending' ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text"
                        placeholder="Type solution notes..."
                        value={answers[req.id] || ''}
                        onChange={e => setAnswers({ ...answers, [req.id]: e.target.value })}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-48 transition"
                      />
                      <button 
                        onClick={() => handleActionRequest(req.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-1.5 px-3 rounded-xl transition shadow-sm"
                      >
                        Complete Task
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic max-w-xs bg-gray-50 border p-2 rounded-lg">
                      Signed off: "{req.managerAnswer}"
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};