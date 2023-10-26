import { StatusCodes } from "http-status-codes";

export default (req, res, next) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    msg:
      "Requested endpoint does not exist. Check if you're using the" +
      "required method or mispelled the URL",
  });
};
