import User from "../../model/user/user.js";
import { sendWelcomeEmail } from "../../service/emailService/emailService.js";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Find user with the token and check if it has not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Redirect with expired/invalid status
      return res.redirect(`${process.env.CLIENT_URL}/auth/verify-email?status=expired`);
    }

    if (user.isVerified) {
      // Already verified
      return res.redirect(`${process.env.CLIENT_URL}/auth/verify-email?status=already`);
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    // Redirect with success
    return res.redirect(`${process.env.CLIENT_URL}/auth/verify-email?status=success`);
  } catch (error) {
    console.error(error);
    // Redirect to default error page
    return res.redirect(`${process.env.CLIENT_URL}/auth/verify-email?status=error`);
  }
};
