import { authConfig } from "../../config/authConfig.js";

export const requireLocalAuth = (_req, res, next) => {
  if (!authConfig.allowLocal) {
    return res.status(403).json({
      code: "LOCAL_AUTH_DISABLED",
      message: "Email and password sign-in is disabled in this environment",
    });
  }
  next();
};

export const requireDemoAuth = (_req, res, next) => {
  if (!authConfig.allowDemo) {
    return res.status(403).json({
      code: "DEMO_AUTH_DISABLED",
      message: "Demo sign-in is disabled in this environment",
    });
  }
  next();
};
