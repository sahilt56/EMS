const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Middleware to verify Firebase ID Token from Authorization header
 * Header format: Authorization: Bearer <Token>
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.uid = decodedToken.uid;
    req.firebaseUser = decodedToken;

    // Find user in MongoDB linked via the Firebase uid
    let user = await User.findOne({ uid: decodedToken.uid });
    
    // Sync UID if user exists with the same email under a different UID
    if (!user && decodedToken.email) {
      user = await User.findOne({ email: decodedToken.email });
      if (user) {
        user.uid = decodedToken.uid;
        if (decodedToken.picture) {
          user.photoURL = decodedToken.picture;
        }
        await user.save();
      }
    }

    // Auto-register user in MongoDB if they exist in Firebase but not in our DB
    // Use findOneAndUpdate with upsert to prevent E11000 race conditions if multiple requests hit this middleware simultaneously!
    if (!user) {
      user = await User.findOneAndUpdate(
        { email: decodedToken.email },
        {
          $setOnInsert: {
            uid: decodedToken.uid,
            displayName: decodedToken.name || decodedToken.email.split('@')[0],
            photoURL: decodedToken.picture || '',
            role: 'Attendee' // Default role
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    req.user = user;
    next();
  } catch (error) {
    // If it's a firebase auth error, it's a 401. Otherwise, it might be a DB error (500)
    if (error.code && error.code.startsWith('auth/')) {
      console.error('Authentication Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        error: error.message
      });
    }
    
    // Database or other internal server errors should not be masked as 401s
    console.error('Internal Server Error in authMiddleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error during authentication',
      error: error.message
    });
  }
};

/**
 * Middleware to restrict access based on roles
 * @param  {...string} roles - Permitted roles (e.g. 'Admin', 'Organizer')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'None'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
