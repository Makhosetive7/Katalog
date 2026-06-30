export const sendError = (res, status, code, message, field = null) => {
  const body = { code, message };
  if (field) body.field = field;
  return res.status(status).json(body);
};

export const sendNotFound = (res, message = "Resource not found") =>
  sendError(res, 404, "NOT_FOUND", message);

export const sendForbidden = (res, message = "Not authorized") =>
  sendError(res, 403, "FORBIDDEN", message);

export const sendBadRequest = (res, message, field = null) =>
  sendError(res, 400, "BAD_REQUEST", message, field);
