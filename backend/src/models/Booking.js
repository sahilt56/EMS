const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketCount: {
    type: Number,
    required: [true, 'Please provide the ticket count.'],
    min: [1, 'Must purchase at least 1 ticket.'],
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents without razorpayOrderId (e.g. free events or prior test entries)
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  qrCodeData: {
    type: String // Holds the base64 QR code image/URI representing the ticket check-in details
  },
  checkedIn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
