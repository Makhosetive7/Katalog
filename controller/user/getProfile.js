import User from '../../model/user/user.js';
import ReadingAchievement from '../../model/readingAchiervements.js';
import ReadingGoal from '../../model/readingGoals.js';
import ReadingStreak from '../../model/readingStreak.js';
import Book from '../../model/book.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user
    const user = await User.findById(userId)
      .select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const achievements = await ReadingAchievement.find({ user: userId });
    const goals = await ReadingGoal.find({ user: userId });
    const streak = await ReadingStreak.findOne({ user: userId })
    const booksRead = await Book.find({ user: userId, status: "completed" }); 

    res.json({
      user,
      achievements,
      goals,
      booksRead,
      streak
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: error.message
    });
  }
};
