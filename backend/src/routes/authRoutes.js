const express = require('express');
const { getProfile, updateProfile, updateRole, selectRole, getAllUsers } = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/auth/profile - Fetch logged-in user profile (Requires token verification)
router.get('/profile', verifyToken, getProfile);

// PATCH /api/auth/profile - Update logged-in user profile
router.patch('/profile', verifyToken, updateProfile);

// PATCH /api/auth/update-role - Update user roles (Requires Admin role)
router.patch('/update-role', verifyToken, authorizeRoles('Admin'), updateRole);

// PATCH /api/auth/select-role - Self-update role on onboarding (Requires verification)
router.patch('/select-role', verifyToken, selectRole);

// GET /api/auth/users - Retrieve user list (Requires Admin role)
router.get('/users', verifyToken, authorizeRoles('Admin'), getAllUsers);

module.exports = router;
