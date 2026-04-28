import express from "express";
import dotenv from "dotenv";
import { createConsumer, TOPICS } from "@smart-city/shared";
import { handleComplaintEnriched } from "./consumers/notification.consumer.js";
import { handleStatusChanged } from "./consumers/notification.consumer.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.NOTIFICATION_PORT || 3004;

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

async function start() {
  await createConsumer(
    "notification-enriched-group",
    TOPICS.COMPLAINT_ENRICHED,
    handleComplaintEnriched
  );

  await createConsumer(
    "notification-status-group",
    TOPICS.COMPLAINT_STATUS_CHANGED,
    handleStatusChanged
  );

  console.log("Notification Service: Kafka consumers started");

  app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start notification service:", err);
  process.exit(1);
});
