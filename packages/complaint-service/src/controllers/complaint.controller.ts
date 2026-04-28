import type { Request, Response } from "express";
import {
  getPool,
  publishEvent,
  TOPICS,
  AppError,
  type ComplaintCreatedEvent,
  type ComplaintStatusChangedEvent,
} from "@smart-city/shared";

export async function createComplaint(
  req: Request,
  res: Response
): Promise<void> {
  const { description, location_lat, location_lng, address } = req.body;
  const userId = req.user!.id;
  const pool = getPool();

  const result = await pool.query(
    `INSERT INTO complaints (user_id, description, location_lat, location_lng, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, description, location_lat || null, location_lng || null, address || null]
  );

  const complaint = result.rows[0];

  await pool.query(
    `INSERT INTO complaint_events (complaint_id, event_type, actor_id)
     VALUES ($1, 'submitted', $2)`,
    [complaint.id, userId]
  );

  const event: ComplaintCreatedEvent = {
    type: "complaint.created",
    payload: {
      complaintId: complaint.id,
      userId,
      description,
      location:
        location_lat && location_lng
          ? { lat: location_lat, lng: location_lng }
          : undefined,
      createdAt: complaint.created_at.toISOString(),
    },
  };

  await publishEvent(TOPICS.COMPLAINT_CREATED, event, complaint.id);

  res.status(201).json(complaint);
}

export async function getComplaint(
  req: Request,
  res: Response
): Promise<void> {
  const pool = getPool();
  const result = await pool.query("SELECT * FROM complaints WHERE id = $1", [
    req.params.id as string,
  ]);

  if (result.rows.length === 0) {
    throw new AppError(404, "Complaint not found");
  }

  res.json(result.rows[0]);
}

export async function listComplaints(
  req: Request,
  res: Response
): Promise<void> {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const status = req.query.status as string | undefined;
  const category = req.query.category as string | undefined;
  const priority = req.query.priority as string | undefined;

  const pool = getPool();
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(status);
  }
  if (category) {
    conditions.push(`category = $${paramIdx++}`);
    params.push(category);
  }
  if (priority) {
    conditions.push(`priority = $${paramIdx++}`);
    params.push(priority);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM complaints ${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      [...params, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) as total FROM complaints ${where}`,
      params
    ),
  ]);

  res.json({
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].total, 10),
    },
  });
}

export async function updateStatus(
  req: Request,
  res: Response
): Promise<void> {
  const { status } = req.body;
  const pool = getPool();

  const current = await pool.query("SELECT * FROM complaints WHERE id = $1", [
    req.params.id as string,
  ]);
  if (current.rows.length === 0) {
    throw new AppError(404, "Complaint not found");
  }

  const oldStatus = current.rows[0].status;

  await pool.query(
    "UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2",
    [status, req.params.id as string]
  );

  await pool.query(
    `INSERT INTO complaint_events (complaint_id, event_type, actor_id, metadata)
     VALUES ($1, 'status_changed', $2, $3)`,
    [
      req.params.id as string,
      req.user!.id,
      JSON.stringify({ old_status: oldStatus, new_status: status }),
    ]
  );

  const event: ComplaintStatusChangedEvent = {
    type: "complaint.status-changed",
    payload: {
      complaintId: req.params.id as string,
      userId: req.user!.id,
      oldStatus,
      newStatus: status,
      changedAt: new Date().toISOString(),
    },
  };

  await publishEvent(TOPICS.COMPLAINT_STATUS_CHANGED, event, req.params.id as string);

  res.json({ ...current.rows[0], status });
}

export async function getTimeline(
  req: Request,
  res: Response
): Promise<void> {
  const pool = getPool();
  const result = await pool.query(
    `SELECT ce.*, u.name as actor_name
     FROM complaint_events ce
     LEFT JOIN users u ON ce.actor_id = u.id
     WHERE ce.complaint_id = $1
     ORDER BY ce.created_at ASC`,
    [req.params.id as string]
  );

  res.json(result.rows);
}
