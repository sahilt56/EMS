const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description.']
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date.']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an event end date.']
  },
  location: {
    type: String,
    required: [true, 'Please provide an event location.']
  },
  address: {
    type: String,
    required: [true, 'Please provide the proper address of the venue.']
  },
  city: {
    type: String,
    required: [true, 'Please provide the city.']
  },
  pinCode: {
    type: String,
    required: [true, 'Please provide the pin code.']
  },
  landmark: {
    type: String,
    required: [true, 'Please provide a landmark.']
  },
  category: {
    type: String,
    required: [true, 'Please provide an event category.']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an event image URL.']
  },
  organizerName: {
    type: String,
    required: [true, 'Please provide the organizer name.']
  },
  price: {
    type: Number,
    required: [true, 'Please provide ticket price.'],
    min: [0, 'Price cannot be negative.'],
    default: 0
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide total capacity.'],
    min: [1, 'Capacity must be at least 1.']
  },
  ticketsSold: {
    type: Number,
    default: 0,
    min: [0, 'Tickets sold cannot be negative.']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Database performance optimizations
eventSchema.index({ organizer: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
