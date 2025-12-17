const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api/bookings';

const testBooking = {
    userId: 'User 1',
    courtId: '6942351699a649249b0ef13b', // Ensure this ID exists or fetch it dynamicall 
    // Wait, IDs are random from seed. I need to fetch one first.
    date: '2025-05-20',
    startTime: '12:00',
    endTime: '13:00',
    equipment: [],
    coach: null
};

const runTest = async () => {
    try {
        // Fetch a valid court ID
        const resources = await axios.get('http://127.0.0.1:5000/api/resources');
        const courtId = resources.data.courts[0]._id;

        const bookingData = { ...testBooking, courtId };

        console.log('Attempting 2 concurrent bookings for same slot...');

        const req1 = axios.post(API_URL, { ...bookingData, userId: 'User A' })
            .catch(e => ({ status: e.response?.status, data: e.response?.data }));

        const req2 = axios.post(API_URL, { ...bookingData, userId: 'User B' })
            .catch(e => ({ status: e.response?.status, data: e.response?.data }));

        const [res1, res2] = await Promise.all([req1, req2]);

        console.log('Response 1:', res1.status, res1.data);
        console.log('Response 2:', res2.status, res2.data);

        if ((res1.status === 201 && res2.status !== 201) || (res1.status !== 201 && res2.status === 201)) {
            console.log('TEST PASSED: Only one booking succeeded.');
        } else if (res1.status === 201 && res2.status === 201) {
            console.log('TEST FAILED: Double booking occurred!');
        } else {
            console.log('TEST INCONCLUSIVE: Both failed?');
        }

    } catch (error) {
        console.error('Test Error:', error.message);
    }
};

runTest();
