import Joi from "joi";

const objectId = Joi.string().hex().length(24).required();

export const updateProfile = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(20),
    lastName: Joi.string().min(2).max(20),
    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/),
    gender: Joi.string().valid("male", "female"),
  }).min(1),
};

export const changePassword = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/).required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

export const idParam = { params: Joi.object({ id: objectId }) };
