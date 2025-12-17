const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';
let token, bookingIdNear, bookingIdFar;

const runTest = async () => {
    try {
        console.log('--- STARTING CANCELLATION POLICY TEST ---');

        // 1. Register User
        const email = `canceluser_${Date.now()}@test.com`;
        const res = await axios.post(`${API_URL}/auth/register`, {
            name: 'Cancel User', email, password: 'password123'
        });
        token = res.data.token;
        console.log('User Registered.');

        const courtRes = await axios.get(`${API_URL}/resources`);
        const courtId = courtRes.data.courts[0]._id;

        // 2. Create Booking < 24h (e.g. valid date but check implementation)
        // Note: Our implementation checks (Booking Date - Now). 
        // If I book for TODAY + 2 hours, it should fail cancellation.
        const today = new Date();
        const nearDate = new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Wait, if I book for today, date is today string. Time is string.
        // Let's book for TOMORROW (24h+ check).

        // Case A: Book for Today + 1 hour (Near)
        const nearBookingRes = await axios.post(`${API_URL}/bookings`, {
            courtId, date: nearDate, startTime: '23:00', endTime: '23:59' // Assuming nearDate is today
        }, { headers: { Authorization: `Bearer ${token}` } });
        bookingIdNear = nearBookingRes.data._id;
        console.log('Near Booking Created:', bookingIdNear);

        // Case B: Book for Today + 30 Days (Far)
        const farDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const farBookingRes = await axios.post(`${API_URL}/bookings`, {
            courtId, date: farDate, startTime: '10:00', endTime: '11:00'
        }, { headers: { Authorization: `Bearer ${token}` } });
        bookingIdFar = farBookingRes.data._id;
        console.log('Far Booking Created:', bookingIdFar);

        // 3. Try Cancel Near (Should Fail)
        console.log('Trying to cancel Near booking...');
        try {
            await axios.post(`${API_URL}/bookings/${bookingIdNear}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('FAIL: Managed to cancel near booking!');
        } catch (e) {
            if (e.response && e.response.data.message.includes('24 hours')) {
                console.log('SUCCESS: Blocked cancellation of near booking.');
            } else {
                console.error('FAIL: Unexpected error:', e.message);
            }
        }

        // 4. Try Cancel Far (Should Success)
        console.log('Trying to cancel Far booking...');
        try {
            await axios.post(`${API_URL}/bookings/${bookingIdFar}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('SUCCESS: Cancelled far booking.');
        } catch (e) {
            console.error('FAIL: Could not cancel far booking:', e.response?.data);
        }

    } catch (e) {
        console.error('TEST FAIL:', e.message, e.response?.data);
    }
};

runTest();
