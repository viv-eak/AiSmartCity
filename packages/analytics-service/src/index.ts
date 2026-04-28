import express from "express";
import dotenv from "dotenv";
import { errorHandler, authMiddleware } from "@smart-city/shared";
import { analyticsRoutes } from "./routes/analytics.routes.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.ANALYTICS_PORT || 3005;

app.use(express.json());
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "analytics-service" });
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});
