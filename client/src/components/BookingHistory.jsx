import React, { useEffect, useState } from 'react';

function BookingHistory() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL;
        fetch(`${API_URL}/api/bookings`)
            .then(res => res.json())
            .then(data => setBookings(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2>Booking History</h2>
            {bookings.length === 0 ? <p>No bookings yet.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '0.5rem' }}>ID</th>
                            <th style={{ padding: '0.5rem' }}>Court</th>
                            <th style={{ padding: '0.5rem' }}>Date</th>
                            <th style={{ padding: '0.5rem' }}>Time</th>
                            <th style={{ padding: '0.5rem' }}>Total</th>
                            <th style={{ padding: '0.5rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{b._id.slice(-6)}</td>
                                <td style={{ padding: '0.5rem' }}>{b.court}</td>
                                <td style={{ padding: '0.5rem' }}>{new Date(b.date).toLocaleDateString()}</td>
                                <td style={{ padding: '0.5rem' }}>{b.startTime} - {b.endTime}</td>
                                <td style={{ padding: '0.5rem' }}>${b.totalPrice}</td>
                                <td style={{ padding: '0.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        backgroundColor: b.status === 'CONFIRMED' ? '#d1fae5' : '#fee2e2',
                                        color: b.status === 'CONFIRMED' ? '#065f46' : '#991b1b'
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BookingHistory;
