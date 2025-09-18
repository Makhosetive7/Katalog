import Joi from "joi";
export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};
