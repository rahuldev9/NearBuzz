import https from "https";
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
  const history = await AiChatMessage.find({ userId, sessionId })
    .sort({ createdAt: 1 })
    .lean();
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

  await AiChatMessage.create([
    { userId, sessionId, role: "user", content: message, feature: "chat" },
    {
      userId,
      sessionId,
      role: "assistant",
      content: response.trim(),
      feature: "chat",
    },
  ]);

  return response.trim();
};

export const getChatHistory = async ({ userId, sessionId }) => {
  const messages = await AiChatMessage.find({ userId, sessionId })
    .sort({ createdAt: 1 })
    .lean();
  return messages;
};
