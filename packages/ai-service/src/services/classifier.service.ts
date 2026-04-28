import { generate } from "./ollama.service.js";

interface ClassificationResult {
  category: string;
  priority: string;
  summary: string;
  confidence: number;
}

const CLASSIFY_PROMPT = `You are a civic complaint classifier. Given the complaint below, respond with ONLY a valid JSON object, no other text.

Categories: roads, water_supply, electricity, sanitation, public_safety, parks, noise, other
Priorities: low, medium, high, critical

Complaint: "{description}"

Respond with exactly this JSON format:
{"category": "...", "priority": "...", "summary": "one sentence summary", "confidence": 0.0}

The confidence should be between 0.0 and 1.0 based on how certain you are about the classification.`;

export async function classifyComplaint(
  description: string
): Promise<ClassificationResult> {
  const prompt = CLASSIFY_PROMPT.replace("{description}", description);

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await generate(prompt);
      return parseClassification(response);
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error("Classification failed after 3 attempts:", err);
        return {
          category: "unclassified",
          priority: "medium",
          summary: description.slice(0, 200),
          confidence: 0,
        };
      }
      await new Promise((r) => setTimeout(r, 1000 * (3 - retries)));
    }
  }

  return {
    category: "unclassified",
    priority: "medium",
    summary: description.slice(0, 200),
    confidence: 0,
  };
}

function parseClassification(response: string): ClassificationResult {
  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(response);
    return validateResult(parsed);
  } catch {
    // Try extracting JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return validateResult(parsed);
    }
    throw new Error("Could not parse classification response");
  }
}

const VALID_CATEGORIES = new Set([
  "roads", "water_supply", "electricity", "sanitation",
  "public_safety", "parks", "noise", "other",
]);

const VALID_PRIORITIES = new Set(["low", "medium", "high", "critical"]);

function validateResult(parsed: Record<string, unknown>): ClassificationResult {
  const category = VALID_CATEGORIES.has(parsed.category as string)
    ? (parsed.category as string)
    : "other";
  const priority = VALID_PRIORITIES.has(parsed.priority as string)
    ? (parsed.priority as string)
    : "medium";

  return {
    category,
    priority,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    confidence: typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5,
  };
}
