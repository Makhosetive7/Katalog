import Joi from "joi";

// Registration validation schema
export const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "Username can only contain letters, numbers, and underscores",
      }),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least 1 uppercase, 1 lowercase, and 1 number",
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
  });

  return schema.validate(data);
};