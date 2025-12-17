const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const bookingController = require('../controllers/bookingController');

const adminController = require('../controllers/adminController');

// Resources
router.get('/resources', resourceController.getResources);

// Bookings
router.post('/bookings', bookingController.createBooking);
router.get('/bookings', bookingController.getBookings);
router.post('/bookings/availability', bookingController.checkAvailability);
router.post('/bookings/price', bookingController.calculatePrice);

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

// Rules
router.get('/admin/rules', adminController.getPricingRules);
router.post('/admin/rules', adminController.createPricingRule);
router.put('/admin/rules/:id', adminController.updatePricingRule);
router.delete('/admin/rules/:id', adminController.deletePricingRule);

// Admin Bookings
router.get('/admin/bookings', adminController.getAllBookings);


module.exports = router;
