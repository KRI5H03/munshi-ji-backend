import type { Request, Response } from "express";
import { register } from "../services/auth.service.js";

export async function registerController(req: Request, res: Response) {
  const result = await register(req.body);
  res.status(201).json(result);
}
