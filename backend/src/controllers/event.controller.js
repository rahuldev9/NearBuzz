import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
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
