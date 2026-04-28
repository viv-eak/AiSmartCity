import { Router } from "express";
import {
  authMiddleware,
  adminMiddleware,
  validate,
  validateQuery,
  createComplaintSchema,
  updateStatusSchema,
  listComplaintsSchema,
} from "@smart-city/shared";
import {
  createComplaint,
  getComplaint,
  listComplaints,
  updateStatus,
  getTimeline,
} from "../controllers/complaint.controller.js";

export const complaintRoutes = Router();

complaintRoutes.use(authMiddleware);

complaintRoutes.post("/", validate(createComplaintSchema), createComplaint);
complaintRoutes.get("/", validateQuery(listComplaintsSchema), listComplaints);
complaintRoutes.get("/:id", getComplaint);
complaintRoutes.patch(
  "/:id/status",
  adminMiddleware,
  validate(updateStatusSchema),
  updateStatus
);
complaintRoutes.get("/:id/timeline", getTimeline);
