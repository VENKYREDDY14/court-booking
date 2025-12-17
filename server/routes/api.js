const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const bookingController = require('../controllers/bookingController');

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');

// Admin API
// Courts
router.post('/admin/courts', adminController.createCourt);
router.put('/admin/courts/:id', adminController.updateCourt);
router.delete('/admin/courts/:id', adminController.deleteCourt);

// Equipment
router.post('/admin/equipment', adminController.createEquipment);
router.put('/admin/equipment/:id', adminController.updateEquipment);
router.delete('/admin/equipment/:id', adminController.deleteEquipment);

// Coaches
router.post('/admin/coaches', adminController.createCoach);
router.put('/admin/coaches/:id', adminController.updateCoach);
router.delete('/admin/coaches/:id', adminController.deleteCoach);

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Resources
router.get('/resources', resourceController.getResources);

// Bookings
router.post('/bookings', authMiddleware, bookingController.createBooking); // Protect create
router.post('/bookings/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.get('/bookings', authMiddleware, bookingController.getBookings);
router.post('/bookings/availability', bookingController.checkAvailability);
router.post('/bookings/price', bookingController.calculatePrice);
router.get('/auth/me', authMiddleware, authController.getMe);
router.get('/auth/notifications', authMiddleware, authController.getNotifications);
router.put('/auth/notifications/:id/read', authMiddleware, authController.markNotificationRead);

// Waitlist
const waitlistController = require('../controllers/waitlistController');
router.post('/waitlist', authMiddleware, waitlistController.joinWaitlist);
router.get('/waitlist', authMiddleware, waitlistController.getWaitlistStatus);

// Resources);
router.get('/admin/rules', adminController.getPricingRules);
router.post('/admin/rules', adminController.createPricingRule);
router.put('/admin/rules/:id', adminController.updatePricingRule);
router.delete('/admin/rules/:id', adminController.deletePricingRule);

// Admin Bookings
router.get('/admin/bookings', adminController.getAllBookings);


module.exports = router;
