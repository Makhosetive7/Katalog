import User from "../model/user/user.js";

const sanitize = (value) =>
  String(value || "reader")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);

export const generateUniqueUsername = async (email, firstName) => {
  const localPart = email?.split("@")[0] ?? "reader";
  const base = sanitize(firstName) || sanitize(localPart) || "reader";
  let candidate = base.slice(0, 30);
  let suffix = 0;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    const tail = String(suffix);
    candidate = `${base.slice(0, 30 - tail.length)}${tail}`;
  }

  return candidate;
};
