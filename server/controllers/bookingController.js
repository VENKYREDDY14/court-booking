const BookingService = require('../services/BookingService');
const AvailabilityService = require('../services/AvailabilityService');
const PricingService = require('../services/PricingService');
const { Booking } = require('../models');

exports.createBooking = async (req, res) => {
    try {
        const booking = await BookingService.createBooking({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { courtId, date, startTime, endTime } = req.body;
        const available = await AvailabilityService.checkCourtAvailability(courtId, date, startTime, endTime);
        res.json({ available });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.calculatePrice = async (req, res) => {
    try {
        const price = await PricingService.calculatePrice(req.body);
        res.json({ price });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).sort({ date: -1, startTime: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const result = await BookingService.cancelBooking(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
