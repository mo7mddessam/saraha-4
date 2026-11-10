import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, _res, next) => {
  const errors = [];
  for (const key of ["body", "params", "query"]) {
    if (!schema[key]) continue;
    const { error, value } = schema[key].validate(req[key], { abortEarly: false });
    if (error) errors.push(...error.details.map((d) => d.message));
    else if (key === "body") req.body = value;
  }
  if (errors.length) return next(new AppError(errors.join(" | "), 400));
  next();
};
