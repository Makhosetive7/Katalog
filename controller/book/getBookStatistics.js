import Book from "../../model/book.js";

export const getBookStatistics = async (req, res) => {
  try {
    const statistics = await Book.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } }, 
      {
        $group: {
          _id: null,
          totalBooks: { $sum: 1 },
          totalPages: { $sum: "$pages" },
          averageRating: { $avg: "$rating" },
          byStatus: {
            $push: {
              status: "$status",
              count: 1,
            },
          },
        },
      },
      {
        $project: {
          totalBooks: 1,
          totalPages: 1,
          averageRating: { $round: ["$averageRating", 1] },
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: "$byStatus",
                as: "item",
                in: {
                  k: "$$item.status",
                  v: { $sum: "$$item.count" },
                },
              },
            },
          },
        },
      },
    ]);

    const result = statistics[0] || {
      totalBooks: 0,
      totalPages: 0,
      averageRating: 0,
      statusCounts: {},
    };

    res.json(result);
  } catch (error) {
    console.error("Failed getting book statistics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};