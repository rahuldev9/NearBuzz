import Event from "../models/Event.js";
import EventBooking from "../models/EventBooking.js";
import Notification from "../models/Notification.js";
export const createEvent = async (req, res) => {
  try {
    const { status, venueName, address, latitude, longitude } = req.body;

    if (status === "Live") {
      if (latitude == null || longitude == null) {
        return res.status(400).json({
          success: false,
          message: "Live events must include latitude and longitude.",
        });
      }
    }

    if (!venueName || !address) {
      return res.status(400).json({
        success: false,
        message: "Events require a venue name and address.",
      });
    }

    const eventId = await generateUniqueEventId();

    const event = await Event.create({
      ...req.body,
      eventId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1,
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    console.log(req.user.id);
    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this event",
      });
    }
    // Delete all bookings related to this event
    const bookings = await EventBooking.find({
      eventId: event._id,
    }).select("_id");

    // Delete booking notifications
    if (bookings.length > 0) {
      const bookingIds = bookings.map((b) => b._id);

      await Notification.deleteMany({
        "data.bookingId": {
          $in: bookingIds,
        },
      });
    }

    // Delete event notifications
    await Notification.deleteMany({
      eventId: event._id,
    });

    // Delete bookings
    await EventBooking.deleteMany({
      eventId: event._id,
    });

    // Delete event
    await event.deleteOne();

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    const { status, venueName, address, latitude, longitude } = req.body;
    const currentVenueName = venueName ?? event.venueName;
    const currentAddress = address ?? event.address;
    const currentLatitude = latitude ?? event.latitude;
    const currentLongitude = longitude ?? event.longitude;

    if (status === "Live") {
      if (currentLatitude == null || currentLongitude == null) {
        return res.status(400).json({
          success: false,
          message: "Live events must include latitude and longitude.",
        });
      }
    }

    if (!currentVenueName || !currentAddress) {
      return res.status(400).json({
        success: false,
        message: "Events require a venue name and address.",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateEventId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};
const generateUniqueEventId = async () => {
  let eventId;
  let exists = true;

  while (exists) {
    eventId = generateEventId();

    exists = await Event.exists({ eventId });
  }

  return eventId;
};
