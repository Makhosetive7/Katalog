import TVShow from "../../model/tvShow.js";

export const getTVShowStatistics = async (req, res) => {
  try {
    const statistics = await TVShow.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTVShows: { $sum: 1 },
          totalSeasons: { $sum: "$totalSeasons" },
          totalEpisodes: { $sum: "$totalEpisodes" },
          totalWatchTime: { 
            $sum: { 
              $multiply: ["$totalEpisodes", "$duration"] 
            } 
          },
          averageRating: { $avg: "$rating" },
          byStatus: {
            $push: {
              status: "$status",
              count: 1,
            },
          },
          byDirector: {
            $push: {
              director: "$director",
              count: 1,
            },
          },
        },
      },
      {
        $project: {
          totalTVShows: 1,
          totalSeasons: 1,
          totalEpisodes: 1,
          totalWatchTime: 1,
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
          directorCounts: {
            $reduce: {
              input: "$byDirector",
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $arrayToObject: [[{
                      k: "$$this.director",
                      v: { $add: [{ $ifNull: ["$$value.$$this.director", 0] }, "$$this.count"] }
                    }]]
                  }
                ]
              }
            }
          }
        },
      },
    ]);

    const result = statistics[0] || {
      totalTVShows: 0,
      totalSeasons: 0,
      totalEpisodes: 0,
      totalWatchTime: 0,
      averageRating: 0,
      statusCounts: {},
      directorCounts: {},
    };

    // Convert total watch time from minutes to hours
    result.totalWatchTimeHours = Math.round(result.totalWatchTime / 60);

    res.json(result);
  } catch (error) {
    console.error("Failed getting TV show statistics:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};