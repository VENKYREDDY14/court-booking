const { Court, Equipment, Coach, PricingRule, Booking } = require('../models');

// --- Courts ---
exports.createCourt = async (req, res) => {
    try {
        const court = await Court.create(req.body);
        res.status(201).json(court);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.updateCourt = async (req, res) => {
    try {
        const court = await Court.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(court);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deleteCourt = async (req, res) => {
    try {
        await Court.findByIdAndDelete(req.params.id);
        res.json({ message: 'Court deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Equipment ---
exports.createEquipment = async (req, res) => {
    try {
        const item = await Equipment.create(req.body);
        res.status(201).json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.updateEquipment = async (req, res) => {
    try {
        const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(item);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deleteEquipment = async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Equipment deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Coaches ---
exports.createCoach = async (req, res) => {
    try {
        const coach = await Coach.create(req.body);
        res.status(201).json(coach);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.updateCoach = async (req, res) => {
    try {
        const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(coach);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deleteCoach = async (req, res) => {
    try {
        await Coach.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coach deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Pricing Rules ---
exports.createPricingRule = async (req, res) => {
    try {
        const rule = await PricingRule.create(req.body);
        res.status(201).json(rule);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.getPricingRules = async (req, res) => {
    try {
        const rules = await PricingRule.find({});
        res.json(rules);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updatePricingRule = async (req, res) => {
    try {
        const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(rule);
    } catch (err) { res.status(400).json({ message: err.message }); }
};
exports.deletePricingRule = async (req, res) => {
    try {
        await PricingRule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rule deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- Bookings Admin ---
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ date: -1 }).populate('court').populate('coach');
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
