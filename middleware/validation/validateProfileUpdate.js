import Joi from "joi";

export const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50).allow(""),
    lastName: Joi.string().max(50).allow(""),
    bio: Joi.string().max(500).allow(""),
    readingPreferences: Joi.array().items(Joi.string()),
    preferences: Joi.object({
      emailNotifications: Joi.boolean(),
      privacy: Joi.string().valid("public", "private", "friends-only"),
    }),
  });

  return schema.validate(data);
};
