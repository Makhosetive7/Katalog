import { OAuth2Client } from "google-auth-library";
import User from "../../model/user/user.js";
import { generateToken } from "../../service/tokenService/tokenService.js";
import { authConfig } from "../../config/authConfig.js";
import { generateUniqueUsername } from "../../utils/generateUsername.js";
import { config } from "../../config/config.js";

const getOAuthClient = () =>
  new OAuth2Client(
    authConfig.google.clientId,
    authConfig.google.clientSecret,
    authConfig.google.callbackUrl
  );

const formatUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  isVerified: user.isVerified,
  authProvider: user.authProvider,
  profile: user.profile,
  isDemo: user.isDemo,
});

export const findOrCreateGoogleUser = async (profile) => {
  const googleId = profile.sub;
  const email = profile.email?.toLowerCase()?.trim();

  if (!email) {
    throw new Error("Google account must include an email address");
  }

  if (profile.email_verified === false) {
    throw new Error("Google account email must be verified");
  }

  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (user) {
    if (user.authProvider === "local" && !user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.isVerified = true;
    }

    if (!user.googleId) user.googleId = googleId;
    if (!user.isVerified) user.isVerified = true;

    if (profile.picture && !user.profile?.avatar) {
      user.profile = user.profile || {};
      user.profile.avatar = profile.picture;
    }

    await user.save();
    return user;
  }

  const username = await generateUniqueUsername(email, profile.given_name);

  user = await User.create({
    username,
    email,
    googleId,
    authProvider: "google",
    isVerified: true,
    profile: {
      firstName: profile.given_name || profile.name?.split(" ")?.[0] || "",
      lastName: profile.family_name || "",
      avatar: profile.picture || undefined,
    },
  });

  return user;
};

export const getAuthConfig = async (_req, res) => {
  const { getPublicAuthConfig } = await import("../../config/authConfig.js");
  res.json(getPublicAuthConfig());
};

export const googleAuthStart = (_req, res) => {
  if (!authConfig.allowGoogle) {
    return res.status(403).json({
      code: "GOOGLE_AUTH_DISABLED",
      message: "Google sign-in is not enabled",
    });
  }

  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });

  res.redirect(url);
};

export const googleAuthCallback = async (req, res) => {
  try {
    if (!authConfig.allowGoogle) {
      return res.redirect(`${config.clientUrl}/auth/login?error=google_disabled`);
    }

    const { code, error } = req.query;

    if (error || !code) {
      return res.redirect(`${config.clientUrl}/auth/login?error=google_cancelled`);
    }

    const client = getOAuthClient();
    const { tokens } = await client.getToken(String(code));

    if (!tokens.id_token) {
      return res.redirect(`${config.clientUrl}/auth/login?error=google_failed`);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: authConfig.google.clientId,
    });

    const profile = ticket.getPayload();
    const user = await findOrCreateGoogleUser(profile);
    const token = generateToken(user._id);

    const redirectUrl = new URL(`${config.clientUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set(
      "user",
      encodeURIComponent(JSON.stringify(formatUserResponse(user)))
    );

    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("Google auth callback failed:", err.message);
    res.redirect(`${config.clientUrl}/auth/login?error=google_failed`);
  }
};
