const { Court, Equipment, Coach } = require('../models');

exports.getResources = async (req, res) => {
    try {
        const courts = await Court.find({});
        const equipment = await Equipment.find({});
        const coaches = await Coach.find({});
        res.json({ courts, equipment, coaches });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
