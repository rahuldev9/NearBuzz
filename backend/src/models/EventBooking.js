import mongoose from "mongoose";

const eventBookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    eventCode: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
    },

    qrCode: {
      type: String,
      required: true,
    },

    qrStatus: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active",
    },

    bookingStatus: {
      type: String,
      enum: ["Booked", "CheckedIn"],
      default: "Booked",
    },

    checkedInAt: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("EventBooking", eventBookingSchema);
