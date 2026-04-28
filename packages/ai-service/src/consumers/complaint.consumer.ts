import {
  getPool,
  publishEvent,
  TOPICS,
  type KafkaEvent,
  type ComplaintCreatedEvent,
  type ComplaintEnrichedEvent,
} from "@smart-city/shared";
import { classifyComplaint } from "../services/classifier.service.js";
import {
  generateAndStoreEmbedding,
  findDuplicate,
} from "../services/embedding.service.js";

export async function handleComplaintCreated(
  event: KafkaEvent
): Promise<void> {
  if (event.type !== "complaint.created") return;

  const { complaintId, description } = (event as ComplaintCreatedEvent).payload;
  console.log(`Processing complaint ${complaintId}...`);

  const pool = getPool();

  // Step 1: Classify
  const classification = await classifyComplaint(description);
  console.log(`Classified ${complaintId}:`, classification);

  // Step 2: Generate embedding
  const embedding = await generateAndStoreEmbedding(complaintId, description);

  // Step 3: Check for duplicates
  const duplicateOf = await findDuplicate(embedding, complaintId);

  // Step 4: Update complaint in DB
  const status = duplicateOf ? "duplicate" : "classified";
  await pool.query(
    `UPDATE complaints
     SET category = $1, priority = $2, summary = $3,
         ai_confidence = $4, duplicate_of = $5, status = $6,
         updated_at = NOW()
     WHERE id = $7`,
    [
      classification.category,
      classification.priority,
      classification.summary,
      classification.confidence,
      duplicateOf,
      status,
      complaintId,
    ]
  );

  // Step 5: Add timeline event
  await pool.query(
    `INSERT INTO complaint_events (complaint_id, event_type, metadata)
     VALUES ($1, 'classified', $2)`,
    [
      complaintId,
      JSON.stringify({
        category: classification.category,
        priority: classification.priority,
        confidence: classification.confidence,
        duplicate_of: duplicateOf,
      }),
    ]
  );

  // Step 6: Publish enriched event
  const enrichedEvent: ComplaintEnrichedEvent = {
    type: "complaint.enriched",
    payload: {
      complaintId,
      category: classification.category,
      priority: classification.priority,
      summary: classification.summary,
      duplicateOf: duplicateOf,
      confidence: classification.confidence,
    },
  };

  await publishEvent(TOPICS.COMPLAINT_ENRICHED, enrichedEvent, complaintId);
  console.log(`Complaint ${complaintId} enriched successfully`);
}
