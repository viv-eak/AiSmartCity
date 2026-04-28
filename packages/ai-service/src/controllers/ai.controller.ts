import type { Request, Response } from "express";
import { AppError } from "@smart-city/shared";
import { askQuestion } from "../services/rag.service.js";
import { embed } from "../services/ollama.service.js";
import { findSimilar } from "../services/embedding.service.js";

export async function askAssistant(
  req: Request,
  res: Response
): Promise<void> {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    throw new AppError(400, "Question is required");
  }

  const result = await askQuestion(question);
  res.json(result);
}

export async function findSimilarComplaints(
  req: Request,
  res: Response
): Promise<void> {
  const { text, limit } = req.body;
  if (!text || typeof text !== "string") {
    throw new AppError(400, "Text is required");
  }

  const embedding = await embed(text);
  const similar = await findSimilar(embedding, limit || 5);
  res.json(similar);
}
