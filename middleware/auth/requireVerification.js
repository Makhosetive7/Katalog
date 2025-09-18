import jwt from 'jsonwebtoken';
import User from '../../model/user/user.js';

export const requireVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email to access this feature",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};