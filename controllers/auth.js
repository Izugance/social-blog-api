import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

import { User } from "../models/User.js";
import { UnauthorizedError, BadRequestError } from "../errors/index.js";

/** POST */
const register = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  const token = await user.genJWT();
  res.status(StatusCodes.CREATED).json({ userId: user._id, token });
});

/** GET */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!(user && user.comparePassword(password)))
    throw new UnauthorizedError("Invalid credentials");

  const token = await user.genJWT();
  res.status(StatusCodes.OK).json({ userId: user._id, token });
});

// Logging out should be handled by the frontend. The stored token should be
// cleared.

export { register, login };
