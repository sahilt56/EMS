const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true // Optimized index for fast user lookups via Firebase UID
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String
  },
  address: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['Attendee', 'Organizer', 'Admin'],
    default: 'Attendee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
