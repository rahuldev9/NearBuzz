import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import Event from "../models/Event.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  const smStream = new SitemapStream({
    hostname: "https://nearbuzz.vercel.app",
  });

  // Static pages
  smStream.write({ url: "/", changefreq: "daily", priority: 1.0 });
  smStream.write({ url: "/login" });
  smStream.write({ url: "/register" });
  smStream.write({ url: "/search" });

  // Dynamic event pages
  const events = await Event.find({}, "_id updatedAt");

  events.forEach((event) => {
    smStream.write({
      url: `/event-details/${event._id}`,
      lastmod: event.updatedAt,
      changefreq: "daily",
      priority: 0.8,
    });
  });

  smStream.end();

  const sitemap = await streamToPromise(smStream);

  res.header("Content-Type", "application/xml");
  res.send(sitemap.toString());
});

export default router;
