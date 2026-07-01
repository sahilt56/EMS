const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const CustomError = require('../utils/CustomError');
const { createOrder, verifySignature } = require('../services/paymentService');
const { generateQRCode } = require('../services/qrService');

/**
 * Helper utility to manage mongoose transaction sessions.
 * Falls back gracefully to sequence operations if MongoDB replica sets are not configured.
 */
const runAtomic = async (workFn) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await workFn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    // Catch transaction errors on standalone mongo
    if (err.message.includes('Replica Set') || err.message.includes('transaction') || err.code === 20) {
      return await workFn(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Initiate booking (generates pending order)
 * POST /api/bookings/initiate
 */
const initiateBooking = async (req, res, next) => {
  try {
    const { eventId, ticketCount } = req.body;

    if (!eventId || !ticketCount || ticketCount < 1) {
      return next(new CustomError('Invalid booking request parameters.', 400));
    }

    const result = await runAtomic(async (session) => {
      const sessionOpts = session ? { session } : {};
      
      // Atomically check capacity and lock the tickets by incrementing ticketsSold
      const event = await Event.findOneAndUpdate(
        {
          _id: eventId,
          $expr: { $gte: [{ $subtract: ["$capacity", "$ticketsSold"] }, Number(ticketCount)] }
        },
        { $inc: { ticketsSold: Number(ticketCount) } },
        { new: true, ...sessionOpts }
      );

      if (!event) {
        // Find if event exists to throw the correct error message
        const exists = await Event.findById(eventId).setOptions(sessionOpts);
        if (!exists) {
          throw new CustomError('Associated event not found.', 404);
        }
        throw new CustomError('Requested ticket count exceeds remaining capacity.', 400);
      }

      const totalAmount = event.price * Number(ticketCount);

      const booking = new Booking({
        event: eventId,
        user: req.user._id,
        ticketCount: Number(ticketCount),
        totalAmount,
        paymentStatus: event.price === 0 ? 'Completed' : 'Pending'
      });

      // If event is free, complete booking transaction immediately
      if (event.price === 0) {
        // Embed ticket verification data inside base64 QR code image
        const qrPayload = JSON.stringify({
          bookingId: booking._id,
          eventId: event._id,
          uid: req.user.uid,
          buyerName: req.user.displayName
        });
        booking.qrCodeData = await generateQRCode(qrPayload);
        await booking.save(sessionOpts);

        return { booking, order: null };
      }

      // Paid event: Generate order on Razorpay
      const receiptId = `receipt_bk_${booking._id}`;
      const amountInPaise = totalAmount * 100;
      const order = await createOrder(amountInPaise, receiptId);

      booking.razorpayOrderId = order.id;
      await booking.save(sessionOpts);

      return { booking, order };
    });

    res.status(201).json({
      success: true,
      message: result.order ? 'Booking initiated.' : 'Booking completed successfully (Free Event).',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * POST /api/bookings/verify
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(new CustomError('Missing verification parameters.', 400));
    }

    // Verify signature authentic checksum
    const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      // Revert the ticketsSold increment if payment verification fails
      await runAtomic(async (session) => {
        const sessionOpts = session ? { session } : {};
        const booking = await Booking.findById(bookingId).setOptions(sessionOpts);
        if (booking && booking.paymentStatus === 'Pending') {
          booking.paymentStatus = 'Failed';
          await booking.save(sessionOpts);
          await Event.updateOne({ _id: booking.event }, { $inc: { ticketsSold: -booking.ticketCount } }, sessionOpts);
        }
      });
      return next(new CustomError('Payment authentication failed. Signature invalid.', 400));
    }

    const result = await runAtomic(async (session) => {
      const sessionOpts = session ? { session } : {};

      const booking = await Booking.findById(bookingId).setOptions(sessionOpts);
      if (!booking) {
        throw new CustomError('Booking record not found.', 404);
      }

      if (booking.paymentStatus === 'Completed') {
        return booking;
      }

      const event = await Event.findById(booking.event).setOptions(sessionOpts);
      if (!event) {
        throw new CustomError('Associated event not found.', 404);
      }

      // Complete booking details
      booking.paymentStatus = 'Completed';
      booking.razorpayPaymentId = razorpayPaymentId;
      booking.razorpaySignature = razorpaySignature;

      // Generate ticket check-in QR Code
      const qrPayload = JSON.stringify({
        bookingId: booking._id,
        eventId: event._id,
        uid: req.user.uid,
        buyerName: req.user.displayName
      });
      booking.qrCodeData = await generateQRCode(qrPayload);
      await booking.save(sessionOpts);

      return booking;
    });

    res.status(200).json({
      success: true,
      message: 'Payment verification successful.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check-in Attendee via Scanning QR Code
 * POST /api/bookings/check-in
 */
const checkInAttendee = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return next(new CustomError('Booking ID is required for check-in.', 400));
    }

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      return next(new CustomError('Booking record not found.', 404));
    }

    // Authorization: Must be owner organizer or admin
    if (booking.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new CustomError('Unauthorized. Only event organizers or admins can perform check-ins.', 403));
    }

    if (booking.paymentStatus !== 'Completed') {
      return next(new CustomError('Invalid ticket: payment is not completed.', 400));
    }

    if (booking.checkedIn) {
      return next(new CustomError('Attendee already checked in.', 400));
    }

    booking.checkedIn = true;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Attendee checked in successfully.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current user's bookings
 * GET /api/bookings/my-bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve bookings for events owned by the organizer
 * GET /api/bookings/organizer-bookings
 */
const getOrganizerBookings = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).select('_id');
    const eventIds = events.map(e => e._id);

    const bookings = await Booking.find({ event: { $in: eventIds } })
      .populate('event', 'title')
      .populate('user', 'displayName email uid')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateBooking,
  verifyPayment,
  checkInAttendee,
  getMyBookings,
  getOrganizerBookings
};
