import { Router } from "express";
import {
  validate,
  registerSchema,
  loginSchema,
  authMiddleware,
} from "@smart-city/shared";
import { register, login, getMe } from "../controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.get("/me", authMiddleware, getMe);
