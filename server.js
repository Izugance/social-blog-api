import express from "express";
import asyncHandler from "express-async-handler";
import { createServer } from "node:http";
import { StatusCodes } from "http-status-codes";
import rateLimiter from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import xssClean from "xss-clean"; // Deprecated.
import "dotenv/config";

import connectDB from "./config/connectDB.js";
import controllerErrorHandler from "./middleware/controller-error-handler.js";
import endpointNotFoundMiddleware from "./middleware/endpoint-not-found.js";
import authRouter from "./routes/auth.js";
import blogRouter from "./routes/blog.js";
import userRouter from "./routes/user.js";

const app = express();

// -----System health-----
app.set("trust proxy", 1);
app.use(
  // What window algorithm do they use?
  rateLimiter({
    windowMs: 5 * 60 * 1000, // min, sec/min, ms/sec.
    max: 64,
  })
);
app.use(cors());
app.use(helmet());
app.use(xssClean());

// -----Routes-----
const apiRoot = "/api/v1";

app.use(apiRoot + "/auth", authRouter);
app.use(apiRoot + "/blog", blogRouter);
app.use(apiRoot + "/user", userRouter);
app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.status(StatusCodes.OK).send("Welcome to the Blog API");
  })
);

// -----Middleware-----
app.use(controllerErrorHandler);
app.use(endpointNotFoundMiddleware);

// -----Server set-up-----
const PORT = process.env.PORT || 3000;
const server = createServer(app);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
};

start();
