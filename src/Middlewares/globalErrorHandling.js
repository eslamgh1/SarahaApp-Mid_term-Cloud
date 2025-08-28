export const globalErrorHandling = (err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err["cause"] || 500)
    .json({ message: err.message, stack: err.stack, error: err });
};
