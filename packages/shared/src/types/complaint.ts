import { z } from "zod";

export const ComplaintStatus = {
  SUBMITTED: "submitted",
  CLASSIFIED: "classified",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
  DUPLICATE: "duplicate",
} as const;

export type ComplaintStatus =
  (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

export const ComplaintCategory = {
  ROADS: "roads",
  WATER_SUPPLY: "water_supply",
  ELECTRICITY: "electricity",
  SANITATION: "sanitation",
  PUBLIC_SAFETY: "public_safety",
  PARKS: "parks",
  NOISE: "noise",
  OTHER: "other",
  UNCLASSIFIED: "unclassified",
} as const;

export type ComplaintCategory =
  (typeof ComplaintCategory)[keyof typeof ComplaintCategory];

export const ComplaintPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ComplaintPriority =
  (typeof ComplaintPriority)[keyof typeof ComplaintPriority];

export interface Complaint {
  id: string;
  user_id: string;
  description: string;
  category: ComplaintCategory | null;
  priority: ComplaintPriority | null;
  status: ComplaintStatus;
  summary: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  duplicate_of: string | null;
  ai_confidence: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface ComplaintEvent {
  id: string;
  complaint_id: string;
  event_type: string;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export const createComplaintSchema = z.object({
  description: z.string().min(10).max(5000),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  address: z.string().max(500).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "submitted",
    "classified",
    "in_progress",
    "resolved",
    "closed",
    "duplicate",
  ]),
});

export const listComplaintsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
});
