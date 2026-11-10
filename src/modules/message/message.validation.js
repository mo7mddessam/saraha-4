import Joi from "joi";

const objectId = Joi.string().hex().length(24).required();

export const sendMessage = {
  params: Joi.object({ receiverId: objectId }),
  body: Joi.object({ content: Joi.string().min(1).max(2000).required() }),
};

export const idParam = { params: Joi.object({ id: objectId }) };
