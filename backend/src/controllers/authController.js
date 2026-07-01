const User = require('../models/User');
const CustomError = require('../utils/CustomError');

/**
 * Get current logged-in user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new CustomError('User profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current logged-in user profile
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, photoURL, address } = req.body;
    
    if (!req.user) {
      return next(new CustomError('User not found', 404));
    }

    if (displayName !== undefined) req.user.displayName = displayName;
    if (photoURL !== undefined) req.user.photoURL = photoURL;
    if (address !== undefined) req.user.address = address;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (restricted to Admins)
 * PATCH /api/auth/update-role
 */
const updateRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return next(new CustomError('Please provide both userId and role.', 400));
    }

    if (!['Attendee', 'Organizer', 'Admin'].includes(role)) {
      return next(new CustomError('Invalid role. Allowed: Attendee, Organizer, Admin.', 400));
    }

    // Prevent self-demoting from Admin role to avoid lockout
    if (req.user._id.toString() === userId && role !== 'Admin') {
      return next(new CustomError('Admins cannot demote themselves.', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      data: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Self-update role on onboarding
 * PATCH /api/auth/select-role
 */
const selectRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['Attendee', 'Organizer'].includes(role)) {
      return next(new CustomError('Invalid role selected. Allowed: Attendee, Organizer.', 400));
    }

    req.user.role = role;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: `Role successfully selected as ${role}.`,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all user profiles (Admin only)
 * GET /api/auth/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateRole,
  selectRole,
  getAllUsers
};
