import Achievement from "../../../model/readingAchiervements.js";
import Book from "../../../model/book.js";
import { checkGenreAchievement } from "./checkGenreAchievement.js";

export const checkBookAchievements = async (userId, bookId) => {
  const booksRead = await Book.countDocuments({
    user: userId,
    status: "Completed",
  });

  const bookAchievements = [
    { count: 10, level: "bronze", title: "Novice Reader" },
    { count: 25, level: "silver", title: "Bookworm" },
    { count: 50, level: "gold", title: "Bibliophile" },
    { count: 100, level: "platinum", title: "Literary Legend" },
    { count: 500, level: "platinum", title: "Library Guardian" },
  ];

  for (const achievement of bookAchievements) {
    if (booksRead === achievement.count) {
      const exists = await Achievement.findOne({
        user: userId,
        type: "books_read",
        "metadata.value": achievement.count,
      });

      if (!exists) {
        await Achievement.create({
          user: userId,
          type: "books_read",
          level: achievement.level,
          title: achievement.title,
          description: `Read ${achievement.count} books`,
          metadata: { value: achievement.count },
        });
      }
    }
  }

  await checkGenreAchievement();
  userId;
};
