const express = require('express');
const { initiateBooking, verifyPayment, checkInAttendee, getMyBookings, getOrganizerBookings } = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/bookings/organizer-bookings - Fetch bookings for events owned by organizer
router.get('/organizer-bookings', verifyToken, authorizeRoles('Organizer', 'Admin'), getOrganizerBookings);

// GET /api/bookings/my-bookings - Fetch bookings made by the logged-in user
router.get('/my-bookings', verifyToken, getMyBookings);

// POST /api/bookings/initiate - Start the ticket checkout process (Attendee/Organizer/Admin)
router.post('/initiate', verifyToken, initiateBooking);

// POST /api/bookings/verify - Validate payment signatures post checkout (Attendee/Organizer/Admin)
router.post('/verify', verifyToken, verifyPayment);

// POST /api/bookings/check-in - Confirm attendee scan ticket on-premise (Organizer/Admin only)
router.post('/check-in', verifyToken, authorizeRoles('Organizer', 'Admin'), checkInAttendee);

module.exports = router;
