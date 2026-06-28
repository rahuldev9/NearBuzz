import mongoose from "mongoose";

const aiChatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "New chat",
    },
    lastMessage: {
      type: String,
      default: "",
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const aiChatMessageItemSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: "default",
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    feature: {
      type: String,
      default: "chat",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const aiChatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    messages: {
      type: [aiChatMessageItemSchema],
      default: [],
    },
    sessions: {
      type: [aiChatSessionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AiChatMessage", aiChatMessageSchema);
