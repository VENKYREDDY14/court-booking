import { useState, useEffect } from 'react';
import BookingCalendar from './components/BookingCalendar';
import ResourceSelector from './components/ResourceSelector';
import PriceBreakdown from './components/PriceBreakdown';
import BookingHistory from './components/BookingHistory';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import NotificationList from './components/NotificationList';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

function AppContent() {
  const { user, logout, token } = useAuth();
  const toast = useToast();
  const [resources, setResources] = useState({ courts: [], equipment: [], coaches: [] });
  const [loading, setLoading] = useState(true);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [bookingState, setBookingState] = useState({
    court: null,
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:00',
    equipment: [],
    coach: null
  });
  const [price, setPrice] = useState(0);
  const [showAuth, setShowAuth] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
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

  const handleWaitlist = async () => {
    if (!user) { toast.warning('Please login to join waitlist'); setShowAuth('login'); return; }
    try {
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courtId: bookingState.court,
          date: bookingState.date,
          startTime: bookingState.startTime,
          endTime: bookingState.endTime
        })
      });
      const data = await res.json();
      if (res.ok) toast.success('Joined Waitlist! You will be notified if the slot opens.');
      else toast.error('Error: ' + data.message);
    } catch (e) { toast.error('Failed to join waitlist'); }
  };

  const handleBooking = async () => {
    if (!user) {
      setShowAuth('login');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          courtId: bookingState.court,
          ...bookingState
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Booking Confirmed! Total: $' + data.totalPrice);
        setRefreshHistory(prev => prev + 1);
      } else {
        if (data.message.includes('already booked')) {
          if (confirm('Slot is taken. Join Waitlist?')) {
            handleWaitlist();
          }
        } else {
          toast.error('Error: ' + data.message);
        }
      }
    } catch (err) {
      toast.error('Booking Failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 fade-in">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Court Booking</h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden sm:block text-slate-600">Welcome, <span className="font-semibold text-slate-900">{user.name}</span></span>
                  <button className="btn btn-secondary text-sm" onClick={logout}>Logout</button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowAuth('login')}>Login</button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setShowAdmin(true)}
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {showAuth === 'login' && <Login onClose={() => setShowAuth(null)} onSwitch={() => setShowAuth('register')} />}
        {showAuth === 'register' && <Register onClose={() => setShowAuth(null)} onSwitch={() => setShowAuth('login')} />}

        <NotificationList />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Booking Steps */}
          <div className="lg:col-span-8 space-y-8">

            {/* Step 1: Date & Time */}
            <section className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">1</div>
                <h2 className="text-xl font-bold text-slate-900 m-0">Select Date & Time</h2>
              </div>
              <BookingCalendar
                date={bookingState.date}
                setDate={(d) => setBookingState(p => ({ ...p, date: d }))}
                startTime={bookingState.startTime}
                setStartTime={(t) => setBookingState(p => ({ ...p, startTime: t }))}
                endTime={bookingState.endTime}
                setEndTime={(t) => setBookingState(p => ({ ...p, endTime: t }))}
              />
            </section>

            {/* Step 2: Select Court */}
            <section className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">2</div>
                <h2 className="text-xl font-bold text-slate-900 m-0">Select Court</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.courts.map(c => (
                  <button
                    key={c._id}
                    className={`
                      relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200
                      ${bookingState.court === c._id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }
                    `}
                    onClick={() => setBookingState(p => ({ ...p, court: c._id }))}
                  >
                    <div className="flex justify-between w-full mb-2">
                      <span className="font-semibold text-slate-900">{c.name}</span>
                      <span className="badge bg-green-100 text-green-700">{c.type}</span>
                    </div>
                    <span className="text-sm text-slate-600">${c.basePrice}/hr</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3: Extras */}
            <section className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">3</div>
                <h2 className="text-xl font-bold text-slate-900 m-0">Add Extras</h2>
              </div>
              <ResourceSelector
                resources={resources}
                selected={{ equipment: bookingState.equipment, coach: bookingState.coach }}
                onChange={(update) => setBookingState(p => ({ ...p, ...update }))}
              />
            </section>

            {/* Booking History Section */}
            <div className="pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">My Bookings</h2>
              <BookingHistory key={refreshHistory} />
            </div>

          </div>

          {/* Right Column: Price Summary (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <PriceBreakdown
                state={bookingState}
                price={price}
                onConfirm={handleBooking}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
