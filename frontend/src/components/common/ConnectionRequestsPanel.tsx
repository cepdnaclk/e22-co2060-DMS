import { useState, useEffect } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { connectionsAPI } from '../../api';
import type { Connection } from '../../types';
import { toAbsoluteAvatarUrl } from '../../utils/avatarUrl';
import { Link } from 'react-router-dom';

export default function ConnectionRequestsPanel() {
  const [requests, setRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await connectionsAPI.getPendingRequests();
        setRequests(data);
      } catch (e) {
        console.error('Failed to load connection requests:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await connectionsAPI.acceptRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeny = async (id: number) => {
    try {
      await connectionsAPI.rejectRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return null; // Or a skeleton
  if (requests.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-blue-400" />
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connection Requests</h3>
        <span className="badge badge-active ml-auto">{requests.length}</span>
      </div>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
            <Link to={`/profile/${req.requester.id}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                {req.requester.profilePictureUrl ? (
                  <img src={toAbsoluteAvatarUrl(req.requester.profilePictureUrl)} alt={req.requester.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{req.requester.fullName[0]?.toUpperCase()}</span>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${req.requester.id}`} className="hover:underline">
                <p className="text-sm font-semibold text-gray-200 truncate">{req.requester.fullName}</p>
              </Link>
              <p className="text-xs text-gray-500 capitalize">{req.requester.role.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleApprove(req.id)} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors" title="Approve">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeny(req.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors" title="Deny">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
