import User from "../../model/user/user.js";
import { sendPasswordResetEmail } from "../../service/emailService/emailService.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    res.json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password failed:", error.message);
    res.status(500).json({
      message: "Error sending password reset email",
      error: error.message,
    });
  }
};
