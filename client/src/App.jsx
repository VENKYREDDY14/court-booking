import { useState, useEffect } from 'react';
import BookingCalendar from './components/BookingCalendar';
import ResourceSelector from './components/ResourceSelector';
import PriceBreakdown from './components/PriceBreakdown';
import BookingHistory from './components/BookingHistory';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
  const [resources, setResources] = useState({ courts: [], equipment: [], coaches: [] });
  const [loading, setLoading] = useState(true);
  const [refreshHistory, setRefreshHistory] = useState(0); // Trigger reload
  const [bookingState, setBookingState] = useState({
    court: null,
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:00',
    equipment: [], // { item: id, quantity: 1 }
    coach: null
  });
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/api/resources`)
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (bookingState.court) {
      // Calculate Price Live
      // Debounce could be good, but simple fetch for now
      fetch(`${API_URL}/api/bookings/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: bookingState.court,
          date: bookingState.date,
          startTime: bookingState.startTime,
          endTime: bookingState.endTime,
          equipmentIds: bookingState.equipment,
          coachId: bookingState.coach
        })
      })
        .then(res => res.json())
        .then(data => setPrice(data.price))
        .catch(err => console.error(err));
    }
  }, [bookingState]);

  const handleBooking = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'Guest User', // Mock
          courtId: bookingState.court,
          ...bookingState
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Booking Confirmed! Total: ' + data.totalPrice);
        setRefreshHistory(prev => prev + 1);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Booking Failed');
    }
  };

  const [showAdmin, setShowAdmin] = useState(false);

  if (loading) return <div className="container">Loading...</div>;

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Court Booking</h1>
        <button className="btn" onClick={() => setShowAdmin(true)} style={{ border: '1px solid #ddd' }}>Admin Panel</button>
      </header>

      <div className="grid grid-cols-3">
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <h2>1. Select Date & Time</h2>
            <BookingCalendar
              date={bookingState.date}
              setDate={(d) => setBookingState(p => ({ ...p, date: d }))}
              startTime={bookingState.startTime}
              setStartTime={(t) => setBookingState(p => ({ ...p, startTime: t }))}
              endTime={bookingState.endTime}
              setEndTime={(t) => setBookingState(p => ({ ...p, endTime: t }))}
            />
          </div>

          <div className="card">
            <h2>2. Select Court</h2>
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginTop: '1rem' }}>
              {resources.courts.map(c => (
                <button
                  key={c._id}
                  className={`btn ${bookingState.court === c._id ? 'btn-primary' : ''}`}
                  style={{ border: '1px solid #ddd', width: '100%' }}
                  onClick={() => setBookingState(p => ({ ...p, court: c._id }))}
                >
                  {c.name} ({c.type}) - ${c.basePrice}/hr
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>3. Add Extras</h2>
            <ResourceSelector
              resources={resources}
              selected={{ equipment: bookingState.equipment, coach: bookingState.coach }}
              onChange={(update) => setBookingState(p => ({ ...p, ...update }))}
            />
          </div>
        </div>

        <div>
          <PriceBreakdown
            state={bookingState}
            price={price}
            onConfirm={handleBooking}
          />
        </div>
      </div>

      <BookingHistory key={refreshHistory} />
    </div>
  );
}

export default App;
