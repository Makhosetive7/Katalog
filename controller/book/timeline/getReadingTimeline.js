import ReadingSession from "../../../model/readingSession.js";
import mongoose from "mongoose";

export const getReadingTimeline = async (req, res) => {
  try {
  //  const userId = req.user.id;
    const { limit = 20 } = req.query;

    const timeline = await ReadingSession.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(
        //  userId
        ) },
      },
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $sort: { date: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          date: 1,
          pagesRead: 1,
          readingTime: 1,
          mood: 1,
          bookTitle: "$bookDetails.title",
          bookAuthor: "$bookDetails.author",
        },
      },
    ]);

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
