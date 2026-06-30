import { jest } from "@jest/globals";

describe("authConfig", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it("enables local and demo auth in development by default", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.AUTH_ALLOW_LOCAL;
    delete process.env.AUTH_ALLOW_DEMO;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { getPublicAuthConfig } = await import("../../config/authConfig.js");
    const config = getPublicAuthConfig();

    expect(config.env).toBe("development");
    expect(config.allowLocal).toBe(true);
    expect(config.allowDemo).toBe(true);
    expect(config.allowGoogle).toBe(false);
  });

  it("keeps local auth enabled in production by default", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.AUTH_ALLOW_LOCAL;
    delete process.env.AUTH_ALLOW_DEMO;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { getPublicAuthConfig } = await import("../../config/authConfig.js");
    const config = getPublicAuthConfig();

    expect(config.allowLocal).toBe(true);
    expect(config.allowDemo).toBe(false);
  });

  it("can disable local auth in production when configured", async () => {
    process.env.NODE_ENV = "production";
    process.env.AUTH_ALLOW_LOCAL = "false";

    const { getPublicAuthConfig } = await import("../../config/authConfig.js");
    const config = getPublicAuthConfig();

    expect(config.allowLocal).toBe(false);
  });

  it("enables Google when credentials are present", async () => {
    process.env.NODE_ENV = "production";
    process.env.AUTH_ALLOW_GOOGLE = "true";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-secret";

    const { getPublicAuthConfig } = await import("../../config/authConfig.js");
    const config = getPublicAuthConfig();

    expect(config.allowGoogle).toBe(true);
  });
});
