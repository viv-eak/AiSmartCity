import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getPool, signToken, AppError } from "@smart-city/shared";

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;
  const pool = getPool();

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'citizen')
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const pool = getPool();

  const result = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError(401, "Invalid email or password");
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const pool = getPool();
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [req.user!.id]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "User not found");
  }

  res.json(result.rows[0]);
}
