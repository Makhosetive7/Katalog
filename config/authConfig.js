const isProd = process.env.NODE_ENV === "production";

const parseBool = (value, defaultValue) => {
  if (value === undefined || value === "") return defaultValue;
  return value === "true";
};

const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authConfig = {
  env: process.env.NODE_ENV || "development",
  isProd,
  allowLocal: parseBool(process.env.AUTH_ALLOW_LOCAL, !isProd),
  allowDemo: parseBool(process.env.AUTH_ALLOW_DEMO, !isProd),
  allowGoogle:
    parseBool(process.env.AUTH_ALLOW_GOOGLE, true) && hasGoogleCredentials,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`,
  },
};

export const getPublicAuthConfig = () => ({
  env: authConfig.env,
  allowLocal: authConfig.allowLocal,
  allowDemo: authConfig.allowDemo,
  allowGoogle: authConfig.allowGoogle,
});
