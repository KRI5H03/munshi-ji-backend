import type { Request, Response } from "express";
import { login, register } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

export async function registerController(req: Request, res: Response) {
  if (process.env.ALLOW_REGISTER !== "true") {
    throw new AppError(403, "REGISTER_DISABLED", "Sign-up is closed.");
  }
  const result = await register(req.body);
  res.status(201).json(result);
}

export async function loginController(req: Request, res: Response) {
  const result = await login(req.body);
  res.status(200).json(result);
}

export async function meController(req: Request, res: Response) {
  res.status(200).json({ userId: req.userId });
}
