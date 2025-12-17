import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NotificationList() {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!user) return;
        const fetchNotes = () => {
            fetch(`${API_URL}/api/auth/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setNotifications(data))
                .catch(console.error);
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 3000);
        return () => clearInterval(interval);
    }, [user, token]);

    if (!user || notifications.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 w-80 max-w-[90vw]">
            {notifications.map(n => (
                <div key={n._id} className="card p-4 mb-2 border-l-4 border-blue-500 animate-[slideIn_0.3s_ease-out]">
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <button
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => {
                            fetch(`${API_URL}/api/auth/notifications/${n._id}/read`, {
                                method: 'PUT',
                                headers: { Authorization: `Bearer ${token}` }
                            }).then(() => setNotifications(p => p.filter(x => x._id !== n._id)));
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
}

