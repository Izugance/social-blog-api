import { StatusCodes } from "http-status-codes";

import { BaseAPIError } from "./base.js";

export class UnauthorizedError extends BaseAPIError {
  constructor(msg) {
    super(msg);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
