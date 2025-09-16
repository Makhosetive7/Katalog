import mongoose from "mongoose";
import ChapterNote from "../../model/chapterNote.js";

export const getAllNotesGrouped = async (req, res) => {
  try {
    const notes = await ChapterNote.aggregate([
      {
        $addFields: {
          bookObjectId: {
            $cond: [
              { $eq: [{ $type: "$book" }, "string"] },
              { $toObjectId: "$book" },
              "$book",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "bookObjectId",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
      // group notes by book
      {
        $group: {
          _id: "$book._id",
          bookTitle: { $first: "$book.title" },
          notes: {
            $push: {
              _id: "$_id",
              note: "$note",
              chapter: "$chapter",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $project: {
          bookTitle: 1,
          notes: { $reverseArray: "$notes" },
        },
      },
    ]);

    res.json(notes);
  } catch (err) {
    console.error("Failed to fetch grouped notes:", err);
    res.status(500).json({ error: "Failed to fetch grouped notes" });
  }
};
