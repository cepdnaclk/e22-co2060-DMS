import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../api';
import type { Notification } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { useToast } from '../../components/common/Toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    notificationsAPI.getAll()
      .then(r => setNotifications(r.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch {
      showToast('Failed to mark as read', 'error');
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.readStatus);
    await Promise.all(unread.map(n => notificationsAPI.markRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    showToast('All notifications marked as read', 'success');
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-400" /> Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="btn-secondary text-sm flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => !n.readStatus && markRead(n.id)}
                className={`card flex items-start gap-4 transition-all ${
                  !n.readStatus ? 'border-blue-500/20 bg-blue-500/5 cursor-pointer hover:bg-blue-500/10' : 'opacity-70'
                }`}>
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  n.readStatus ? 'bg-gray-600' : 'bg-blue-400 animate-pulse'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{n.title}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{n.message}</p>
                  {n.link && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(n.link as string);
                      }}
                      className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 mt-2 bg-transparent border-none cursor-pointer">
                      Open assignment <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <p className="text-xs text-gray-600 mt-1.5">
                    {n.createdAt ? format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a') : ''}
                  </p>
                </div>
                {!n.readStatus && (
                  <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">New</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <Bell className="w-14 h-14 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
            <p className="text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
