const { Waitlist, Booking } = require('../models');

exports.joinWaitlist = async (req, res) => {
    try {
        const { courtId, date, startTime, endTime } = req.body;
        const userId = req.user.id;

        // Verify slot is actually full (optional double check)
        // Ignoring for MVP speed, assuming frontend only allows call if full.

        const existing = await Waitlist.findOne({ court: courtId, date, startTime, user: userId });
        if (existing) return res.status(400).json({ message: 'Already on waitlist' });

        const waitlistEntry = await Waitlist.create({
            court: courtId,
            date,
            startTime,
            endTime,
            user: userId
        });

        res.status(201).json(waitlistEntry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getWaitlistStatus = async (req, res) => {
    // Check if user is on waitlist for specific slots
    // Not strictly needed if frontend just tracks "joined", but good for reload
    try {
        const list = await Waitlist.find({ user: req.user.id });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
