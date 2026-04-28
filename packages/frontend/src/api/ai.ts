import client from "./client";

export async function askQuestion(question: string) {
  const { data } = await client.post("/ai/ask", { question });
  return data;
}

export async function findSimilar(text: string) {
  const { data } = await client.post("/ai/similar", { text });
  return data;
}
