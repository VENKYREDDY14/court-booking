const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['INDOOR', 'OUTDOOR'], required: true },
    basePrice: { type: Number, required: true, default: 100 } // Hourly base price
});

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['RACKET', 'SHOES'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // Fixed price per booking
});

const coachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hourlyRate: { type: Number, required: true }
});

const pricingRuleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['PEAK_HOUR', 'WEEKEND', 'INDOOR_SURCHARGE'], required: true },
    conditions: {
        startTime: String, // HH:mm
        endTime: String, // HH:mm
        days: [Number], // 0-6 (Sun-Sat)
        resourceType: String // e.g., 'INDOOR'
    },
    adjustmentType: { type: String, enum: ['MULTIPLIER', 'ADDER'], required: true },
    value: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
    user: { type: String, default: 'Guest' }, // Simplified user for now
    court: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    date: { type: Date, required: true }, // ISO Date
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    equipment: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        quantity: { type: Number, default: 1 }
    }],
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent double booking of court
bookingSchema.index({ court: 1, date: 1, startTime: 1 }, { unique: true });

const Court = mongoose.model('Court', courtSchema);
const Equipment = mongoose.model('Equipment', equipmentSchema);
const Coach = mongoose.model('Coach', coachSchema);
const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Court, Equipment, Coach, PricingRule, Booking };
