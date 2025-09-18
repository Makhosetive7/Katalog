import User from '../../model/user/user.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -verificationToken -resetPasswordToken');
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user data',
      error: error.message
    });
  }
};