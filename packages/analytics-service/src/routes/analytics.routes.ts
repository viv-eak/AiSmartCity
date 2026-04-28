import { Router } from "express";
import {
  getSummary,
  getTrends,
  getCategoryBreakdown,
} from "../services/analytics.service.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/summary", async (_req, res) => {
  const summary = await getSummary();
  res.json(summary);
});

analyticsRoutes.get("/trends", async (req, res) => {
  const days = parseInt((req.query.days as string) || "30", 10);
  const trends = await getTrends(days);
  res.json(trends);
});

analyticsRoutes.get("/category-breakdown", async (_req, res) => {
  const breakdown = await getCategoryBreakdown();
  res.json(breakdown);
});
