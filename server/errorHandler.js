export const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  const message =
    NODE_ENV === "DEVELOPMENT" ? error.message : "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
