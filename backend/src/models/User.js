import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9._]+$/,
        "Username can only use lowercase letters, numbers, periods, and underscores.",
      ],
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
      match: [
        /^(\+\d{1,3})?[6-9]\d{9}$/,
        "Phone must be 10 digits (6-9xxxxxxxxx) or with country code (+CC6-9xxxxxxxxx)",
      ],
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
