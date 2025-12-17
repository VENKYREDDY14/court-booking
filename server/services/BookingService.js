const mongoose = require('mongoose');
const { Booking, Waitlist, Notification, User } = require('../models');
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
    static async cancelBooking(bookingId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) throw new Error('Booking not found');

            // 1. Check Time Limit (e.g. 24 hours)
            const bookingDateTime = new Date(booking.date);
            const [hours, minutes] = booking.startTime.split(':');
            bookingDateTime.setHours(hours, minutes, 0, 0);

            const now = new Date();
            const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

            if (diffHours < 24) {
                throw new Error('Cancellation is only allowed 24 hours before the slot time.');
            }

            // 2. Cancel Booking
            booking.status = 'CANCELLED';
            await booking.save({ session });
            // Alternatively: await Booking.findByIdAndDelete(bookingId, { session });

            // 2. Check Waitlist
            const nextInLine = await Waitlist.findOne({
                court: booking.court,
                date: booking.date,
                startTime: booking.startTime
            }).sort({ createdAt: 1 }); // FIFO

            if (nextInLine) {
                // 3. Notify User
                const message = `Slot Availaeble! Court ${booking.court} on ${new Date(booking.date).toLocaleDateString()} at ${booking.startTime} is now free. Book it now!`;

                await Notification.create([{
                    user: nextInLine.user,
                    message: message
                }], { session });

                console.log(`NOTIFYING USER ${nextInLine.user}: ${message}`);

                // Remove from waitlist (or keep until they book? usually remove to prevent spam)
                await Waitlist.findByIdAndDelete(nextInLine._id, { session });
            }

            await session.commitTransaction();
            session.endSession();
            return { message: 'Booking cancelled', notified: !!nextInLine };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = BookingService;
