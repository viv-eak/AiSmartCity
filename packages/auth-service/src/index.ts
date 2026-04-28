import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "@smart-city/shared";
import { authRoutes } from "./routes/auth.routes.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
