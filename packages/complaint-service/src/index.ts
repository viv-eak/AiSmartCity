import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "@smart-city/shared";
import { complaintRoutes } from "./routes/complaint.routes.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.COMPLAINT_PORT || 3002;

app.use(express.json());
app.use("/api/complaints", complaintRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "complaint-service" });
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Complaint service running on port ${PORT}`);
});
