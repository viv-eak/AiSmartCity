import { getPool } from "@smart-city/shared";
import { generate, embed } from "./ollama.service.js";
import { findSimilar } from "./embedding.service.js";

interface RagResponse {
  answer: string;
  sourceComplaintIds: string[];
}

export async function askQuestion(question: string): Promise<RagResponse> {
  const questionEmbedding = await embed(question);
  const similar = await findSimilar(questionEmbedding, 5);

  if (similar.length === 0) {
    return {
      answer: "I don't have any complaint records to reference yet.",
      sourceComplaintIds: [],
    };
  }

  const pool = getPool();
  const ids = similar.map((s) => s.complaint_id);
  const result = await pool.query(
    `SELECT id, description, category, priority, status, summary, created_at
     FROM complaints WHERE id = ANY($1)`,
    [ids]
  );

  const context = result.rows
    .map(
      (c) =>
        `- ${c.summary || c.description.slice(0, 200)} [Status: ${c.status}, Category: ${c.category || "unclassified"}, Priority: ${c.priority || "unknown"}] (ID: ${c.id})`
    )
    .join("\n");

  const prompt = `You are a smart city assistant helping citizens and officials understand civic complaint data. Use the following complaint records as context to answer the question.

Context:
${context}

Question: ${question}

Answer concisely based on the context. If the context doesn't contain relevant information, say so. Reference specific complaints when relevant.`;

  const answer = await generate(prompt);

  return {
    answer,
    sourceComplaintIds: ids,
  };
}
