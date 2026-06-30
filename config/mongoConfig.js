const isProd = process.env.NODE_ENV === "production";

const pickFirst = (...values) =>
  values.find((value) => typeof value === "string" && value.trim());

export const getMongoEnvLabel = () => (isProd ? "production" : "development");

export const resolveMongoUrl = () => {
  const shared = pickFirst(
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    process.env.DATABASE_URL
  );

  if (isProd) {
    return pickFirst(process.env.MONGO_URL_PROD, shared);
  }

  return pickFirst(process.env.MONGO_URL_DEV, shared);
};

export const getMongoDatabaseName = (mongoUrl) => {
  if (!mongoUrl) return "unknown";

  try {
    const pathname = new URL(mongoUrl).pathname.replace(/^\//, "");
    return pathname.split("/")[0] || "unknown";
  } catch {
    const match = mongoUrl.match(/\/([^/?]+)(?:\?|$)/);
    return match?.[1] || "unknown";
  }
};
