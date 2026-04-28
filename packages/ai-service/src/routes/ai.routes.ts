import { Router } from "express";
import { authMiddleware } from "@smart-city/shared";
import {
  askAssistant,
  findSimilarComplaints,
} from "../controllers/ai.controller.js";

export const aiRoutes = Router();

aiRoutes.post("/ask", authMiddleware, askAssistant);
aiRoutes.post("/similar", authMiddleware, findSimilarComplaints);
