import express from "express";
import dotenv from "dotenv";
import { errorHandler, createConsumer, TOPICS } from "@smart-city/shared";
import { aiRoutes } from "./routes/ai.routes.js";
import { handleComplaintCreated } from "./consumers/complaint.consumer.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.AI_PORT || 3003;

app.use(express.json());
app.use("/api/ai", aiRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-service" });
});
app.use(errorHandler);

async function start() {
  await createConsumer(
    "ai-service-group",
    TOPICS.COMPLAINT_CREATED,
    handleComplaintCreated
  );
  console.log("AI Service: Kafka consumer started");

  app.listen(PORT, () => {
    console.log(`AI service running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start AI service:", err);
  process.exit(1);
});
