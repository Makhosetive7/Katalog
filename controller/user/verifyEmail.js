import User from "../../model/user/user.js";
import { sendWelcomeEmail } from "../../service/emailService/emailService.js";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification token expired or invalid",
      });
    }

    if (user.isVerified) {
      return res.json({ message: "Email already verified" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    sendWelcomeEmail(user).catch((err) => {
      console.error("Failed to send welcome email:", err.message);
    });

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification failed:", error);
    return res.status(500).json({ message: "Error verifying email" });
  }
};
