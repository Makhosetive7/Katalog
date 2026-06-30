import User from '../../model/user/user.js';

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, readingPreferences, preferences } = req.body;

    const updates = {};

    if (firstName !== undefined) updates["profile.firstName"] = firstName;
    if (lastName !== undefined) updates["profile.lastName"] = lastName;
    if (bio !== undefined) updates["profile.bio"] = bio;
    if (readingPreferences !== undefined) {
      updates["profile.readingPreferences"] = readingPreferences;
    }
    if (preferences?.emailNotifications !== undefined) {
      updates["preferences.emailNotifications"] = preferences.emailNotifications;
    }
    if (preferences?.privacy !== undefined) {
      updates["preferences.privacy"] = preferences.privacy;
    }

    const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, {
      new: true,
      runValidators: true,
    }).select("-password -verificationToken -resetPasswordToken");

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};