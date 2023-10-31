import jwt from "jsonwebtoken";
import "dotenv/config";

import { UnauthorizedError } from "../errors/index.js";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!(authHeader && authHeader.startsWith("Bearer "))) {
    throw new UnauthorizedError("Invalid authorization header structure");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, token };
    next();
  } catch (err) {
    throw new UnauthorizedError("Invalid auth token");
  }
};
