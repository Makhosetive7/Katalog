import Achievement from "../../model/readingAchiervements.js";
import Book from "../../model/book.js";
import ReadingChallenge from "../../model/readingChallange.js";
import mongoose from "mongoose";


export const checkGenreAchievement = async (userId) => {
  const genreCount = await Book.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'Completed' } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $count: 'uniqueGenres' }
  ]);

  const uniqueGenres = genreCount[0]?.uniqueGenres || 0;

  if (uniqueGenres >= 5) {
    const exists = await Achievement.findOne({
      user: userId,
      type: 'genre_explorer',
      'metadata.value': { $gte: 5 }
    });

    if (!exists) {
      await Achievement.create({
        user: userId,
        type: 'genre_explorer',
        level: uniqueGenres >= 10 ? 'gold' : 'silver',
        title: uniqueGenres >= 10 ? 'Genre Master' : 'Genre Explorer',
        description: `Read books from ${uniqueGenres} different genres`,
        metadata: { value: uniqueGenres }
      });
    }
  }
};