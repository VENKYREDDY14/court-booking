const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Court, Equipment, Coach, PricingRule } = require('./models');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await Court.deleteMany();
        await Equipment.deleteMany();
        await Coach.deleteMany();
        await PricingRule.deleteMany();

        const courts = await Court.insertMany([
            { name: 'Indoor Court A', type: 'INDOOR', basePrice: 150 },
            { name: 'Indoor Court B', type: 'INDOOR', basePrice: 150 },
            { name: 'Outdoor Court 1', type: 'OUTDOOR', basePrice: 100 },
            { name: 'Outdoor Court 2', type: 'OUTDOOR', basePrice: 100 }
        ]);

        const equipment = await Equipment.insertMany([
            { name: 'Premium Racket', type: 'RACKET', quantity: 10, price: 50 },
            { name: 'Professional Shoes', type: 'SHOES', quantity: 5, price: 80 }
        ]);

        const coaches = await Coach.insertMany([
            { name: 'Coach John', hourlyRate: 200 },
            { name: 'Coach Sarah', hourlyRate: 250 },
            { name: 'Coach Mike', hourlyRate: 180 }
        ]);

        const rules = await PricingRule.insertMany([
            {
                name: 'Peak Hours',
                type: 'PEAK_HOUR',
                conditions: { startTime: '18:00', endTime: '21:00' },
                adjustmentType: 'MULTIPLIER',
                value: 1.5
            },
            {
                name: 'Weekend Surcharge',
                type: 'WEEKEND',
                conditions: { days: [0, 6] },
                adjustmentType: 'MULTIPLIER',
                value: 1.2
            },
            {
                name: 'Indoor Premium',
                type: 'INDOOR_SURCHARGE',
                conditions: { resourceType: 'INDOOR' },
                adjustmentType: 'ADDER',
                value: 0 // Ideally this is handled by base price, but keeping rule structure flex
            }
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
