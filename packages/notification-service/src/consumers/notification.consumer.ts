import {
  getPool,
  type KafkaEvent,
  type ComplaintEnrichedEvent,
  type ComplaintStatusChangedEvent,
} from "@smart-city/shared";
import { sendEmail } from "../services/email.service.js";

export async function handleComplaintEnriched(
  event: KafkaEvent
): Promise<void> {
  if (event.type !== "complaint.enriched") return;

  const { complaintId, category, priority, summary } =
    (event as ComplaintEnrichedEvent).payload;

  const pool = getPool();

  // Get complaint user's email
  const result = await pool.query(
    `SELECT u.email, u.name, u.id as user_id
     FROM complaints c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [complaintId]
  );

  if (result.rows.length === 0) return;

  const { email, name, user_id } = result.rows[0];

  const subject = `Complaint ${complaintId.slice(0, 8)} classified - ${category} (${priority})`;
  const body = `
    <h2>Your complaint has been processed</h2>
    <p>Hello ${name},</p>
    <p>Your complaint has been classified:</p>
    <ul>
      <li><strong>Category:</strong> ${category}</li>
      <li><strong>Priority:</strong> ${priority}</li>
      <li><strong>Summary:</strong> ${summary}</li>
    </ul>
    <p>We will keep you updated on the progress.</p>
  `;

  await sendEmail(email, subject, body);

  await pool.query(
    `INSERT INTO notifications (user_id, complaint_id, channel, subject)
     VALUES ($1, $2, 'email', $3)`,
    [user_id, complaintId, subject]
  );
}

export async function handleStatusChanged(event: KafkaEvent): Promise<void> {
  if (event.type !== "complaint.status-changed") return;

  const { complaintId, newStatus } =
    (event as ComplaintStatusChangedEvent).payload;

  const pool = getPool();

  const result = await pool.query(
    `SELECT u.email, u.name, u.id as user_id
     FROM complaints c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [complaintId]
  );

  if (result.rows.length === 0) return;

  const { email, name, user_id } = result.rows[0];

  const subject = `Complaint ${complaintId.slice(0, 8)} status updated: ${newStatus}`;
  const body = `
    <h2>Complaint Status Update</h2>
    <p>Hello ${name},</p>
    <p>Your complaint status has been updated to: <strong>${newStatus}</strong></p>
  `;

  await sendEmail(email, subject, body);

  await pool.query(
    `INSERT INTO notifications (user_id, complaint_id, channel, subject)
     VALUES ($1, $2, 'email', $3)`,
    [user_id, complaintId, subject]
  );
}
