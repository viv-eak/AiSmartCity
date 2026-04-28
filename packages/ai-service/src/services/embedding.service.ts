import { getPool } from "@smart-city/shared";
import { embed } from "./ollama.service.js";
import pgvector from "pgvector";

export async function generateAndStoreEmbedding(
  complaintId: string,
  text: string
): Promise<number[]> {
  const embedding = await embed(text);
  const pool = getPool();

  await pool.query(
    `INSERT INTO complaint_embeddings (complaint_id, embedding)
     VALUES ($1, $2)
     ON CONFLICT (complaint_id) DO UPDATE SET embedding = $2`,
    [complaintId, pgvector.toSql(embedding)]
  );

  return embedding;
}

export async function findSimilar(
  embedding: number[],
  limit = 5,
  excludeId?: string
): Promise<Array<{ complaint_id: string; similarity: number }>> {
  const pool = getPool();

  const excludeClause = excludeId
    ? `WHERE ce.complaint_id != $2`
    : "";
  const params: unknown[] = [pgvector.toSql(embedding)];
  if (excludeId) params.push(excludeId);

  const result = await pool.query(
    `SELECT ce.complaint_id,
            1 - (ce.embedding <=> $1) as similarity
     FROM complaint_embeddings ce
     ${excludeClause}
     ORDER BY ce.embedding <=> $1
     LIMIT ${limit}`,
    params
  );

  return result.rows;
}

export async function findDuplicate(
  embedding: number[],
  complaintId: string,
  threshold = 0.92
): Promise<string | null> {
  const similar = await findSimilar(embedding, 1, complaintId);
  if (similar.length > 0 && similar[0].similarity >= threshold) {
    return similar[0].complaint_id;
  }
  return null;
}
