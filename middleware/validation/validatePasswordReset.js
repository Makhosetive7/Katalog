import Joi from "joi"

export const validatePasswordReset = (data) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  });

  return schema.validate(data);
};