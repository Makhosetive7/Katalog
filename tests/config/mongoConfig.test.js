import { jest } from "@jest/globals";

describe("mongoConfig", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it("uses MONGO_URL_DEV in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.MONGO_URL_DEV = "mongodb://localhost:27017/katalog-dev";
    process.env.MONGO_URL_PROD = "mongodb://localhost:27017/katalog-prod";

    const { resolveMongoUrl, getMongoEnvLabel } = await import(
      "../../config/mongoConfig.js"
    );

    expect(getMongoEnvLabel()).toBe("development");
    expect(resolveMongoUrl()).toBe("mongodb://localhost:27017/katalog-dev");
  });

  it("uses MONGO_URL_PROD in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.MONGO_URL_DEV = "mongodb://localhost:27017/katalog-dev";
    process.env.MONGO_URL_PROD = "mongodb://localhost:27017/katalog-prod";

    const { resolveMongoUrl, getMongoEnvLabel } = await import(
      "../../config/mongoConfig.js"
    );

    expect(getMongoEnvLabel()).toBe("production");
    expect(resolveMongoUrl()).toBe("mongodb://localhost:27017/katalog-prod");
  });

  it("falls back to MONGO_URL when env-specific var is missing", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.MONGO_URL_DEV;
    process.env.MONGO_URL = "mongodb://localhost:27017/katalog-shared";

    const { resolveMongoUrl } = await import("../../config/mongoConfig.js");

    expect(resolveMongoUrl()).toBe("mongodb://localhost:27017/katalog-shared");
  });

  it("extracts database name from connection string", async () => {
    const { getMongoDatabaseName } = await import("../../config/mongoConfig.js");

    expect(
      getMongoDatabaseName(
        "mongodb+srv://user:pass@cluster.mongodb.net/katalog-dev?retryWrites=true"
      )
    ).toBe("katalog-dev");
  });
});
