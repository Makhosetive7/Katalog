import ReadingChallenge from "../../model/readingChallange.js";
import Achievement from "../../model/readingAchiervements.js";
import Book from "../../model/book.js";

export const getReadingChallenge = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const challenge = await ReadingChallenge.findOne({
     // user: req.user.id,
      year,
    }).populate("books", "title coverImage");

    if (!challenge) {
      return res
        .status(404)
        .json({ message: "No challenge found for this year" });
    }

    res.json(challenge);
  } catch (error) {
    console.log("Failed getting reading challenge");
    res.status(500).json({ message: error.message });
  }
};
