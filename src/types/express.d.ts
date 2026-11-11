declare global {
  namespace Express {
    interface Request {
      userId?: string;
      businessId?: string;
      role?: "owner" | "staff";
    }
  }
}

export {};
