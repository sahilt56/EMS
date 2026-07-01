const Event = require('../models/Event');
const CustomError = require('../utils/CustomError');
const crypto = require('crypto');

/**
 * Create a new event
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, endDate, location, address, city, pinCode, landmark, category, imageUrl, organizerName, price, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      endDate,
      location,
      address,
      city,
      pinCode,
      landmark,
      category,
      imageUrl,
      organizerName,
      price: price || 0,
      capacity,
      organizer: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all events (supports search, price filtering, date filtering)
 * GET /api/events
 */
const getEvents = async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, date, category, location } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (location) {
      query.$or = [
        ...(query.$or || []),
        { location: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (date) {
      query.date = { $gte: new Date(date) };
    }

    const events = await Event.find(query)
      .populate('organizer', 'displayName email photoURL')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'displayName email photoURL');

    if (!event) {
      return next(new CustomError('Event not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event details (restricted to the event Organizer or Admin)
 * PUT /api/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return next(new CustomError('Event not found.', 404));
    }

    // Check permissions: Owner or Admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new CustomError('Not authorized to update this event.', 403));
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event (restricted to the event Organizer or Admin)
 * DELETE /api/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new CustomError('Event not found.', 404));
    }

    // Check permissions: Owner or Admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return next(new CustomError('Not authorized to delete this event.', 403));
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Smart AI Event Assistant powered by Gemini
 * POST /api/events/assistant
 */
const askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return next(new CustomError('Please provide a message query.', 400));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return next(new CustomError('Gemini API key is not configured on the server.', 500));
    }

    // Fetch all active/upcoming events to use as contextual data
    const upcomingEvents = await Event.find({ date: { $gte: new Date() } })
      .populate('organizer', 'displayName email');

    const contextText = upcomingEvents.map((e) => {
      return `- "${e.title}": priced at ${e.price} INR, capacity is ${e.capacity} attendees (tickets sold so far: ${e.ticketsSold}), set at date ${e.date.toDateString()}, location "${e.location}". Organizer: ${e.organizer?.displayName || 'Unknown'}. Event Details: ${e.description}`;
    }).join('\n');

    const systemPrompt = `You are a helpful and premium Smart AI Assistant for our Event Management SaaS (EMS) platform. 
Your goal is to answer the user's questions about events, schedules, or check-ins using the contextual event data provided below.

Available Upcoming Events:
${contextText || '(No upcoming events are registered in the database yet. You can suggest creating new events!)'}

Instructions:
1. Provide highly helpful, polite, and contextual suggestions/recommendations based on the user's query.
2. If the user asks about something unrelated to the events or EMS platform, politely redirect them back to the event portal scope.
3. Keep your response concise, engaging, and format it nicely in Markdown.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Question: ${message}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API Response Error:', errBody);
      return next(new CustomError('Failed to generate response from AI engine.', 502));
    }

    const resData = await response.json();
    const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate an answer at this moment. Please try again.';

    res.status(200).json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  askAssistant
};
