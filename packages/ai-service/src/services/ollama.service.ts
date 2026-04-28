const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

export async function generate(
  prompt: string,
  model = "llama3"
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generate failed: ${response.status}`);
  }

  const data = (await response.json()) as { response: string };
  return data.response;
}

export async function embed(
  text: string,
  model = "nomic-embed-text"
): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embed failed: ${response.status}`);
  }

  const data = (await response.json()) as { embedding: number[] };
  return data.embedding;
}
