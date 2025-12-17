const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api/bookings/price';
const RESOURCES_URL = 'http://127.0.0.1:5000/api/resources';

const runTest = async () => {
    try {
        // 1. Get Resources
        const res = await axios.get(RESOURCES_URL);
        const court = res.data.courts[0];
        const equipment = res.data.equipment[0];

        console.log(`Court Base Price: ${court.basePrice}`);
        console.log(`Equipment Price: ${equipment.price}`);

        // 2. Calculate Price WITHOUT Equipment
        const payloadBase = {
            courtId: court._id,
            date: '2025-06-18', // A Wednesday (no weekend rule)
            startTime: '10:00',
            endTime: '11:00',
            equipmentIds: [],
            coachId: null
        };

        const priceBaseRes = await axios.post(API_URL, payloadBase);
        console.log(`Price without equipment: ${priceBaseRes.data.price}`);

        // 3. Calculate Price WITH Equipment
        const payloadWithEq = {
            ...payloadBase,
            equipmentIds: [{ item: equipment._id, quantity: 2 }]
        };

        const priceEqRes = await axios.post(API_URL, payloadWithEq);
        console.log(`Price WITH 2x Equipment: ${priceEqRes.data.price}`);

        if (priceEqRes.data.price === priceBaseRes.data.price) {
            console.log("FAIL: Price did not increase with equipment!");
        } else {
            const expected = priceBaseRes.data.price + (equipment.price * 2);
            if (priceEqRes.data.price === expected) {
                console.log("PASS: Price increased correctly.");
            } else {
                console.log(`FAIL: Price changed but incorrect. Got ${priceEqRes.data.price}, Expected ${expected}`);
            }
        }

    } catch (error) {
        console.error('Test Error:', error.message);
        if (error.response) console.error(error.response.data);
    }
};

runTest();
