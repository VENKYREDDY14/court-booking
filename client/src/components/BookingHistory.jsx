import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function BookingHistory() {
    const { token, user } = useAuth();
    const toast = useToast();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user || !token) {
            setBookings([]);
            return;
        }
        const API_URL = import.meta.env.VITE_API_URL;
        fetch(`${API_URL}/api/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setBookings(data))
            .catch(err => console.error(err));
    }, [user, token]);

    const isCancellable = (dateStr, timeStr) => {
        const bookingTime = new Date(dateStr);
        const [h, m] = timeStr.split(':');
        bookingTime.setHours(h, m);
        const diffHours = (bookingTime - new Date()) / (1000 * 60 * 60);
        return diffHours >= 24;
    };

    const handleCancel = (id) => {
        if (!confirm('Cancel booking?')) return;
        const API_URL = import.meta.env.VITE_API_URL;
        fetch(`${API_URL}/api/bookings/${id}/cancel`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()).then(res => {
            if (res.message === 'Booking cancelled') {
                toast.success('Booking cancelled successfully');
                setBookings(prev => prev.map(x => x._id === id ? { ...x, status: 'CANCELLED' } : x));
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <div className="card mt-8">
            <h2 className="text-xl font-bold mb-4">Your Booking History</h2>
            {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="p-3 font-semibold text-gray-700">Court</th>
                                <th className="p-3 font-semibold text-gray-700">Date/Time</th>
                                <th className="p-3 font-semibold text-gray-700">Extras</th>
                                <th className="p-3 font-semibold text-gray-700">Total</th>
                                <th className="p-3 font-semibold text-gray-700">Status</th>
                                <th className="p-3 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-3">{b.court?.name || 'N/A'}</td>
                                    <td className="p-3">
                                        {new Date(b.date).toLocaleDateString()}<br />
                                        <span className="text-sm text-gray-500">{b.startTime} - {b.endTime}</span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {b.equipment.length > 0 && <div>Eq: {b.equipment.length} items</div>}
                                        {b.coach && <div>Coach: {b.coach.name}</div>}
                                    </td>
                                    <td className="p-3 font-medium">${b.totalPrice}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                b.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {b.status === 'CONFIRMED' ? (
                                            isCancellable(b.date, b.startTime) ? (
                                                <button
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                                                    onClick={() => handleCancel(b._id)}
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 cursor-help" title="Less than 24h">No Cancellation</span>
                                            )
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BookingHistory;
