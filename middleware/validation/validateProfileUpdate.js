import Joi from "joi";

export const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    bio: Joi.string().max(500),
    readingPreferences: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};
