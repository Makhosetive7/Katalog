import { checkBookAchievements } from "./checkBookAchievements.js";
import { checkGenreAchievement } from "./checkGenreAchievement.js";
import { checkStreakAchievements } from "./checkStreakAchievements.js";
import { getUserAchievements } from "./getUserAchievements.js";
import Achievement from "../../../model/readingAchiervements.js";
import ReadingStreak from "../../../model/readingStreak.js";
import { updateReadingStreak } from "../readingStreaks/updateReadingStreak.js";

export {
  checkStreakAchievements,
  getUserAchievements,
  checkBookAchievements,
  checkGenreAchievement,
};

export const httpCheckBookAchievements = async (req, res) => {
  try {
    const bookId = req.query.bookId;
    if (bookId) await checkBookAchievements(req.userId, bookId);
    const achievements = await Achievement.find({ user: req.userId, type: "books_read" }).sort({
      earnedAt: -1,
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const httpCheckGenreAchievements = async (req, res) => {
  try {
    await checkGenreAchievement(req.userId);
    const achievements = await Achievement.find({ user: req.userId, type: "genre_explorer" }).sort({
      earnedAt: -1,
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const httpCheckStreakAchievements = async (req, res) => {
  try {
    const streak = await ReadingStreak.findOne({ user: req.userId });
    if (streak) await checkStreakAchievements(req.userId, streak.currentStreak);
    const achievements = await Achievement.find({ user: req.userId, type: "streak_length" }).sort({
      earnedAt: -1,
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};

export const httpUpdateReadingStreak = async (req, res) => {
  try {
    await updateReadingStreak(req.userId);
    const streak = await ReadingStreak.findOne({ user: req.userId });
    res.json(streak ?? { currentStreak: 0, longestStreak: 0 });
  } catch (error) {
    res.status(500).json({ code: "SERVER_ERROR", message: error.message });
  }
};
