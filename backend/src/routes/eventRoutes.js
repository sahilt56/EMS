const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  askAssistant
} = require('../controllers/eventController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// AI Assistant Route
router.post('/assistant', verifyToken, askAssistant);

// Route for all events CRUD
router.route('/')
  .post(verifyToken, authorizeRoles('Organizer', 'Admin'), createEvent) // Only Organizers & Admins can create
  .get(getEvents); // Public query access

router.route('/:id')
  .get(getEventById) // Public details access
  .put(verifyToken, authorizeRoles('Organizer', 'Admin'), updateEvent) // Restricted updates
  .delete(verifyToken, authorizeRoles('Organizer', 'Admin'), deleteEvent); // Restricted deletion

module.exports = router;
