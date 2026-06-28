import https from "https";
import { randomUUID } from "crypto";
import AiChatMessage from "../models/AiChatMessage.js";
import Event from "../models/Event.js";
import EventBooking from "../models/EventBooking.js";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

const buildGeminiRequest = (prompt, { temperature = 0.7 } = {}) => ({
  contents: [
    {
      parts: [
        {
          text: `You are NearBuzz AI, a helpful assistant for events and local discovery.\n\n${prompt}`,
        },
      ],
    },
  ],
  generationConfig: {
    temperature,
    maxOutputTokens: 800,
  },
});

const postToGemini = async (payload, model = "gemini-2.5-flash") => {
  if (!GOOGLE_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let response = "";
        res.on("data", (chunk) => {
          response += chunk;
        });
        res.on("end", () => {
          try {
            const data = JSON.parse(response);
            if (!res.statusCode || res.statusCode >= 400) {
              reject(
                new Error(data?.error?.message || "Gemini request failed"),
              );
              return;
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            resolve(text);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

const generateImageWithGemini = async (prompt) => {
  if (!GOOGLE_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: {
      candidate_count: 1,
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/imagen-3.0-generate-002:predict?key=${GOOGLE_API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let response = "";
        res.on("data", (chunk) => {
          response += chunk;
        });
        res.on("end", () => {
          try {
            const data = JSON.parse(response);
            if (!res.statusCode || res.statusCode >= 400) {
              reject(
                new Error(data?.error?.message || "Image generation failed"),
              );
              return;
            }

            const imageBase64 =
              data?.predictions?.[0]?.bytesBase64Encoded || "";
            resolve(imageBase64 ? `data:image/png;base64,${imageBase64}` : "");
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

const normalizeEventForPrompt = (event) => ({
  title: event.title,
  category: event.category,
  description: event.description,
  venueName: event.venueName,
  address: event.address,
  startDate: event.startDate,
  status: event.status,
});

const normalizeChatMessages = (documents) =>
  documents
    .flatMap((document) => {
      if (Array.isArray(document.messages) && document.messages.length > 0) {
        return document.messages;
      }

      if (document.role && document.content) {
        return [
          {
            _id: document._id,
            sessionId: document.sessionId || "default",
            role: document.role,
            content: document.content,
            feature: document.feature || "chat",
            createdAt: document.createdAt,
          },
        ];
      }

      return [];
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

const makeSessionTitle = (message = "") => {
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 42 ? `${clean.slice(0, 39)}...` : clean;
};

const buildSessionsFromMessages = (messages = [], existingSessions = []) => {
  const sessionMap = new Map();
  const messageCounts = new Map();

  existingSessions.forEach((session) => {
    if (!session?.sessionId) return;
    sessionMap.set(session.sessionId, {
      sessionId: session.sessionId,
      title: session.title || "New chat",
      lastMessage: session.lastMessage || "",
      messageCount: session.messageCount || 0,
      createdAt: session.createdAt || new Date(),
      updatedAt: session.updatedAt || session.createdAt || new Date(),
    });
  });

  messages.forEach((message) => {
    const sessionId = message.sessionId || "default";
    const existing = sessionMap.get(sessionId);
    const createdAt = message.createdAt || new Date();
    const messageCount = (messageCounts.get(sessionId) || 0) + 1;
    messageCounts.set(sessionId, messageCount);

    sessionMap.set(sessionId, {
      sessionId,
      title:
        existing?.title && existing.title !== "New chat"
          ? existing.title
          : makeSessionTitle(message.content),
      lastMessage: message.content || existing?.lastMessage || "",
      messageCount,
      createdAt: existing?.createdAt || createdAt,
      updatedAt: createdAt,
    });
  });

  return [...sessionMap.values()].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
};

const getUserChatMessages = async (userId, { consolidate = false } = {}) => {
  const chatDocuments = await AiChatMessage.find({ userId })
    .sort({ createdAt: 1 })
    .lean();
  const messages = normalizeChatMessages(chatDocuments);

  if (consolidate && chatDocuments.length > 0) {
    const [primaryDocument, ...duplicateDocuments] = chatDocuments;

    await AiChatMessage.updateOne(
      { _id: primaryDocument._id },
      {
        $set: {
          messages,
          sessions: buildSessionsFromMessages(
            messages,
            primaryDocument.sessions || [],
          ),
        },
        $unset: {
          sessionId: "",
          role: "",
          content: "",
          feature: "",
        },
      },
    );

    if (duplicateDocuments.length > 0) {
      await AiChatMessage.deleteMany({
        _id: { $in: duplicateDocuments.map((document) => document._id) },
      });
    }
  }

  return messages;
};

const ensureUserChatDocument = async (userId) => {
  await getUserChatMessages(userId, { consolidate: true });

  return AiChatMessage.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, messages: [], sessions: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
};

const ensureChatSession = async ({ userId, sessionId, title }) => {
  const document = await ensureUserChatDocument(userId);
  const now = new Date();
  const sessions = document.sessions || [];
  const hasSession = sessions.some((session) => session.sessionId === sessionId);

  if (hasSession) return;

  await AiChatMessage.updateOne(
    { userId },
    {
      $push: {
        sessions: {
          sessionId,
          title: title || "New chat",
          lastMessage: "",
          messageCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
  );
};

export const generateEventDescription = async ({
  title,
  category,
  venue,
  date,
}) => {
  const prompt = `Write a polished event description in 2 short paragraphs for a local events app. Use the following details: title=${title || "Event"}, category=${category || "General"}, venue=${venue || "TBD"}, date=${date || "TBD"}. Keep it professional, enticing, and concise.`;

  const content = await postToGemini(buildGeminiRequest(prompt));
  return content.trim();
};

export const generateEventBannerPrompt = async ({
  title,
  category,
  venue,
  date,
}) => {
  const prompt = `Create a polished event poster concept for ${title || "an event"}, category ${category || "general"}, venue ${venue || "local venue"}, date ${date || "upcoming"}. Make it visually rich, modern, and suitable as a banner image.`;
  const imageBase64 = await generateImageWithGemini(prompt);
  return imageBase64 || prompt;
};

export const recommendEventsForUser = async ({ userId }) => {
  const [events, bookings] = await Promise.all([
    Event.find({ status: { $ne: "Closed" } })
      .sort({ startDate: 1 })
      .lean(),
    EventBooking.find({ userId }).populate("eventId", "_id category").lean(),
  ]);

  // Already booked event IDs
  const bookedEventIds = new Set(
    bookings.map((booking) => booking.eventId?._id?.toString()).filter(Boolean),
  );

  // User's preferred categories
  const bookedCategories = [
    ...new Set(
      bookings.map((booking) => booking.eventId?.category).filter(Boolean),
    ),
  ];

  // If user has never booked an event
  if (bookedCategories.length === 0) {
    return [];
  }

  const recommendations = events
    .filter(
      (event) =>
        bookedCategories.includes(event.category) &&
        !bookedEventIds.has(event._id.toString()),
    )
    .sort((a, b) => {
      // Live events first
      if (a.status === "Live" && b.status !== "Live") return -1;
      if (b.status === "Live" && a.status !== "Live") return 1;

      // Then nearest upcoming
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    })
    .slice(0, 6);

  return recommendations.map(normalizeEventForPrompt);
};
export const searchEventsWithAi = async ({ query, events }) => {
  const prompt = `You are helping a user discover events. User request: ${query}. Available events: ${events.map((event) => `${event.title} | ${event.category} | ${event.description} | ${event.venueName || ""} | ${event.address || ""}`).join("; ")}. Return 5 concise event recommendations in JSON with fields title, reason, category, venueName, address.`;

  const content = await postToGemini(buildGeminiRequest(prompt));
  const text = content.trim();
  const match = text.match(/\[[\s\S]*\]/);

  if (!match) {
    return [];
  }

  try {
    return JSON.parse(match[0]);
  } catch (error) {
    return [];
  }
};

export const chatWithAssistant = async ({
  userId,
  sessionId,
  message,
  context = {},
}) => {
  await ensureChatSession({
    userId,
    sessionId,
    title: makeSessionTitle(message),
  });
  await AiChatMessage.updateOne(
    { userId },
    {
      $set: {
        "sessions.$[session].title": makeSessionTitle(message),
      },
    },
    {
      arrayFilters: [
        {
          "session.sessionId": sessionId,
          "session.title": { $in: ["", "New chat"] },
        },
      ],
    },
  );

  const allMessages = await getUserChatMessages(userId, { consolidate: true });
  const history = allMessages.filter((item) => item.sessionId === sessionId);
  const recentMessages = history
    .slice(-6)
    .map((item) => ({ role: item.role, content: item.content }));

  const events = await Event.find({}).sort({ createdAt: -1 }).lean();
  const bookings = await EventBooking.find({ userId })
    .populate("eventId", "title category")
    .lean();

  const prompt = `You are NearBuzz AI. Answer the user's question briefly and helpfully. Context: ${JSON.stringify({ context, bookings: bookings.slice(0, 5).map((booking) => ({ title: booking.eventId?.title, status: booking.bookingStatus })) })}. Recent conversation: ${JSON.stringify(recentMessages)}. User question: ${message}. If asked about nearby events, mention that the app shows available events and recommends local activities. Do not mention API limitations unless necessary.`;

  const response = await postToGemini(
    buildGeminiRequest(prompt, { temperature: 0.8 }),
  );

  const now = new Date();
  const assistantReply = response.trim();

  await AiChatMessage.findOneAndUpdate(
    { userId },
    {
      $push: {
        messages: {
          $each: [
            {
              sessionId,
              role: "user",
              content: message,
              feature: "chat",
            },
            {
              sessionId,
              role: "assistant",
              content: assistantReply,
              feature: "chat",
            },
          ],
        },
      },
      $set: {
        "sessions.$[session].lastMessage": assistantReply,
        "sessions.$[session].updatedAt": now,
      },
      $inc: {
        "sessions.$[session].messageCount": 2,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      sort: { createdAt: 1 },
      arrayFilters: [{ "session.sessionId": sessionId }],
    },
  );

  return assistantReply;
};

export const getChatHistory = async ({ userId, sessionId }) => {
  const allMessages = await getUserChatMessages(userId, { consolidate: true });
  return allMessages.filter((item) => item.sessionId === sessionId);
};

export const listChatSessions = async ({ userId }) => {
  const document = await ensureUserChatDocument(userId);
  const messages = await getUserChatMessages(userId, { consolidate: true });
  const sessions = buildSessionsFromMessages(messages, document.sessions || []);

  await AiChatMessage.updateOne({ userId }, { $set: { sessions } });

  return sessions;
};

export const createChatSession = async ({ userId, title = "New chat" }) => {
  const sessionId = `chat-${randomUUID()}`;
  await ensureChatSession({ userId, sessionId, title });

  return {
    sessionId,
    title,
    lastMessage: "",
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const renameChatSession = async ({ userId, sessionId, title }) => {
  const cleanTitle = makeSessionTitle(title);
  await ensureChatSession({ userId, sessionId, title: cleanTitle });
  await AiChatMessage.updateOne(
    { userId },
    {
      $set: {
        "sessions.$[session].title": cleanTitle,
        "sessions.$[session].updatedAt": new Date(),
      },
    },
    { arrayFilters: [{ "session.sessionId": sessionId }] },
  );

  return { sessionId, title: cleanTitle };
};

export const deleteChatSession = async ({ userId, sessionId }) => {
  await ensureUserChatDocument(userId);
  await AiChatMessage.updateOne(
    { userId },
    {
      $pull: {
        sessions: { sessionId },
        messages: { sessionId },
      },
    },
  );

  return { sessionId };
};
