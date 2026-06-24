import QRCode from "qrcode";

import Event from "../models/Event.js";
import EventBooking from "../models/EventBooking.js";
import User from "../models/User.js";

export const bookEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingBooking = await EventBooking.findOne({
      eventId: event._id,
      userId: user._id,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Already booked",
      });
    }

    // Create booking first
    const booking = await EventBooking.create({
      eventId: event._id,
      eventCode: event.eventId,
      userId: user._id,
      userEmail: user.email,
      qrCode: "pending",
    });

    // Create QR payload
    const qrPayload = JSON.stringify({
      bookingId: booking._id,
      eventCode: event.eventId,
    });

    const qrCode = await QRCode.toDataURL(qrPayload);

    booking.qrCode = qrCode;

    await booking.save();

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getBookingById = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id)
      .populate("eventId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await EventBooking.find({
      userId: req.user.id,
    })
      .populate("eventId")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventBookings = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view bookings for this event",
      });
    }

    const bookings = await EventBooking.find({
      eventId: event._id,
    })
      .populate("userId")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id).populate(
      "eventId",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.eventId) {
      return res.status(404).json({
        success: false,
        message: "Related event not found",
      });
    }

    // Allow deletion by either the event owner or the booking owner (cancellation)
    const isEventOwner = booking.eventId?.userId?.toString() === req.user.id;
    const isBookingOwner = booking.userId?.toString() === req.user.id;

    if (!isEventOwner && !isBookingOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this booking",
      });
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkInBooking = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.bookingStatus = "CheckedIn";

    await booking.save();

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyBooking = async (req, res) => {
  try {
    const { bookingId, eventCode } = req.body;

    const booking = await EventBooking.findById(bookingId)
      .populate("eventId")
      .populate("userId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR Code",
      });
    }

    if (booking.eventCode !== eventCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid Event Code",
      });
    }

    if (booking.qrStatus === "Expired") {
      return res.status(400).json({
        success: false,
        status: "Expired",
        message: "QR Code Already Used",
      });
    }

    booking.bookingStatus = "CheckedIn";
    booking.qrStatus = "Expired";
    booking.checkedInAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Check-in Successful",
      booking,
      eventId: booking.eventId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
