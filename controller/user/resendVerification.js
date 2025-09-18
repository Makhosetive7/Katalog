import User from '../../model/user/user.js';
import { sendVerificationEmail } from '../../service/emailService/emailService.js';

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(user, verificationToken);

    res.json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error resending verification email',
      error: error.message
    });
  }
};
