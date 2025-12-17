const mongoose = require('mongoose');
const { Booking } = require('../models');
const AvailabilityService = require('./AvailabilityService');
const PricingService = require('./PricingService');

class BookingService {
    static async createBooking({ userId, courtId, date, startTime, endTime, equipment, coachId, coach }) {
        // Handle coach parameter alias
        const actualCoachId = coachId || coach;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Check Availability (Atomically / Locked is hard in Mongo without sharding constraints, 
            // but Transaction helps purely for rollback. 
            // Real concurrency safety needs unique indexes or optimistic concurrency control.
            // We have a unique index on court+date+startTime which catches exact duplicates, 
            // but overlapping ranges need logic.
            // For rigorous safety we'd use finding and locking, but here we check first.)

            // NOTE: This check is inside transaction but Mongo doesn't lock reads by default.
            // However, if we insert and it violates unique index, it fails.
            // Overlapping ranges is the tricky part. 

            const isCourtFree = await AvailabilityService.checkCourtAvailability(courtId, date, startTime, endTime);
            if (!isCourtFree) throw new Error('Court is already booked for this time slot');

            const isCoachFree = await AvailabilityService.checkCoachAvailability(actualCoachId, date, startTime, endTime);
            if (!isCoachFree) throw new Error('Coach is unavailable for this time slot');

            // Transform equipment for availability check (ensure IDs are strings if needed)
            // simplified for demo
            const isEquipmentFree = await AvailabilityService.checkEquipmentAvailability(equipment, date, startTime, endTime);
            if (!isEquipmentFree) throw new Error('Requested equipment is not available');

            // 2. Calculate Price
            const price = await PricingService.calculatePrice({
                courtId, date, startTime, endTime, equipmentIds: equipment, coachId: actualCoachId
            });

            // 3. Create Booking
            const booking = new Booking({
                user: userId,
                court: courtId,
                date: new Date(date),
                startTime,
                endTime,
                equipment,
                coach: actualCoachId,
                totalPrice: price,
                status: 'CONFIRMED'
            });

            await booking.save({ session });

            await session.commitTransaction();
            session.endSession();
            return booking;

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = BookingService;
