import {
  chatWithAssistant,
  createChatSession,
  deleteChatSession,
  generateEventBannerPrompt,
  generateEventDescription,
  getChatHistory,
  listChatSessions,
  recommendEventsForUser,
  renameChatSession,
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

export const getAiChatSessions = async (req, res) => {
  try {
    const sessions = await listChatSessions({ userId: req.user.id });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createAiChatSession = async (req, res) => {
  try {
    const session = await createChatSession({
      userId: req.user.id,
      title: req.body?.title || "New chat",
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAiChatSession = async (req, res) => {
  try {
    const session = await renameChatSession({
      userId: req.user.id,
      sessionId: req.params.sessionId,
      title: req.body?.title || "New chat",
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeAiChatSession = async (req, res) => {
  try {
    const session = await deleteChatSession({
      userId: req.user.id,
      sessionId: req.params.sessionId,
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
