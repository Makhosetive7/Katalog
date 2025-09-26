import jwt from "jsonwebtoken";
import User from "../../model/user/user.js";

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (user) {
          req.userId = user._id;
          req.user = user;
          req.isDemo = user.isDemo || false;
        }
      } catch (error) {
        console.error("Invalid token:", error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
