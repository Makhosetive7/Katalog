import User from "../../model/user/user.js";
import { generateToken } from "../../service/tokenService/tokenService.js";
import { validateLogin } from "../../middleware/validation/validateLogin.js";

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);

    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};
