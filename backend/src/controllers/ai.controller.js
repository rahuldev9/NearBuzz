import {
  chatWithAssistant,
  generateEventBannerPrompt,
  generateEventDescription,
  getChatHistory,
  recommendEventsForUser,
  searchEventsWithAi,
} from "../services/ai.service.js";

export const getRecommendedEvents = async (req, res) => {
  try {
    const recommendations = await recommendEventsForUser({
      userId: req.user.id,
      location: req.query.location || null,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateAiDescription = async (req, res) => {
  try {
    const { title, category, venue, date } = req.body;
    const description = await generateEventDescription({
      title,
      category,
      venue,
      date,
    });

    res.json({
      success: true,
      data: description,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateAiBanner = async (req, res) => {
  try {
    const { title, category, venue, date } = req.body;
    const prompt = await generateEventBannerPrompt({
      title,
      category,
      venue,
      date,
    });

    res.json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchEventsAi = async (req, res) => {
  try {
    const { query, events } = req.body;
    const suggestions = await searchEventsWithAi({ query, events });

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const chatWithAi = async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;
    const reply = await chatWithAssistant({
      userId: req.user.id,
      sessionId: sessionId || "default",
      message,
      context,
    });

    res.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAiChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const history = await getChatHistory({
      userId: req.user.id,
      sessionId: sessionId || "default",
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
