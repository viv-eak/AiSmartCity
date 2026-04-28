import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

app.use(cors());

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
  })
);

app.use(
  "/api/complaints",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
  })
);

app.use(
  "/api/ai",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
  })
);

app.use(
  "/api/analytics",
  createProxyMiddleware({
    target: "http://localhost:3005",
    changeOrigin: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
