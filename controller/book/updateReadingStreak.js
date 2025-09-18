import ReadingStreak from "../../model/readingStreak.js";
import Achievement from "../../model/readingAchiervements.js";

// Update reading streak
export const updateReadingStreak = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await ReadingStreak.findOne({ user: userId });

    if (!streak) {
      streak = await ReadingStreak.create({ user: userId });
    }

    const lastDate = streak.lastReadingDate
      ? new Date(streak.lastReadingDate).setHours(0, 0, 0, 0)
      : null;
    const todayTime = today.getTime();

    if (lastDate === todayTime) {
      return; // Already recorded today
    }

    // Check if reading was yesterday (maintains streak)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    if (lastDate === yesterdayTime) {
      // Consecutive day - increment streak
      streak.currentStreak += 1;
    } else if (!lastDate || lastDate < yesterdayTime) {
      // Broken streak - reset to 1
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
        streak.streakHistory.push({
          startDate: new Date(
            streak.lastReadingDate - (streak.currentStreak - 1) * 86400000
          ),
          endDate: streak.lastReadingDate,
          length: streak.currentStreak,
        });
      }
      streak.currentStreak = 1;
    }

    streak.lastReadingDate = today;
    await streak.save();

    await checkStreakAchievements(userId, streak.currentStreak);
  } catch (error) {
    console.log("Failed updating reading streak");
    console.error("Error updating reading streak:", error);
  }
};
