import User from "../../model/user/user.js";
import { sendWelcomeEmail } from "../../service/emailService/emailService.js";

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/verify-email?status=expired`
      );
    }

    if (user.isVerified) {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/verify-email?status=already`
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    await sendWelcomeEmail(user);

    return res.redirect(
      `${process.env.CLIENT_URL}/auth/verify-email?status=success`
    );
  } catch (error) {
    console.error(error);
    return res.redirect(
      `${process.env.CLIENT_URL}/auth/verify-email?status=error`
    );
  }
};
