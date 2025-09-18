import User from '../../model/user/user.js';

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, readingPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.bio': bio,
          'profile.readingPreferences': readingPreferences
        }
      },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};