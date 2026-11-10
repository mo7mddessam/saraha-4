import Joi from "joi";

const email = Joi.string().email().required();
const password = Joi.string()
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
  .message("Password must be at least 8 characters with letters and numbers")
  .required();

export const signup = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(20).required(),
    lastName: Joi.string().min(2).max(20).required(),
    email,
    password,
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/).message("Invalid Egyptian phone number"),
    gender: Joi.string().valid("male", "female"),
  }),
};

export const confirmEmail = {
  body: Joi.object({ email, otp: Joi.string().length(6).required() }),
};

export const login = {
  body: Joi.object({ email, password: Joi.string().required() }),
};

export const forgotPassword = { body: Joi.object({ email }) };

export const resetPassword = {
  body: Joi.object({
    email,
    otp: Joi.string().length(6).required(),
    newPassword: password,
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};
