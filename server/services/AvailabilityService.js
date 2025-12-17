const { Booking, Equipment } = require('../models');

class AvailabilityService {
    static async checkCourtAvailability(courtId, date, startTime, endTime) {
        // Find any booking that overlaps with the requested slot for this court
        // Overlap logic: Booking Start < Requested End AND Booking End > Requested Start

        const count = await Booking.countDocuments({
            court: courtId,
            date: new Date(date),
            status: 'CONFIRMED',
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        return count === 0;
    }

    static async checkCoachAvailability(coachId, date, startTime, endTime) {
        if (!coachId) return true;
        const count = await Booking.countDocuments({
            coach: coachId,
            date: new Date(date),
            status: 'CONFIRMED',
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        return count === 0;
    }

    static async checkEquipmentAvailability(equipmentList, date, startTime, endTime) {
        // equipmentList: [{ item: itemId, quantity: 2 }]
        if (!equipmentList || equipmentList.length === 0) return true;

        for (const reqItem of equipmentList) {
            const equipment = await Equipment.findById(reqItem.item);
            if (!equipment) throw new Error(`Equipment ${reqItem.item} not found`);

            // Find all confirmed bookings in this slot that use this equipment
            const overlappingBookings = await Booking.find({
                date: new Date(date),
                status: 'CONFIRMED',
                'equipment.item': reqItem.item,
                $or: [
                    {
                        startTime: { $lt: endTime },
                        endTime: { $gt: startTime }
                    }
                ]
            });

            const usedQuantity = overlappingBookings.reduce((sum, booking) => {
                const item = booking.equipment.find(e => e.item.toString() === reqItem.item.toString());
                return sum + (item ? item.quantity : 0);
            }, 0);

            if (usedQuantity + reqItem.quantity > equipment.quantity) {
                return false; // Not enough stock
            }
        }

        return true;
    }
}

module.exports = AvailabilityService;
