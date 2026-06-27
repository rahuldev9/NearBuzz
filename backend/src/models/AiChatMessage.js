import mongoose from "mongoose";

const aiChatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AiChatMessage", aiChatMessageSchema);
