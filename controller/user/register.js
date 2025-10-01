import User from "../../model/user/user.js";
import { generateToken } from "../../service/tokenService/tokenService.js";
import { validateRegistration } from "../../middleware/validation/validationMiddleware.js";
import { sendVerificationEmail } from "../../service/emailService/emailService.js";

export const register = async (req, res) => {
  try {
    console.log("Register attempt:", req.body);

    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username",
      });
    }

    const user = new User({
      username,
      email,
      password,
      profile: { firstName, lastName },
    });

    const verificationToken = user.generateVerificationToken();
    await user.save();

    sendVerificationEmail(user, verificationToken).catch((err) => {
      console.error("Failed to send verification email:", err.message);
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Failed registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
